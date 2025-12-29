import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

// Price IDs - these should be created in Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly', // Update with actual price ID
  yearly: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly',   // Update with actual price ID
};
