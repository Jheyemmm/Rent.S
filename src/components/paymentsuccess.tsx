// components/SuccessModal.tsx
import React, { useState } from 'react';
import './paymentsuccess.css';

interface SuccessModalProps {
  onClose: () => void;
  onViewPayment: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onClose, onViewPayment }) => {
  const [checkColor, setCheckColor] = useState<string>('#28a745'); // Default green color

  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <div className="checkmark-circle" style={{ borderColor: checkColor }}>
          <div className="checkmark" style={{ color: checkColor }}>
            ✔
          </div>
        </div>
        <h2 className="success-title">Payment Successful</h2>
        <p className="success-message">You’ve successfully added the payment.</p>
        <p className="success-link" onClick={onClose}>
          click <span style={{ color: '#007BFF', cursor: 'pointer' }}>here</span> to go back to dashboard
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <button className="view-payment-btn" onClick={onClose}>
            View Payment
          </button>
          <button className="receipt-btn" onClick={onViewPayment}>
            Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
