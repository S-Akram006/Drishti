const mongoose = require('mongoose');

const PatientRecordSchema = new mongoose.Schema(
  {
    abhaId: {
      type: String,
      required: [true, 'ABHA ID is required'],
      trim: true,
      index: true
    },
    patientName: {
      type: String,
      required: [true, 'Patient Name is required'],
      trim: true
    },
    age: {
      type: Number,
      min: 0,
      max: 130
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    bloodGlucoseMgDl: {
      type: Number,
      min: 0
    },
    phcFacilityId: {
      type: String,
      trim: true
    },
    screenerOperatorId: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PatientRecord', PatientRecordSchema);
