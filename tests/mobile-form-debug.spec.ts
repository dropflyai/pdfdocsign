import { test, expect, devices } from '@playwright/test';

test.describe('Mobile PDF Form Field Debugging', () => {
  test.use({
    ...devices['iPhone 13 Pro'],
    // Enable logging
    launchOptions: {
      args: ['--enable-logging']
    }
  });

  test('debug form field visibility on mobile', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });

    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    console.log('✅ Page loaded');

    // Upload a PDF with form fields (you'll need to have a test PDF)
    const fileInput = page.locator('input[type="file"]');

    // For now, let's just check if we can see the upload area
    await expect(fileInput).toBeVisible();
    console.log('✅ File input is visible');

    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/mobile-initial.png', fullPage: true });
    console.log('📸 Screenshot saved: mobile-initial.png');

    // Check for any form fields on the page
    const formFields = await page.locator('input[data-field-id]').count();
    console.log(`📊 Found ${formFields} form field inputs on page`);

    // Check for annotations
    const annotations = await page.locator('[data-annotation]').count();
    console.log(`📊 Found ${annotations} annotation elements on page`);

    // Get page dimensions
    const viewportSize = page.viewportSize();
    console.log(`📐 Viewport size: ${JSON.stringify(viewportSize)}`);

    // Check if React app loaded
    const hasReactRoot = await page.locator('#__next, [data-reactroot], #root').count();
    console.log(`⚛️  React root elements: ${hasReactRoot}`);

    // Log any errors
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`❌ Page error: ${error.message}`);
    });

    // Wait a bit for any async loading
    await page.waitForTimeout(2000);

    // Final screenshot
    await page.screenshot({ path: 'tests/screenshots/mobile-after-wait.png', fullPage: true });
    console.log('📸 Screenshot saved: mobile-after-wait.png');

    // Report
    console.log('\n=== MOBILE DEBUG REPORT ===');
    console.log(`Form Fields: ${formFields}`);
    console.log(`Annotations: ${annotations}`);
    console.log(`Errors: ${errors.length}`);
    console.log('===========================\n');
  });

  test('test form field interaction with sample PDF', async ({ page, context }) => {
    // Grant permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    page.on('console', msg => {
      if (msg.text().includes('annotation') || msg.text().includes('field') || msg.text().includes('📄') || msg.text().includes('✅')) {
        console.log(`[BROWSER]:`, msg.text());
      }
    });

    await page.goto('http://localhost:3000');

    // Create a simple test PDF with form field
    // For now, let's just see what happens when we try to upload
    const samplePdfPath = 'tests/fixtures/sample-form.pdf';

    // Check if file exists
    const fs = require('fs');
    if (fs.existsSync(samplePdfPath)) {
      console.log('✅ Sample PDF found');

      await page.setInputFiles('input[type="file"]', samplePdfPath);

      // Wait for PDF to load
      await page.waitForTimeout(3000);

      // Take screenshot
      await page.screenshot({ path: 'tests/screenshots/mobile-with-pdf.png', fullPage: true });

      // Count form fields
      const formFields = await page.locator('input[data-field-id]').count();
      console.log(`📊 Form fields visible: ${formFields}`);

      // Check annotations state via console
      const annotationsCount = await page.evaluate(() => {
        // @ts-ignore
        return window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.size || 0;
      });
      console.log(`⚛️  React renderers: ${annotationsCount}`);

      // Try to find any input elements
      const allInputs = await page.locator('input').count();
      console.log(`📝 Total input elements on page: ${allInputs}`);

      // Get visible inputs
      const visibleInputs = await page.locator('input:visible').count();
      console.log(`👁️  Visible input elements: ${visibleInputs}`);

    } else {
      console.log('⚠️  No sample PDF found at', samplePdfPath);
      console.log('   Please add a sample PDF with form fields for testing');
    }
  });
});
