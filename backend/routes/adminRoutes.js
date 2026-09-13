const express = require('express');
const User = require('../models/User');
const PatientRecord = require('../models/PatientRecord');
const ScreeningLog = require('../models/ScreeningLog');
const router = express.Router();

/**
 * GET /api/admin/stats
 * Comprehensive Government Oversight Analytics:
 * - Aggregate KPIs
 * - Per-Operator Performance Table
 * - Patient Screening Audit Log
 */
router.get('/stats', async (req, res) => {
  try {
    // 1. Fetch all screening logs populated with patient details
    const logs = await ScreeningLog.find()
      .populate('patientId')
      .sort({ createdAt: -1 })
      .lean();

    // 2. Compute Aggregate KPIs
    const totalScreenings = logs.length;
    let referableCount = 0;
    let ungradableCount = 0;
    let normalCount = 0;
    const gradeDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

    logs.forEach((log) => {
      if (!log.gradable) {
        ungradableCount++;
      } else {
        if (log.severityGrade !== null && log.severityGrade !== undefined) {
          gradeDistribution[log.severityGrade] = (gradeDistribution[log.severityGrade] || 0) + 1;
        }
        if (log.isReferable || (log.severityGrade !== null && log.severityGrade >= 2)) {
          referableCount++;
        } else {
          normalCount++;
        }
      }
    });

    const gradableCount = totalScreenings - ungradableCount;
    const referralRate = gradableCount > 0 ? ((referableCount / gradableCount) * 100).toFixed(1) : 0;
    const qualityPassRate = totalScreenings > 0 ? (((totalScreenings - ungradableCount) / totalScreenings) * 100).toFixed(1) : 100;

    // 3. Compute Per-Operator Metrics
    const screeners = await User.find({ role: 'screener' }).sort({ userId: 1 }).lean();

    const operatorMetrics = screeners.map((op) => {
      // Find all logs by this operator
      const opLogs = logs.filter((log) => {
        const patient = log.patientId;
        return patient && patient.screenerOperatorId === op.userId;
      });

      const opGrades = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
      let opUngradable = 0;
      let opReferable = 0;
      let lastActive = null;

      opLogs.forEach((log) => {
        if (!lastActive || new Date(log.createdAt) > new Date(lastActive)) {
          lastActive = log.createdAt;
        }

        if (!log.gradable) {
          opUngradable++;
        } else {
          if (log.severityGrade !== null && log.severityGrade !== undefined) {
            opGrades[log.severityGrade] = (opGrades[log.severityGrade] || 0) + 1;
          }
          if (log.isReferable || (log.severityGrade !== null && log.severityGrade >= 2)) {
            opReferable++;
          }
        }
      });

      return {
        operatorId: op.userId,
        name: op.name,
        designation: op.designation,
        facilityId: op.facilityId,
        facilityName: op.facilityName,
        phone: op.phone,
        totalScans: opLogs.length,
        gradableScans: opLogs.length - opUngradable,
        ungradableScans: opUngradable,
        referableCases: opReferable,
        referralRate: (opLogs.length - opUngradable) > 0 
          ? ((opReferable / (opLogs.length - opUngradable)) * 100).toFixed(1) 
          : 0,
        gradeBreakdown: opGrades,
        lastActive: lastActive || op.createdAt
      };
    });

    // 4. Clean format for recent patient logs table
    const patientAuditLogs = logs.slice(0, 50).map((log) => {
      const p = log.patientId || {};
      return {
        screeningId: log._id,
        abhaId: p.abhaId || 'ABHA-UNTAGGED',
        patientName: p.patientName || 'Anonymous Patient',
        age: p.age || '--',
        gender: p.gender || '--',
        bloodGlucoseMgDl: p.bloodGlucoseMgDl || '--',
        screenerOperatorId: p.screenerOperatorId || 'UNASSIGNED',
        phcFacilityId: p.phcFacilityId || 'PHC-DEFAULT',
        severityGrade: log.severityGrade,
        isReferable: log.isReferable,
        gradable: log.gradable,
        rejectionReason: log.rejectionReason,
        confidence: log.confidence || 0,
        reviewStatus: log.reviewStatus || (log.isReferable ? 'pending_specialist' : 'normal_discharged'),
        createdAt: log.createdAt
      };
    });

    return res.json({
      success: true,
      timestamp: new Date(),
      kpis: {
        totalScreenings,
        referableCount,
        ungradableCount,
        normalCount,
        referralRate: Number(referralRate),
        qualityPassRate: Number(qualityPassRate),
        activeScreenersCount: screeners.length,
        gradeDistribution
      },
      operatorMetrics,
      patientAuditLogs
    });
  } catch (err) {
    console.error('[ADMIN STATS ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate administrative analytics: ' + err.message
    });
  }
});

/**
 * POST /api/admin/create-staff
 * Admin-only onboarding endpoint for new PHC screeners / ASHA employees
 */
router.post('/create-staff', async (req, res) => {
  try {
    const { 
      operatorId, 
      fullName, 
      name, 
      facilityName, 
      facilityId, 
      phone, 
      password, 
      role = 'screener',
      designation = 'ASHA Tele-Ophthalmology Screener'
    } = req.body;

    const finalUserId = (operatorId || '').trim().toUpperCase();
    const finalName = (fullName || name || '').trim();
    const finalFacilityName = (facilityName || '').trim();
    const finalPassword = (password || '').trim();

    if (!finalUserId || !finalName || !finalFacilityName || !finalPassword) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: operatorId, fullName, facilityName, and password are required.'
      });
    }

    // Check if operatorId already exists
    const existingUser = await User.findOne({ userId: finalUserId });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `Operator ID ${finalUserId} is already registered to ${existingUser.name}.`
      });
    }

    // Generate clean facilityId if not provided
    const cleanFacilityId = facilityId || ('PHC-' + finalFacilityName.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 16));

    const newUser = new User({
      userId: finalUserId,
      name: finalName,
      facilityName: finalFacilityName,
      facilityId: cleanFacilityId,
      phone: phone || '+91-98765-00000',
      password: finalPassword,
      role: role || 'screener',
      designation: designation
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: `Staff operator ${finalUserId} (${finalName}) successfully registered.`,
      operator: {
        userId: newUser.userId,
        name: newUser.name,
        role: newUser.role,
        facilityId: newUser.facilityId,
        facilityName: newUser.facilityName,
        phone: newUser.phone,
        designation: newUser.designation,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('[CREATE STAFF ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create staff account: ' + err.message
    });
  }
});

module.exports = router;
