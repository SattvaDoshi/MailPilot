import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            // Simulate payment processing
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() > 0.5) {
                        resolve();
                    } else {
                        reject(new Error('Payment failed. Please try again.'));
                    }
                }, 2000);
            });

            onPaymentSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-lg font-semibold">Process Payment</h2>
            <div className="mt-4">
                <label className="block mb-2">Amount:</label>
                <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border rounded p-2 w-full"
                />
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <div className="mt-4 flex justify-end">
                <Button onClick={onClose} disabled={loading} className="mr-2">Cancel</Button>
                <Button onClick={handlePayment} disabled={loading || !amount}>
                    {loading ? 'Processing...' : 'Pay'}
                </Button>
            </div>
        </Modal>
    );
};

export default PaymentModal;