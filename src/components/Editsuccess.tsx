import React from 'react';
import './unitsuccess.css'; // Reuse the existing styles

interface UpdateSuccessDialogProps {
  onClose: () => void;
  title?: string;
  message?: string; 
  type?: 'edit' | 'delete'  ; // Optional prop to specify the type of message
}

export default function UpdateSuccessDialog({onClose, title, message, type}: UpdateSuccessDialogProps) 
 {
  return (
    <div className="success-dialog-overlay">
      <div className="success-dialog">
        <div className="checkmark-circle">
        {type === 'edit' ? (
            <span className="checkmark">✓</span>
          ) : type === 'delete' ? (
            <span className="delete-icon">✗</span> // Example delete icon
          ) : null}
        </div>
        <div className="success-title">{title}</div>
        <div className="success-message">{message}</div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};


