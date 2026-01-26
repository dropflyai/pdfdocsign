import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('Verify Bug Fixes', () => {

  test('Login input text is visible (dark mode fix)', async ({ page }) => {
    // Emulate dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Type in the email field
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');

    // Take screenshot to verify text is visible
    await page.screenshot({ path: 'tests/evidence/fix-01-login-dark-mode.png' });

    // Check that the input has the correct text color class
    const inputClasses = await emailInput.getAttribute('class');
    console.log('Email input classes:', inputClasses);
    expect(inputClasses).toContain('text-gray-900');
    expect(inputClasses).toContain('bg-white');
  });

  test('Signup input text is visible (dark mode fix)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[type="text"]');
    await nameInput.fill('John Doe');

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');

    await page.screenshot({ path: 'tests/evidence/fix-02-signup-dark-mode.png' });

    const inputClasses = await emailInput.getAttribute('class');
    expect(inputClasses).toContain('text-gray-900');
  });

  test('Custom 404 page exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page-xyz123`);
    await page.waitForLoadState('networkidle');

    // Should show our custom 404, not Next.js default
    const pageContent = await page.textContent('body');
    const hasCustom404 = pageContent?.includes('Page not found') ||
                         pageContent?.includes('Go home');

    console.log('Custom 404 page:', hasCustom404 ? 'YES' : 'NO - Still default');

    await page.screenshot({ path: 'tests/evidence/fix-03-custom-404.png' });

    expect(hasCustom404).toBe(true);
  });

  test('Open Graph meta tags present', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

    console.log('OG Title:', ogTitle);
    console.log('OG Description:', ogDescription);
    console.log('OG Image:', ogImage);

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
  });

  test('Viewport export works (no deprecation)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check that viewport meta tag exists
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    console.log('Viewport meta:', viewportMeta);

    expect(viewportMeta).toContain('width=device-width');
  });
});
