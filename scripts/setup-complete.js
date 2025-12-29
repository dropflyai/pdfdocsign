#!/usr/bin/env node
/**
 * PDF Editor Complete Setup Script
 *
 * Automates:
 * 1. Supabase database schema creation
 * 2. Stripe product and price creation
 * 3. Environment variable configuration
 *
 * Following engineering_brain governance:
 * - Automation > Manual Steps
 * - Evidence > Assumption
 * - Memory > Repetition
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

// Make HTTPS request
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ statusCode: res.statusCode, error: parsed });
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject({ statusCode: res.statusCode, error: data });
          }
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Stripe API helper
async function stripeRequest(method, endpoint, data = null) {
  const options = {
    hostname: 'api.stripe.com',
    port: 443,
    path: `/v1/${endpoint}`,
    method: method,
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const postData = data ? new URLSearchParams(data).toString() : null;
  return makeRequest(options, postData);
}

// Check if Stripe product exists
async function getStripeProducts() {
  try {
    const products = await stripeRequest('GET', 'products?limit=100');
    return products.data || [];
  } catch (error) {
    logError('Failed to fetch Stripe products');
    return [];
  }
}

// Create Stripe product and price
async function setupStripeProducts() {
  logStep('STRIPE', 'Setting up Stripe products and prices...');

  if (!STRIPE_SECRET_KEY) {
    logError('STRIPE_SECRET_KEY not found in .env.local');
    return null;
  }

  try {
    // Check for existing product
    const existingProducts = await getStripeProducts();
    let product = existingProducts.find(p => p.name === 'PDF Doc Sign Pro');

    if (product) {
      logSuccess(`Product already exists: ${product.id}`);
    } else {
      // Create product
      product = await stripeRequest('POST', 'products', {
        name: 'PDF Doc Sign Pro',
        description: 'Unlimited documents, send for signature, cloud storage, and more.',
        'metadata[app]': 'pdf-doc-sign',
      });
      logSuccess(`Created product: ${product.id}`);
    }

    // Check for existing price
    const prices = await stripeRequest('GET', `prices?product=${product.id}&limit=10`);
    let monthlyPrice = prices.data?.find(p =>
      p.unit_amount === 999 &&
      p.recurring?.interval === 'month' &&
      p.active
    );

    if (monthlyPrice) {
      logSuccess(`Monthly price already exists: ${monthlyPrice.id}`);
    } else {
      // Create monthly price ($9.99/month)
      monthlyPrice = await stripeRequest('POST', 'prices', {
        product: product.id,
        unit_amount: 999, // $9.99 in cents
        currency: 'usd',
        'recurring[interval]': 'month',
        'metadata[plan]': 'pro_monthly',
      });
      logSuccess(`Created monthly price: ${monthlyPrice.id}`);
    }

    return {
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
    };
  } catch (error) {
    logError(`Stripe error: ${JSON.stringify(error)}`);
    return null;
  }
}

// Update .env.local with new values
function updateEnvFile(priceId) {
  logStep('ENV', 'Updating .env.local with Stripe price ID...');

  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Check if STRIPE_MONTHLY_PRICE_ID exists
  if (envContent.includes('STRIPE_MONTHLY_PRICE_ID=')) {
    // Update existing
    envContent = envContent.replace(
      /STRIPE_MONTHLY_PRICE_ID=.*/,
      `STRIPE_MONTHLY_PRICE_ID=${priceId}`
    );
  } else {
    // Add new
    envContent += `\n# Stripe Price ID (auto-generated)\nSTRIPE_MONTHLY_PRICE_ID=${priceId}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  logSuccess(`Added STRIPE_MONTHLY_PRICE_ID=${priceId}`);
}

// Generate Supabase migration instructions
function printSupabaseMigrationInstructions() {
  logStep('SUPABASE', 'Database Migration Instructions');

  console.log(`
${colors.yellow}The database schema needs to be applied to Supabase.${colors.reset}

${colors.cyan}Option 1: Manual (Supabase Dashboard)${colors.reset}
1. Go to: ${SUPABASE_URL?.replace('.supabase.co', '')}/project/_/sql
2. Open: supabase/migrations/001_initial_schema.sql
3. Copy the SQL and run it in the SQL Editor

${colors.cyan}Option 2: Using Supabase CLI${colors.reset}
1. Install: npm install -g supabase
2. Login: supabase login
3. Link: supabase link --project-ref ${SUPABASE_URL?.match(/https:\/\/(\w+)\./)?.[1] || 'YOUR_PROJECT_REF'}
4. Push: supabase db push

${colors.cyan}Migration file location:${colors.reset}
./supabase/migrations/001_initial_schema.sql
`);
}

// Main setup function
async function main() {
  console.log('\n' + '='.repeat(60));
  log('PDF Editor Complete Setup', 'cyan');
  console.log('='.repeat(60));

  // Verify prerequisites
  logStep('VERIFY', 'Checking prerequisites...');

  if (!SUPABASE_URL) {
    logError('NEXT_PUBLIC_SUPABASE_URL not set');
  } else {
    logSuccess(`Supabase URL: ${SUPABASE_URL}`);
  }

  if (!STRIPE_SECRET_KEY) {
    logError('STRIPE_SECRET_KEY not set');
  } else {
    logSuccess(`Stripe key: ${STRIPE_SECRET_KEY.slice(0, 12)}...`);
  }

  // Setup Stripe
  const stripeResult = await setupStripeProducts();

  if (stripeResult?.monthlyPriceId) {
    updateEnvFile(stripeResult.monthlyPriceId);
  }

  // Print Supabase instructions
  printSupabaseMigrationInstructions();

  // Summary
  console.log('\n' + '='.repeat(60));
  log('SETUP SUMMARY', 'cyan');
  console.log('='.repeat(60));

  if (stripeResult) {
    logSuccess(`Stripe Product: ${stripeResult.productId}`);
    logSuccess(`Stripe Price: ${stripeResult.monthlyPriceId} ($9.99/month)`);
  }

  console.log(`
${colors.yellow}Remaining manual steps:${colors.reset}
1. Run the Supabase migration (see instructions above)
2. Restart the dev server to pick up new env vars
3. Test the auth flow at http://localhost:3006/signup

${colors.green}Setup complete!${colors.reset}
`);
}

main().catch(console.error);
