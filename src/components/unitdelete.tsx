import React from 'react';
import './unitdelete.css';

interface DeleteSuccessProps {
  onClose: () => void;
}

const UnitDeleteSuccess: React.FC<DeleteSuccessProps> = ({ onClose }) => {
  return (
    <div className="success-dialog-overlay">
      <div className="success-dialog">
        <div className="checkmark-circle">
          <div className="checkmark">✔</div>
        </div>
        <h2 className="success-title">Unit Deleted</h2>
        <p className="success-message">The unit has been marked as unavailable.</p>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default UnitDeleteSuccess;
