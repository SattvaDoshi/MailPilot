// src/config/razorpay.js
import Razorpay from 'razorpay';
import { config } from 'dotenv';

config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log(razorpayInstance);


export const createOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
      payment_capture: 1
    });
    return order;
  } catch (error) {
    throw new Error(`Order creation failed: ${error.message}`);
  }
};

export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(orderId + '|' + paymentId);
  const generatedSignature = hmac.digest('hex');
  
  return generatedSignature === signature;
};

export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    throw new Error(`Payment fetch failed: ${error.message}`);
  }
};

export default razorpayInstance;
