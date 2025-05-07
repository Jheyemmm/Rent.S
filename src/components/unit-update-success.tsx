// components/UpdateSuccessDialog.tsx
import React from 'react';
import './unitsuccess.css'; // Uses the same styles as the previous success dialog

interface UpdateSuccessDialogProps {
  onClose: () => void;
}

const UpdateSuccessDialog: React.FC<UpdateSuccessDialogProps> = ({ onClose }) => {
  return (
    <div className="success-dialog-overlay">
      <div className="success-dialog">
        <div className="checkmark-circle">
          <span className="checkmark">✓</span>
        </div>
        <div className="success-title">Update Complete</div>
        <div className="success-message">Room details have been successfully updated.</div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default UpdateSuccessDialog;
