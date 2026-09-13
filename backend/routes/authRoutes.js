const express = require('express');
const User = require('../models/User');
const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns role & facility profile.
 */
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Employee/Admin ID and Password are required.'
      });
    }

    const cleanId = userId.trim().toUpperCase();
    const user = await User.findOne({ userId: cleanId });

    if (!user || user.password !== password.trim()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Credentials. Please check your Employee ID and password.'
      });
    }

    // Return safe user session object
    const userProfile = {
      userId: user.userId,
      name: user.name,
      role: user.role,
      designation: user.designation,
      facilityId: user.facilityId,
      facilityName: user.facilityName,
      phone: user.phone
    };

    // Generate token for session
    const token = `drishti_session_${user._id}_${Date.now()}`;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}`,
      user: userProfile,
      token
    });
  } catch (err) {
    console.error('[AUTH ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed due to an internal server error.'
    });
  }
});

/**
 * GET /api/auth/users
 * Returns list of pre-configured accounts for demo autofill cheat-sheets.
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'userId name role designation facilityId facilityName password').sort({ role: 1, userId: 1 });
    return res.json({
      success: true,
      users
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Returns current profile from session header.
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing User ID' });
    }

    const user = await User.findOne({ userId: userId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role,
        designation: user.designation,
        facilityId: user.facilityId,
        facilityName: user.facilityName
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
