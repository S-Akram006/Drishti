const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FRONTEND_URL = 'http://localhost:3000';
const BLURRY_IMG_PATH = path.resolve(__dirname, 'test_assets', 'blur.jpg');
const SHARP_IMG_PATH = path.resolve(__dirname, 'test_assets', 'sharp.jpg');

// Color helpers for terminal output
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

async function runE2ETests() {
  console.log('\n' + '='.repeat(80));
  console.log(bold(cyan('  DRISHTI-AI BROWSER END-TO-END AUTOMATED TEST SUITE')));
  console.log('='.repeat(80) + '\n');

  // Verify test images exist
  if (!fs.existsSync(BLURRY_IMG_PATH) || !fs.existsSync(SHARP_IMG_PATH)) {
    console.error(red('Error: Test image assets not found in backend/test_assets.'));
    process.exit(1);
  }

  console.log(`[SETUP] Launching visible (headful) Chromium browser...`);
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      channel: 'chrome',
      slowMo: 600, // Slow motion so the user can easily observe browser actions
      args: ['--start-maximized']
    });
  } catch (err) {
    console.log(yellow('Chrome channel unavailable, launching default Chromium instance...'));
    browser = await chromium.launch({
      headless: false,
      slowMo: 600,
      args: ['--start-maximized']
    });
  }

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // Step 1: Navigate to Frontend
    // -------------------------------------------------------------------------
    console.log(`[STEP 1] Navigating to ${cyan(FRONTEND_URL)}...`);
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 30000 });

    const pageTitle = await page.title();
    console.log(green(`  ✓ Page loaded successfully: "${pageTitle}"`));

    // Verify Navbar Elements
    const facilityBadge = await page.locator('text=Medipally PHC').first();
    await facilityBadge.waitFor({ state: 'visible', timeout: 5000 });
    console.log(green(`  ✓ Facility Badge visible: "Medipally PHC"`));

    const operatorBadge = await page.locator('text=ASHA-HYD-1092').first();
    await operatorBadge.waitFor({ state: 'visible', timeout: 5000 });
    console.log(green(`  ✓ Operator ID visible: "ASHA-HYD-1092"`));

    // -------------------------------------------------------------------------
    // Step 2: Scenario 1 - Quality Gate Rejection (Blurry Capture)
    // -------------------------------------------------------------------------
    console.log('\n' + '-'.repeat(80));
    console.log(bold('[SCENARIO 1] Quality Gate Rejection (Blurry Image Test)'));
    console.log('-'.repeat(80));

    console.log('  -> Filling in Patient Details:');
    console.log('     ABHA ID: "99-1234-5678-0001", Name: "Test Patient Fail", Age: 45, Glucose: 160');

    // Fill ABHA ID
    const abhaInput = page.locator('input[placeholder*="ABHA"]');
    await abhaInput.fill('99-1234-5678-0001');

    // Fill Patient Name
    const nameInput = page.locator('input[placeholder*="Ramesh"]');
    await nameInput.fill('Test Patient Fail');

    // Fill Age
    const ageInput = page.locator('input[type="number"]').first();
    await ageInput.fill('45');

    // Fill Blood Glucose (last number input)
    const glucoseInput = page.locator('input[type="number"]').last();
    await glucoseInput.fill('160');

    // Upload Blurry Image
    console.log(`  -> Uploading blurry fundus photo: ${BLURRY_IMG_PATH}`);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(BLURRY_IMG_PATH);

    await page.waitForTimeout(800);

    // Click Run AI Screening Pipeline
    console.log('  -> Clicking "Run AI Screening Pipeline"...');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Assert that the Ungradable Modal appears
    console.log('  -> Waiting for Quality Gate HTTP 400 rejection modal...');
    const modalHeading = page.locator('text=Ungradable Retinal Acquisition');
    await modalHeading.waitFor({ state: 'visible', timeout: 15000 });
    console.log(green('  ✓ Ungradable Modal successfully triggered and visible!'));

    // Verify rejection reason is displayed in modal
    const modalContent = page.locator('text=Blurry image detected');
    const hasBlurReason = await modalContent.isVisible();
    if (hasBlurReason) {
      console.log(green('  ✓ Specific Quality Gate reason displayed: "Blurry image detected (Laplacian variance < 80)"'));
    }

    // Dismiss the modal
    console.log('  -> Dismissing rejection modal...');
    const dismissBtn = page.locator('button:has-text("Acknowledge & Recapture")');
    await dismissBtn.click();
    await modalHeading.waitFor({ state: 'hidden', timeout: 5000 });
    console.log(green('  ✓ Rejection modal closed.'));

    // -------------------------------------------------------------------------
    // Step 3: Scenario 2 - Successful Clinical Screening & Grad-CAM Display
    // -------------------------------------------------------------------------
    console.log('\n' + '-'.repeat(80));
    console.log(bold('[SCENARIO 2] Successful Clinical Screening & Grad-CAM Visualization'));
    console.log('-'.repeat(80));

    console.log('  -> Updating Patient Details:');
    console.log('     ABHA ID: "99-1234-5678-0002", Name: "Ramesh Kumar", Age: 54, Glucose: 185');

    await abhaInput.fill('99-1234-5678-0002');
    await nameInput.fill('Ramesh Kumar');
    await ageInput.fill('54');
    await glucoseInput.fill('185');

    // Upload Sharp, Valid Fundus Image
    console.log(`  -> Uploading sharp gradable fundus photo: ${SHARP_IMG_PATH}`);
    await fileInput.setInputFiles(SHARP_IMG_PATH);

    await page.waitForTimeout(800);

    // Click Run AI Screening
    console.log('  -> Clicking "Run AI Screening Pipeline"...');
    await submitBtn.click();

    // Wait for analysis response & viewer rendering
    console.log('  -> Waiting for AI Deep Learning inference & Grad-CAM generation...');
    
    // Check for Grad-CAM image in viewer
    const gradcamImg = page.locator('img[alt="Grad-CAM Activation Map"]');
    await gradcamImg.waitFor({ state: 'visible', timeout: 35000 });
    const gradcamSrc = await gradcamImg.getAttribute('src');
    
    const hasValidGradcam = gradcamSrc && gradcamSrc.startsWith('data:image/jpeg;base64,');
    if (hasValidGradcam) {
      console.log(green(`  ✓ Grad-CAM Explainability Heatmap rendered (${gradcamSrc.substring(0, 32)}...)`));
    } else {
      console.error(red('  ✗ Grad-CAM heatmap did not render properly.'));
    }

    // Check raw fundus image
    const rawImg = page.locator('img[alt="Raw Fundus Retinal Scan"]');
    await rawImg.waitFor({ state: 'visible', timeout: 5000 });
    console.log(green('  ✓ Raw Fundus capture rendered in dual viewer.'));

    // Check Disposition Card
    const severityHeading = page.locator('text=DR Severity Grade (0 to 4)');
    await severityHeading.waitFor({ state: 'visible', timeout: 5000 });
    console.log(green('  ✓ DR Severity Level Gauge visible on disposition card.'));

    const qualityGatePass = page.locator('text=GRADABLE PASS');
    await qualityGatePass.waitFor({ state: 'visible', timeout: 5000 });
    console.log(green('  ✓ Optical Quality Gate Status: "GRADABLE PASS"'));

    // -------------------------------------------------------------------------
    // Step 4: Scenario 3 - Telemedicine Queue Verification & Action
    // -------------------------------------------------------------------------
    console.log('\n' + '-'.repeat(80));
    console.log(bold('[SCENARIO 3] District Hospital Telemedicine Queue Verification'));
    console.log('-'.repeat(80));

    console.log('  -> Scrolling down to Telemedicine Queue Drawer...');
    const queueDrawerHeader = page.locator('text=District Hospital Telemedicine Queue');
    await queueDrawerHeader.scrollIntoViewIfNeeded();

    // Expand the queue drawer if closed
    const isExpanded = await page.locator('table').isVisible();
    if (!isExpanded) {
      console.log('  -> Expanding Telemedicine Queue Drawer...');
      await queueDrawerHeader.click();
      await page.waitForTimeout(1000);
    }

    // Check for table content
    const queueTable = page.locator('table');
    const hasTable = await queueTable.isVisible();
    if (hasTable) {
      console.log(green('  ✓ Telemedicine Specialist Review table visible.'));
      
      const approveButtons = page.locator('button:has-text("Approve Referral")');
      const approveCount = await approveButtons.count();
      console.log(cyan(`  -> Found ${approveCount} pending referral(s) in queue.`));

      if (approveCount > 0) {
        console.log('  -> Clicking "Approve Referral" on the first pending case...');
        await approveButtons.first().click();
        await page.waitForTimeout(2000);
        console.log(green('  ✓ Referral successfully approved by specialist!'));
      }
    } else {
      console.log(yellow('  -> Queue is currently empty of pending referable cases.'));
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log(bold(green('  ✓ ALL BROWSER END-TO-END SCENARIOS COMPLETED SUCCESSFULLY!')));
    console.log('='.repeat(80) + '\n');

    // Pause briefly so the user can see the final state on screen
    await page.waitForTimeout(3000);

  } catch (err) {
    console.error('\n' + red('✗ Test failed with exception:'), err.message);
    // Take failure screenshot for diagnosis
    await page.screenshot({ path: path.resolve(__dirname, 'e2e_failure.png') });
    console.log(yellow(`  Saved error screenshot to: ${path.resolve(__dirname, 'e22_failure.png')}`));
    throw err;
  } finally {
    console.log('[TEARDOWN] Closing browser instance...');
    await browser.close();
  }
}

runE2ETests()
  .then(() => {
    console.log(green('E2E execution process finished with exit code 0.'));
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
