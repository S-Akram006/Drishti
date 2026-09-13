const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const PatientRecord = require('../models/PatientRecord');
const ScreeningLog = require('../models/ScreeningLog');

const router = express.Router();

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, etc.) are allowed for fundus screening.'));
    }
  }
});

/**
 * POST /api/screen
 * Ingests a fundus image and patient metadata, queries DRISHTI-AI microservice,
 * updates patient database, and logs screening evaluation.
 */
router.post('/screen', upload.single('fundusImage'), async (req, res) => {
  try {
    // 1. Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fundus image file. Please upload an image under the "fundusImage" field.'
      });
    }

    // 2. Validate patient metadata
    const {
      abhaId,
      patientName,
      age,
      gender,
      bloodGlucoseMgDl,
      operatorId,
      screenerOperatorId,
      phcId,
      phcFacilityId
    } = req.body;

    if (!abhaId || !patientName) {
      return res.status(400).json({
        success: false,
        error: 'Both "abhaId" and "patientName" are mandatory fields for patient identification.'
      });
    }

    // 3. Upsert PatientRecord in MongoDB by abhaId
    const patientData = {
      abhaId: abhaId.trim(),
      patientName: patientName.trim(),
      ...(age && { age: Number(age) }),
      ...(gender && { gender }),
      ...(bloodGlucoseMgDl && { bloodGlucoseMgDl: Number(bloodGlucoseMgDl) }),
      phcFacilityId: phcId || phcFacilityId || 'PHC-DEFAULT',
      screenerOperatorId: operatorId || screenerOperatorId || 'OPERATOR-DEFAULT'
    };

    let patient;
    try {
      patient = await PatientRecord.findOneAndUpdate(
        { abhaId: patientData.abhaId },
        { $set: patientData },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    } catch (dbErr) {
      console.warn('MongoDB upsert error (continuing with mock record if offline):', dbErr.message);
      // Fallback mock object if MongoDB is unreachable
      patient = {
        _id: new (require('mongoose').Types.ObjectId)(),
        ...patientData,
        createdAt: new Date()
      };
    }

    // 4. Forward fundus image buffer to Python microservice
    const pythonAiUrl = process.env.PYTHON_AI_URL || 'http://localhost:8000';
    const analyzeEndpoint = `${pythonAiUrl}/analyze`;

    const form = new FormData();
    form.append('fundusImage', req.file.buffer, {
      filename: req.file.originalname || 'fundus_capture.jpg',
      contentType: req.file.mimetype || 'image/jpeg'
    });

    let aiResponse;
    try {
      aiResponse = await axios.post(analyzeEndpoint, form, {
        headers: {
          ...form.getHeaders()
        },
        timeout: 45000 // 45 second timeout for deep learning inference
      });
    } catch (aiErr) {
      // Quality Gate Failure returns HTTP 400 from Python microservice
      if (aiErr.response && aiErr.response.status === 400) {
        const rejectionData = aiErr.response.data || {};
        const rejectionReason = rejectionData.reason || 'Image failed automated quality check (blurry or bad lighting).';

        // Save non-gradable screening log
        let rejectedLog;
        try {
          rejectedLog = await ScreeningLog.create({
            patientId: patient._id,
            gradable: false,
            rejectionReason: rejectionReason,
            reviewStatus: 'normal_discharged'
          });
        } catch (logErr) {
          console.warn('MongoDB log save error:', logErr.message);
          rejectedLog = { _id: 'temp_log_' + Date.now(), gradable: false, rejectionReason };
        }

        return res.status(400).json({
          success: false,
          gradable: false,
          patient: {
            id: patient._id,
            abhaId: patient.abhaId,
            patientName: patient.patientName
          },
          screeningId: rejectedLog._id,
          rejectionReason: rejectionReason,
          recapturingNotice: `[RECAPTURING REQUIRED] ${rejectionReason}. Operator instruction: Please clean lens, adjust lighting, instruct patient to hold fixation, and recapture.`
        });
      }

      // Other microservice errors (500 or unreachable)
      console.error('Python AI service communication error:', aiErr.message);
      return res.status(502).json({
        success: false,
        error: `DRISHTI-AI microservice unavailable at ${pythonAiUrl}. Details: ${aiErr.message}`
      });
    }

    // 5. Handle HTTP 200 Success from Python AI Microservice
    const {
      gradable,
      severity_grade,
      is_referable,
      confidence,
      gradcam_base64
    } = aiResponse.data;

    // Clinical rule: If referable (grade >= 2), queue for specialist review
    const reviewStatus = is_referable ? 'pending_specialist' : 'normal_discharged';

    let screeningLog;
    try {
      screeningLog = await ScreeningLog.create({
        patientId: patient._id,
        gradable: true,
        severityGrade: severity_grade,
        isReferable: is_referable,
        confidence: confidence,
        gradcamImageBase64: gradcam_base64,
        reviewStatus: reviewStatus
      });
    } catch (dbErr) {
      console.warn('MongoDB save error:', dbErr.message);
      screeningLog = {
        _id: new (require('mongoose').Types.ObjectId)(),
        patientId: patient._id,
        gradable: true,
        severityGrade: severity_grade,
        isReferable: is_referable,
        confidence: confidence,
        gradcamImageBase64: gradcam_base64,
        reviewStatus: reviewStatus,
        createdAt: new Date()
      };
    }

    // 6. Return combined clinical report
    return res.status(200).json({
      success: true,
      gradable: true,
      patient: {
        id: patient._id,
        abhaId: patient.abhaId,
        patientName: patient.patientName,
        age: patient.age,
        gender: patient.gender,
        bloodGlucoseMgDl: patient.bloodGlucoseMgDl,
        phcFacilityId: patient.phcFacilityId,
        screenerOperatorId: patient.screenerOperatorId
      },
      screening: {
        id: screeningLog._id,
        gradable: true,
        severityGrade: severity_grade,
        confidence: confidence,
        isReferable: is_referable,
        reviewStatus: reviewStatus,
        gradcamImageBase64: gradcam_base64,
        createdAt: screeningLog.createdAt
      }
    });

  } catch (error) {
    console.error('Unhandled error in /api/screen:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing screening request: ' + error.message
    });
  }
});

module.exports = router;
