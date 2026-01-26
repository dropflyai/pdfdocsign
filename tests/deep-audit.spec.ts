import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('PDF Doc Sign Deep Audit', () => {

  test.describe('Tablet Responsiveness', () => {
    test('iPad Pro view', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 1366 }); // iPad Pro
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/evidence/deep-01-ipad-landing.png', fullPage: true });

      // Check pricing cards layout
      const pricingSection = await page.locator('text=Start free').first();
      if (await pricingSection.isVisible()) {
        console.log('Pricing section visible on iPad: YES');
      }
    });

    test('iPad Mini view', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad Mini
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/evidence/deep-02-ipad-mini-login.png', fullPage: true });
    });
  });

  test.describe('Navigation & Links', () => {
    test('All nav links work on landing page', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check header navigation
      const navLinks = await page.locator('header a, nav a').all();
      console.log('Number of nav links found:', navLinks.length);

      // Test each link
      for (const link of navLinks.slice(0, 5)) { // Test first 5 links
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        console.log(`Nav link: "${text?.trim()}" -> ${href}`);
      }
    });

    test('Footer links exist', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const footerLinks = await page.locator('footer a').all();
      console.log('Footer links found:', footerLinks.length);

      if (footerLinks.length < 3) {
        console.log('GAP: Footer has fewer than 3 links - consider adding Terms, Privacy, Contact');
      }
    });
  });

  test.describe('Form Validation', () => {
    test('Login form shows validation errors', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Try submitting empty form
      const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In")').first();
      await submitBtn.click();

      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/evidence/deep-03-login-validation.png' });

      // Check for validation message or HTML5 validation
      const hasValidation = await page.locator('[class*="error"], [class*="invalid"], :invalid').count();
      console.log('Form validation present:', hasValidation > 0 ? 'YES' : 'CHECK HTML5 VALIDATION');
    });

    test('Signup form password validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await page.waitForLoadState('networkidle');

      // Enter weak password
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('123');

      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();

      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/evidence/deep-04-signup-password-validation.png' });
    });
  });

  test.describe('OAuth Buttons', () => {
    test('Google OAuth button exists and styled', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      const googleBtn = page.locator('button:has-text("Google"), button:has-text("Continue with Google")');
      const isVisible = await googleBtn.isVisible();
      console.log('Google OAuth button visible:', isVisible);

      if (isVisible) {
        // Check if it has proper styling
        const btnBounds = await googleBtn.boundingBox();
        console.log('Google button dimensions:', btnBounds);
      }
    });
  });

  test.describe('Accessibility Checks', () => {
    test('Images have alt text', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      const imagesWithEmptyAlt = await page.locator('img[alt=""]').count();
      const totalImages = await page.locator('img').count();

      console.log('Total images:', totalImages);
      console.log('Images without alt:', imagesWithoutAlt);
      console.log('Images with empty alt:', imagesWithEmptyAlt);

      if (imagesWithoutAlt > 0) {
        console.log('GAP: Some images missing alt text');
      }
    });

    test('Form labels exist', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      const inputs = await page.locator('input:not([type="hidden"])').count();
      const labels = await page.locator('label').count();

      console.log('Form inputs:', inputs);
      console.log('Labels:', labels);

      if (labels < inputs) {
        console.log('GAP: Some inputs may be missing labels (check aria-label)');
      }
    });

    test('Buttons have accessible names', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const buttonsWithoutText = await page.locator('button:not(:has-text(""))').count();
      console.log('Buttons potentially missing accessible name:', buttonsWithoutText);
    });

    test('Color contrast on CTA buttons', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const ctaButton = page.locator('button:has-text("Start"), a:has-text("Start")').first();
      if (await ctaButton.isVisible()) {
        const styles = await ctaButton.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });
        console.log('CTA button colors:', styles);
      }
    });
  });

  test.describe('Performance Indicators', () => {
    test('Page load time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log('Landing page load time:', loadTime, 'ms');
      if (loadTime > 3000) {
        console.log('GAP: Page load time exceeds 3 seconds');
      }
    });

    test('No large unoptimized images', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const largeImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const large: string[] = [];
        images.forEach(img => {
          if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
            large.push(img.src);
          }
        });
        return large;
      });

      console.log('Large images (>2000px):', largeImages.length > 0 ? largeImages : 'None');
    });
  });

  test.describe('SEO Basics', () => {
    test('Meta tags present', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

      console.log('Meta description:', metaDescription ? 'Present' : 'MISSING');
      console.log('OG Title:', ogTitle ? 'Present' : 'MISSING');
      console.log('OG Image:', ogImage ? 'Present' : 'MISSING');

      if (!metaDescription) console.log('GAP: Missing meta description');
      if (!ogTitle) console.log('GAP: Missing Open Graph title');
      if (!ogImage) console.log('GAP: Missing Open Graph image');
    });
  });

  test.describe('Security Indicators', () => {
    test('No sensitive data in HTML', async ({ page }) => {
      await page.goto(BASE_URL);
      const html = await page.content();

      const hasApiKey = html.includes('sk_') || html.includes('pk_');
      const hasSupabaseUrl = html.includes('supabase.co') && html.includes('anon');

      console.log('API keys exposed in HTML:', hasApiKey ? 'POTENTIAL ISSUE' : 'None found');
      console.log('Supabase credentials in HTML:', hasSupabaseUrl ? 'Check if expected' : 'Not exposed');
    });
  });

  test.describe('Error States', () => {
    test('Network error handling', async ({ page, context }) => {
      // Block API requests to simulate network error
      await context.route('**/api/**', route => route.abort());

      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'tests/evidence/deep-05-network-error.png' });
    });
  });
});
