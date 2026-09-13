const User = require('./models/User');
const PatientRecord = require('./models/PatientRecord');
const ScreeningLog = require('./models/ScreeningLog');

const PRECONFIGURED_USERS = [
  {
    userId: 'ADMIN-GOV-01',
    password: 'admin@drishti2026',
    role: 'admin',
    name: 'Dr. K. Srinivas',
    designation: 'District Health Officer (DHO)',
    facilityId: 'DHO-MEDIPALLY-01',
    facilityName: 'District Health Office, Medipally',
    phone: '+91-94401-22334'
  },
  {
    userId: 'ASHA-HYD-1092',
    password: 'asha1092',
    role: 'screener',
    name: 'Sunita Devi',
    designation: 'Senior ASHA Community Screener',
    facilityId: 'PHC-MEDIPALLY',
    facilityName: 'Medipally Sub-Center PHC',
    phone: '+91-98765-11092'
  },
  {
    userId: 'ASHA-HYD-1093',
    password: 'asha1093',
    role: 'screener',
    name: 'Lakshmi Reddy',
    designation: 'PHC Health Assistant',
    facilityId: 'PHC-BODUPPAL',
    facilityName: 'Boduppal Primary Health Centre',
    phone: '+91-98765-11093'
  },
  {
    userId: 'ASHA-HYD-1094',
    password: 'asha1094',
    role: 'screener',
    name: 'Kavitha Rao',
    designation: 'ASHA Health Worker',
    facilityId: 'PHC-PEERZADIGUDA',
    facilityName: 'Peerzadiguda PHC',
    phone: '+91-98765-11094'
  },
  {
    userId: 'ASHA-HYD-1095',
    password: 'asha1095',
    role: 'screener',
    name: 'Renuka Patel',
    designation: 'Urban Health Screener',
    facilityId: 'UHP-UPPAL',
    facilityName: 'Uppal Urban Health Post',
    phone: '+91-98765-11095'
  },
  {
    userId: 'ASHA-HYD-1096',
    password: 'asha1096',
    role: 'screener',
    name: 'Padma Varma',
    designation: 'Community Health Officer',
    facilityId: 'CHC-GHATKESAR',
    facilityName: 'Ghatkesar Community Health Center',
    phone: '+91-98765-11096'
  }
];

// Historical sample patients to populate rich analytics for Admin Dashboard
const SEED_PATIENTS = [
  { abha: 'ABHA-9823-1120-9944', name: 'Ramesh Sharma', age: 52, gender: 'Male', glucose: 185, operator: 'ASHA-HYD-1092', phc: 'PHC-MEDIPALLY', grade: 2, referable: true, gradable: true },
  { abha: 'ABHA-1029-4458-1120', name: 'Suresh Patel', age: 42, gender: 'Male', glucose: 105, operator: 'ASHA-HYD-1092', phc: 'PHC-MEDIPALLY', grade: 0, referable: false, gradable: true },
  { abha: 'ABHA-6631-4092-1188', name: 'Anandi Devi', age: 61, gender: 'Female', glucose: 235, operator: 'ASHA-HYD-1093', phc: 'PHC-BODUPPAL', grade: 3, referable: true, gradable: true },
  { abha: 'ABHA-7711-2098-5542', name: 'Mohan Rao', age: 67, gender: 'Male', glucose: 268, operator: 'ASHA-HYD-1094', phc: 'PHC-PEERZADIGUDA', grade: 4, referable: true, gradable: true },
  { abha: 'ABHA-2849-5510-3391', name: 'Meera Bai', age: 49, gender: 'Female', glucose: 142, operator: 'ASHA-HYD-1095', phc: 'UHP-UPPAL', grade: 1, referable: false, gradable: true },
  { abha: 'ABHA-4412-8871-3321', name: 'Sunita Devi (Patient)', age: 46, gender: 'Female', glucose: 145, operator: 'ASHA-HYD-1096', phc: 'CHC-GHATKESAR', grade: null, referable: false, gradable: false, reason: 'Image rejected: Blurry image detected (Laplacian variance 1.07 < 80.0)' },
  { abha: 'ABHA-5521-3310-9912', name: 'Gopal Krishna', age: 55, gender: 'Male', glucose: 198, operator: 'ASHA-HYD-1092', phc: 'PHC-MEDIPALLY', grade: 2, referable: true, gradable: true },
  { abha: 'ABHA-3391-7744-2281', name: 'Fatima Begum', age: 59, gender: 'Female', glucose: 215, operator: 'ASHA-HYD-1093', phc: 'PHC-BODUPPAL', grade: 2, referable: true, gradable: true },
  { abha: 'ABHA-8812-4401-6655', name: 'Venkatesh Naidu', age: 63, gender: 'Male', glucose: 160, operator: 'ASHA-HYD-1094', phc: 'PHC-PEERZADIGUDA', grade: 0, referable: false, gradable: true },
  { abha: 'ABHA-1209-6633-8844', name: 'Shanti Kumari', age: 50, gender: 'Female', glucose: 175, operator: 'ASHA-HYD-1095', phc: 'UHP-UPPAL', grade: 1, referable: false, gradable: true },
  { abha: 'ABHA-7744-1199-3322', name: 'Narsimha Reddy', age: 68, gender: 'Male', glucose: 280, operator: 'ASHA-HYD-1096', phc: 'CHC-GHATKESAR', grade: 4, referable: true, gradable: true },
  { abha: 'ABHA-9933-2211-5577', name: 'Pushpa Rani', age: 47, gender: 'Female', glucose: 130, operator: 'ASHA-HYD-1092', phc: 'PHC-MEDIPALLY', grade: 0, referable: false, gradable: true }
];

async function seedUsers() {
  try {
    console.log('[SEED] Checking pre-configured DRISHTI-AI accounts...');
    
    for (const u of PRECONFIGURED_USERS) {
      await User.findOneAndUpdate(
        { userId: u.userId },
        { $set: u },
        { upsert: true, new: true }
      );
    }
    console.log(`[SEED] Successfully ensured ${PRECONFIGURED_USERS.length} user accounts in database.`);

    // Seed historical screenings if collection is sparse
    const logCount = await ScreeningLog.countDocuments();
    if (logCount < 10) {
      console.log('[SEED] Seeding historical patient screening data for Admin Analytics...');
      for (const p of SEED_PATIENTS) {
        const patient = await PatientRecord.findOneAndUpdate(
          { abhaId: p.abha },
          {
            $set: {
              abhaId: p.abha,
              patientName: p.name,
              age: p.age,
              gender: p.gender,
              bloodGlucoseMgDl: p.glucose,
              phcFacilityId: p.phc,
              screenerOperatorId: p.operator
            }
          },
          { upsert: true, new: true }
        );

        await ScreeningLog.create({
          patientId: patient._id,
          gradable: p.gradable,
          severityGrade: p.grade,
          isReferable: p.referable,
          confidence: p.gradable ? (p.grade >= 2 ? 88.5 : 94.2) : 0,
          rejectionReason: p.reason || null,
          reviewStatus: p.referable ? 'pending_specialist' : 'normal_discharged',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000))
        });
      }
      console.log(`[SEED] Seeded ${SEED_PATIENTS.length} historical screenings across all 5 ASHA operators.`);
    }
  } catch (err) {
    console.error('[SEED ERROR] Failed to seed users/screenings:', err.message);
  }
}

module.exports = { seedUsers, PRECONFIGURED_USERS };
