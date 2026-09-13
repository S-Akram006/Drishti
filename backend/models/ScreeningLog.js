const mongoose = require('mongoose');

const ScreeningLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientRecord',
      required: [true, 'Associated Patient ID is required'],
      index: true
    },
    gradable: {
      type: Boolean,
      required: true
    },
    rejectionReason: {
      type: String,
      default: null
    },
    severityGrade: {
      type: Number,
      min: 0,
      max: 4,
      default: null
    },
    isReferable: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    gradcamImageBase64: {
      type: String,
      default: null
    },
    reviewStatus: {
      type: String,
      enum: ['pending_specialist', 'normal_discharged', 'referred_district_hospital'],
      default: 'normal_discharged',
      index: true
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    specialistNotes: {
      type: String,
      default: null
    },
    overriddenSeverityGrade: {
      type: Number,
      min: 0,
      max: 4,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ScreeningLog', ScreeningLogSchema);
