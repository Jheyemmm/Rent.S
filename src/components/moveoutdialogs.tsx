// MoveOutDialog.tsx
import React from 'react';
import '../components/moveoutdialog.css'; // ✅ Make sure this path is correct!

interface MoveOutDialogProps {
  onClose: () => void;
  onMoveOut: () => void;
  message: string;
}

const MoveOutDialog: React.FC<MoveOutDialogProps> = ({ onClose, onMoveOut, message }) => {
  return (
    <div className="moveout-dialog-overlay">
      <div className="moveout-dialog">
        <div className="questionmark-circle">
          <span className="questionmark">?</span>
        </div>
        <div className="confirmation-title">Are you sure?</div>
        <div className="confirmation-message">{message}</div>
        <div className="confirmation-actions">
          <button className="confirmation-no" onClick={onClose}>
            No, Go Back
          </button>
          <button className="confirmation-yes" onClick={onMoveOut}>
            Yes, Move Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveOutDialog;
