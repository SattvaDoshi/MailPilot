// src/utils/constants.js
export const SUBSCRIPTION_LIMITS = {
  free: {
    emailLimit: 20,
    groupLimit: 2,
    price: 0
  },
  basic: {
    emailLimit: 100,
    groupLimit: 5,
    price: 199
  },
  premium: {
    emailLimit: 500,
    groupLimit: 15,
    price: 399
  },
  unlimited: {
    emailLimit: -1, // -1 means unlimited
    groupLimit: -1,
    price: 799
  }
};

export const RAZORPAY_PLANS = {
  basic: 'plan_basic_monthly',
  premium: 'plan_premium_monthly',
  unlimited: 'plan_unlimited_monthly'
};
