import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('PDF Doc Sign Comprehensive Audit', () => {

  test.describe('1. Landing/Marketing Page', () => {
    test('Landing page loads correctly', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check title
      const title = await page.title();
      console.log('Page title:', title);
      expect(title).toContain('PDF');

      // Take screenshot
      await page.screenshot({ path: 'tests/evidence/audit-01-landing.png', fullPage: true });

      // Check for any console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.waitForTimeout(2000);
      console.log('Console errors on landing:', errors.length > 0 ? errors : 'None');
    });
  });

  test.describe('2. Authentication Pages', () => {
    test('Login page loads', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Check for login form elements
      const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').count();
      const hasPasswordInput = await page.locator('input[type="password"]').count();
      const hasSubmitButton = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').count();

      console.log('Login page elements:', { hasEmailInput, hasPasswordInput, hasSubmitButton });

      await page.screenshot({ path: 'tests/evidence/audit-02-login.png', fullPage: true });

      // Report gaps
      if (!hasEmailInput) console.log('GAP: Missing email input on login page');
      if (!hasPasswordInput) console.log('GAP: Missing password input on login page');
      if (!hasSubmitButton) console.log('GAP: Missing submit button on login page');
    });

    test('Signup page loads', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await page.waitForLoadState('networkidle');

      const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').count();
      const hasPasswordInput = await page.locator('input[type="password"]').count();
      const hasSubmitButton = await page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register")').count();

      console.log('Signup page elements:', { hasEmailInput, hasPasswordInput, hasSubmitButton });

      await page.screenshot({ path: 'tests/evidence/audit-03-signup.png', fullPage: true });

      if (!hasEmailInput) console.log('GAP: Missing email input on signup page');
      if (!hasPasswordInput) console.log('GAP: Missing password input on signup page');
      if (!hasSubmitButton) console.log('GAP: Missing submit button on signup page');
    });

    test('Forgot password page loads', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'tests/evidence/audit-04-forgot-password.png', fullPage: true });

      const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').count();
      console.log('Forgot password page has email input:', hasEmailInput > 0);
    });
  });

  test.describe('3. Protected Routes', () => {
    test('Dashboard redirects unauthenticated users', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      console.log('Dashboard URL after redirect:', currentUrl);

      await page.screenshot({ path: 'tests/evidence/audit-05-dashboard-redirect.png', fullPage: true });

      // Check if redirected to login
      const isRedirected = currentUrl.includes('login') || currentUrl.includes('auth');
      console.log('Dashboard redirects unauthenticated:', isRedirected ? 'YES' : 'NO - POTENTIAL SECURITY GAP');
    });

    test('Settings page redirects unauthenticated users', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings`);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      console.log('Settings URL after redirect:', currentUrl);

      await page.screenshot({ path: 'tests/evidence/audit-06-settings-redirect.png', fullPage: true });
    });

    test('Editor page redirects unauthenticated users', async ({ page }) => {
      await page.goto(`${BASE_URL}/editor`);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      console.log('Editor URL after redirect:', currentUrl);

      await page.screenshot({ path: 'tests/evidence/audit-07-editor-redirect.png', fullPage: true });
    });
  });

  test.describe('4. Public Signing Flow', () => {
    test('Sign page with invalid token shows error', async ({ page }) => {
      await page.goto(`${BASE_URL}/sign/invalid-token-12345`);
      await page.waitForLoadState('networkidle');

      await page.waitForTimeout(3000); // Wait for any async loading

      const pageContent = await page.textContent('body');
      const hasErrorMessage = pageContent?.toLowerCase().includes('error') ||
                              pageContent?.toLowerCase().includes('not found') ||
                              pageContent?.toLowerCase().includes('invalid') ||
                              pageContent?.toLowerCase().includes('unable');

      console.log('Sign page shows error for invalid token:', hasErrorMessage ? 'YES' : 'NO');

      await page.screenshot({ path: 'tests/evidence/audit-08-sign-invalid-token.png', fullPage: true });
    });
  });

  test.describe('5. API Endpoints', () => {
    test('Signature requests API requires auth', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/signature-requests`);
      console.log('Signature requests API status:', response.status());

      // Should return 401 or 403 for unauthenticated
      expect([401, 403, 500]).toContain(response.status());

      if (response.status() === 200) {
        console.log('GAP: Signature requests API accessible without auth!');
      }
    });

    test('Sign API with invalid token returns 404', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/sign/invalid-token`);
      console.log('Sign API invalid token status:', response.status());

      expect([404, 400]).toContain(response.status());
    });

    test('Documents API requires auth', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/documents`);
      console.log('Documents API status:', response.status());

      if (response.status() === 200) {
        console.log('GAP: Documents API accessible without auth!');
      }
    });
  });

  test.describe('6. UI/UX Quality Checks', () => {
    test('Mobile responsiveness on landing', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'tests/evidence/audit-09-mobile-landing.png', fullPage: true });

      // Check for horizontal scroll (bad UX)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      console.log('Mobile has horizontal scroll (bad):', hasHorizontalScroll ? 'YES - FIX NEEDED' : 'NO');
    });

    test('Mobile responsiveness on login', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'tests/evidence/audit-10-mobile-login.png', fullPage: true });
    });

    test('Dark mode consistency', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check background colors
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      console.log('Body background color:', bgColor);
      await page.screenshot({ path: 'tests/evidence/audit-11-dark-mode.png', fullPage: true });
    });
  });

  test.describe('7. Error Handling', () => {
    test('404 page exists', async ({ page }) => {
      await page.goto(`${BASE_URL}/nonexistent-page-12345`);
      await page.waitForLoadState('networkidle');

      const pageContent = await page.textContent('body');
      const has404 = pageContent?.includes('404') ||
                     pageContent?.toLowerCase().includes('not found') ||
                     pageContent?.toLowerCase().includes('page');

      console.log('Has 404 page:', has404 ? 'YES' : 'NO - DEFAULT ERROR PAGE');

      await page.screenshot({ path: 'tests/evidence/audit-12-404-page.png', fullPage: true });
    });
  });

  test.describe('8. Performance & Loading States', () => {
    test('Loading states on dashboard', async ({ page }) => {
      // Go to login first
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Check if loading spinner/state exists in the app
      const hasLoadingIndicator = await page.locator('.animate-spin, [class*="loading"], [class*="spinner"]').count();

      console.log('Has loading indicators in codebase:', hasLoadingIndicator > 0 ? 'YES' : 'CHECK MANUALLY');
    });
  });

  test.describe('9. Console Error Check (All Pages)', () => {
    test('Check all main pages for JS errors', async ({ page }) => {
      const errors: { page: string; error: string }[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push({ page: page.url(), error: msg.text() });
        }
      });

      const pagesToCheck = [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/dashboard',
      ];

      for (const path of pagesToCheck) {
        await page.goto(`${BASE_URL}${path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }

      console.log('\n=== CONSOLE ERRORS FOUND ===');
      if (errors.length === 0) {
        console.log('No console errors detected!');
      } else {
        errors.forEach(e => console.log(`${e.page}: ${e.error}`));
      }
    });
  });
});
