// components/SuccessDialog.tsx
import React from 'react';
import './unitsuccess.css';

interface SuccessDialogProps {
  onClose: () => void;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({ onClose }) => {
  return (
    <div className="success-dialog-overlay">
      <div className="success-dialog">
        <div className="checkmark-circle">
          <div className="checkmark">✔</div>
        </div>
        <h2 className="success-title">Unit Added Successfully</h2>
        <p className="success-message">The unit has been added to the system.</p>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SuccessDialog;
