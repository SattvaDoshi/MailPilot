// src/components/subscription/PaymentModal.jsx
import React, { useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const PaymentModal = ({ open, onClose, order }) => {
  useEffect(() => {
    if (!open || !order) return;
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: 'MailPilot',
      handler: (resp) => {
        order.onSuccess(resp);
        onClose();
      },
      modal: { ondismiss: onClose },
    });
    rzp.open();
  }, [open, order, onClose]);

  return (
    <Modal isOpen={open} onClose={onClose} title="Processing Payment">
      <p className="py-8 text-center">Opening Razorpay Checkout…</p>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default PaymentModal;
