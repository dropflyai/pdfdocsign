const { chromium } = require('playwright');
const fs = require('fs');

async function runMigration() {
  console.log('🚀 Supabase Migration Runner');
  console.log('════════════════════════════════════════════════════════════════\n');

  const sqlFile = './supabase/migrations/003_audit_logs.sql';
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');
  console.log('📄 SQL file loaded:', sqlFile);
  console.log('📏 SQL length:', sqlContent.length, 'characters\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('🌐 Opening Supabase SQL Editor...');
    await page.goto('https://supabase.com/dashboard/project/yesrpsjbyprllqokqzzo/sql/new');
    await page.waitForLoadState('networkidle');

    const currentURL = page.url();
    if (currentURL.includes('login') || currentURL.includes('sign-in')) {
      console.log('\n⚠️  Login required - please login in the browser window');
      console.log('📋 Press ENTER here when logged in and at SQL Editor...\n');
      await new Promise(resolve => process.stdin.once('data', () => resolve()));
      await page.waitForURL('**/sql/**', { timeout: 60000 });
    }

    console.log('⏳ Waiting for SQL editor...');
    await page.waitForSelector('.monaco-editor', { timeout: 15000 });
    console.log('✅ SQL Editor ready\n');

    await page.click('.monaco-editor');
    await page.waitForTimeout(500);
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Delete');
    await page.waitForTimeout(300);

    console.log('📝 Pasting SQL...');
    await page.keyboard.type(sqlContent, { delay: 0 });
    console.log('✅ SQL pasted\n');

    const runButton = await page.locator('button:has-text("Run")').first();
    if (await runButton.count() > 0) {
      console.log('🚀 Executing SQL...');
      await runButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ DONE! Check browser for results');
      console.log('⏸️  Browser stays open 30s...');
      await page.waitForTimeout(30000);
    } else {
      console.log('⚠️  Click Run manually. Browser stays open 60s...');
      await page.waitForTimeout(60000);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.waitForTimeout(60000);
  } finally {
    await browser.close();
  }
}

runMigration().catch(console.error);
