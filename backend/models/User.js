const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'screener'],
    default: 'screener'
  },
  facilityId: {
    type: String,
    required: true,
    trim: true
  },
  facilityName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: '+91-98765-43210'
  },
  designation: {
    type: String,
    default: 'PHC Tele-Ophthalmology Screener'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
