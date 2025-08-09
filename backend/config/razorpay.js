import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createOrder = async (options) => {
  try {
    return await razorpayInstance.orders.create(options);
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const crypto = require('crypto');
  const sign = orderId + '|' + paymentId;
  const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest('hex');
  
  return signature === expectedSign;
};

export const getPaymentDetails = async (paymentId) => {
  try {
    return await razorpayInstance.payments.fetch(paymentId);
  } catch (error) {
    throw new Error(`Failed to fetch payment details: ${error.message}`);
  }
};

export default razorpayInstance;
