// components/PaymentUpdateSuccessDialog.tsx
import React from 'react';
import './paymentsuccess.css'; // Add styles for the success dialog, same as your previous one

interface PaymentUpdateSuccessDialogProps {
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function PaymentUpdateSuccessDialog({title, message, onClose}: PaymentUpdateSuccessDialogProps) {
  return (
    <div className="success-dialog-overlay">
      <div className="success-dialog">
        <div className="checkmark-circle">
          <span className="checkmark">✓</span>
        </div>
        <div className="success-title">{title}</div>
        <div className="success-message">{message}</div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}


