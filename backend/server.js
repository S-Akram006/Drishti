require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const screenRoutes = require('./routes/screenRoutes');
const telemedicineRoutes = require('./routes/telemedicineRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { seedUsers } = require('./seedUsers');

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/drishti_telemedicine';

// Middleware
app.use(cors({
  origin: true, // Dynamically reflect request origin (including *.vercel.app, preview URLs, and localhost)
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[DRISHTI-GATEWAY] Connected to MongoDB Atlas/Database successfully.`);
    // Seed system users & historical analytics data
    await seedUsers();
  } catch (err) {
    console.warn(`[DRISHTI-GATEWAY] Warning: MongoDB connection failed: ${err.message}`);
    console.warn(`[DRISHTI-GATEWAY] Gateway is running in hybrid mode. Provide valid MONGODB_URI to persist to Atlas.`);
  }
};

connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'DRISHTI-AI Telemedicine Gateway',
    version: '1.0.0',
    description: 'Express.js API Gateway interfacing with Python AI Microservice, MongoDB Atlas, and Admin Analytics',
    endpoints: {
      auth: 'POST /api/auth/login, GET /api/auth/users',
      admin: 'GET /api/admin/stats',
      screen: 'POST /api/screen',
      telemedicineQueue: 'GET /api/telemedicine/queue',
      specialistReview: 'PATCH /api/telemedicine/review/:id',
      health: 'GET /health'
    }
  });
});

// Gateway Health Endpoint
app.get('/health', async (req, res) => {
  let aiStatus = 'unreachable';
  try {
    const aiRes = await axios.get(`${PYTHON_AI_URL}/health`, { timeout: 3000 });
    aiStatus = aiRes.data.status || 'healthy';
  } catch (err) {
    aiStatus = `error: ${err.message}`;
  }

  const mongoStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbStatus = mongoStates[mongoose.connection.readyState] || 'unknown';

  res.json({
    status: 'healthy',
    service: 'DRISHTI-AI-Gateway',
    port: PORT,
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'none'
    },
    pythonMicroservice: {
      url: PYTHON_AI_URL,
      status: aiStatus
    },
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', screenRoutes);
app.use('/api/telemedicine', telemedicineRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[DRISHTI-GATEWAY ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` DRISHTI-AI Express Gateway listening on port ${PORT}`);
    console.log(` Python AI Microservice linked at: ${PYTHON_AI_URL}`);
    console.log(` API Docs & Screening Ingestion at: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
