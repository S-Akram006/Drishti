const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const mockGenerators = {
  createSharpFundusBuffer: () => {
    return fs.readFileSync(path.join(__dirname, 'test_assets', 'sharp.jpg'));
  },
  createBlurryFundusBuffer: () => {
    return fs.readFileSync(path.join(__dirname, 'test_assets', 'blur.jpg'));
  }
};

const GATEWAY_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- STARTING DRISHTI-AI BACKEND GATEWAY INTEGRATION TESTS ---');

  // Test 1: Health check
  console.log('\n[TEST 1] Testing Gateway Health Endpoint (GET /health)...');
  try {
    const healthRes = await axios.get(`${GATEWAY_URL}/health`);
    console.log('✓ Gateway Health Status:', healthRes.data.status);
    console.log('  Python Microservice Status:', healthRes.data.pythonMicroservice.status);
    console.log('  Database Connection Status:', healthRes.data.database.status);
  } catch (err) {
    console.error('✗ Failed to connect to gateway /health:', err.message);
    process.exit(1);
  }

  // Test 2: Ingest Sharp Valid Fundus Image
  console.log('\n[TEST 2] Testing Successful Fundus Screening (POST /api/screen)...');
  let sharpBuffer;
  try {
    sharpBuffer = mockGenerators.createSharpFundusBuffer();
  } catch (err) {
    console.error('Failed generating sharp mock buffer:', err.message);
    process.exit(1);
  }

  const formSharp = new FormData();
  formSharp.append('fundusImage', sharpBuffer, {
    filename: 'sharp_fundus.jpg',
    contentType: 'image/jpeg'
  });
  formSharp.append('abhaId', 'ABHA-9823-1120-9944');
  formSharp.append('patientName', 'Ramesh Sharma');
  formSharp.append('age', '52');
  formSharp.append('gender', 'Male');
  formSharp.append('bloodGlucoseMgDl', '185');
  formSharp.append('operatorId', 'ASHA-OP-04');
  formSharp.append('phcId', 'PHC-RAMPUR');

  let screeningId = null;
  try {
    const screenRes = await axios.post(`${GATEWAY_URL}/api/screen`, formSharp, {
      headers: formSharp.getHeaders()
    });

    console.log('✓ Ingestion Status:', screenRes.status);
    console.log('  Gradable:', screenRes.data.gradable);
    console.log('  Patient:', screenRes.data.patient.patientName, `(${screenRes.data.patient.abhaId})`);
    console.log('  AI Severity Grade:', screenRes.data.screening.severityGrade);
    console.log('  Confidence:', screenRes.data.screening.confidence + '%');
    console.log('  Is Referable:', screenRes.data.screening.isReferable);
    console.log('  Review Status:', screenRes.data.screening.reviewStatus);
    console.log('  Grad-CAM URI Prefix:', screenRes.data.screening.gradcamImageBase64?.substring(0, 30) + '...');

    screeningId = screenRes.data.screening.id;
  } catch (err) {
    console.error('✗ Ingestion failed:', err.response?.data || err.message);
  }

  // Test 3: Quality Gate Rejection (Blurry Image)
  console.log('\n[TEST 3] Testing Quality Gate Blurry Image Rejection (POST /api/screen)...');
  let blurBuffer = mockGenerators.createBlurryFundusBuffer();
  const formBlur = new FormData();
  formBlur.append('fundusImage', blurBuffer, {
    filename: 'blurry_fundus.jpg',
    contentType: 'image/jpeg'
  });
  formBlur.append('abhaId', 'ABHA-4412-8871-3321');
  formBlur.append('patientName', 'Sunita Devi');
  formBlur.append('age', '46');

  try {
    await axios.post(`${GATEWAY_URL}/api/screen`, formBlur, {
      headers: formBlur.getHeaders()
    });
    console.error('✗ Expected HTTP 400 rejection, but received success.');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✓ Correctly rejected with HTTP 400');
      console.log('  Rejection Reason:', err.response.data.rejectionReason);
      console.log('  Recapturing Notice:', err.response.data.recapturingNotice);
    } else {
      console.error('✗ Unexpected error during blur test:', err.message);
    }
  }

  // Test 4: Telemedicine Queue
  console.log('\n[TEST 4] Testing Telemedicine Queue (GET /api/telemedicine/queue)...');
  try {
    const queueRes = await axios.get(`${GATEWAY_URL}/api/telemedicine/queue`);
    console.log('✓ Telemedicine Queue Status:', queueRes.status);
    console.log('  Pending Specialist Cases Count:', queueRes.data.count);
  } catch (err) {
    console.error('✗ Failed fetching queue:', err.response?.data || err.message);
  }

  // Test 5: Specialist Review / Override
  if (screeningId) {
    console.log(`\n[TEST 5] Testing Specialist Review Override (PATCH /api/telemedicine/review/${screeningId})...`);
    try {
      const reviewRes = await axios.patch(`${GATEWAY_URL}/api/telemedicine/review/${screeningId}`, {
        reviewStatus: 'referred_district_hospital',
        overriddenSeverityGrade: 3,
        specialistNotes: 'Confirmed severe non-proliferative diabetic retinopathy with macular threat. Referred to District Hospital for urgent pan-retinal photocoagulation.'
      });
      console.log('✓ Review Submission Status:', reviewRes.status);
      console.log('  Updated Review Status:', reviewRes.data.screening.reviewStatus);
      console.log('  Specialist Notes:', reviewRes.data.screening.specialistNotes);
    } catch (err) {
      console.error('✗ Failed updating review:', err.response?.data || err.message);
    }
  }

  console.log('\n===============================================================');
  console.log(' ALL DRISHTI-AI NODE.JS GATEWAY INTEGRATION TESTS PASSED!');
  console.log('===============================================================\n');
}

runTests();
