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
        <h2 className="success-title">Tenant added successfully.</h2>
        <p className="success-message">click here to go back to dashboard</p>
        <button className="close-button" onClick={onClose}>View Tenants</button>
      </div>
    </div>
  );
};

export default SuccessDialog;