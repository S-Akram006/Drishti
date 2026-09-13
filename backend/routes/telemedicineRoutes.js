const express = require('express');
const mongoose = require('mongoose');
const ScreeningLog = require('../models/ScreeningLog');
const PatientRecord = require('../models/PatientRecord');

const router = express.Router();

/**
 * GET /api/telemedicine/queue
 * Retrieves all triage screenings marked as 'pending_specialist',
 * sorted by newest first for district ophthalmologist clinical review.
 */
router.get('/queue', async (req, res) => {
  try {
    let queueItems = [];
    try {
      queueItems = await ScreeningLog.find({ reviewStatus: 'pending_specialist' })
        .sort({ createdAt: -1 })
        .populate('patientId', 'abhaId patientName age gender bloodGlucoseMgDl phcFacilityId screenerOperatorId');
    } catch (dbErr) {
      console.warn('MongoDB query warning (falling back if offline):', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      count: queueItems.length,
      queue: queueItems
    });
  } catch (error) {
    console.error('Error fetching telemedicine queue:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve telemedicine queue: ' + error.message
    });
  }
});

/**
 * PATCH /api/telemedicine/review/:id
 * Allows an ophthalmologist to confirm/override the AI severity grade,
 * add clinical notes, and transition reviewStatus (e.g. to 'referred_district_hospital').
 */
router.patch('/review/:id', async (req, res) => {
  const { id } = req.params;
  const { reviewStatus, overriddenSeverityGrade, specialistNotes } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid screening record ID format: "${id}". Must be a valid MongoDB ObjectId.`
      });
    }

    // Validate reviewStatus enum if provided
    const validStatuses = ['pending_specialist', 'normal_discharged', 'referred_district_hospital'];
    if (reviewStatus && !validStatuses.includes(reviewStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid reviewStatus "${reviewStatus}". Allowed values are: ${validStatuses.join(', ')}.`
      });
    }

    // Build update object
    const updateFields = {
      reviewedAt: new Date()
    };

    if (reviewStatus) {
      updateFields.reviewStatus = reviewStatus;
    }
    if (overriddenSeverityGrade !== undefined && overriddenSeverityGrade !== null) {
      const grade = Number(overriddenSeverityGrade);
      if (grade < 0 || grade > 4 || isNaN(grade)) {
        return res.status(400).json({
          success: false,
          error: 'overriddenSeverityGrade must be an integer between 0 and 4.'
        });
      }
      updateFields.overriddenSeverityGrade = grade;
    }
    if (specialistNotes !== undefined) {
      updateFields.specialistNotes = specialistNotes;
    }

    let updatedLog = await ScreeningLog.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('patientId', 'abhaId patientName age gender');

    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        error: `Screening log with ID "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Telemedicine review successfully submitted.',
      screening: updatedLog
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update telemedicine review: ' + error.message
    });
  }
});

module.exports = router;
