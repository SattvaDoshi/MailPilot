import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const processPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/payments`, paymentData);
        return response.data;
    } catch (error) {
        throw new Error('Payment processing failed: ' + error.message);
    }
};

export const getPaymentHistory = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/payments/history/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch payment history: ' + error.message);
    }
};