import React, { useState } from 'react';
import MoveOutDialog from './moveoutdialogs'; // ✅ Make sure path is correct
import './moveout.css';

interface FormData {
  name: string;
  lastName: string;
  unit: string;
  email: string;
  unpaidBalance: string;
  startDate: string;
  endDate: string;
}

interface MoveOutModalProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: Partial<FormData>;
}

const getToday = () => {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

export const MoveOutModal: React.FC<MoveOutModalProps> = ({ onClose, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState<FormData>({
    name: initialData.name || '',
    lastName: initialData.lastName || '',
    unit: initialData.unit || '',
    email: initialData.email || '',
    unpaidBalance: initialData.unpaidBalance || '₱0.00',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || getToday(),
  });

  const [showDialog, setShowDialog] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDialog(true);
  };

  const handleMoveOut = () => {
    onSubmit(formData);
    setShowDialog(false);
    onClose();
  };

  return (
    <>
      <div className="moveout-modal-overlay">
        <div className="moveout-modal-container">
          <h2>Move-out Tenant</h2>
          <form onSubmit={handleSubmit}>
            <div className="moveout-form-row">
              <div className="moveout-form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="moveout-form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
            </div>

            <div className="moveout-form-row">
              <div className="moveout-form-group">
                <label>Assign unit</label>
                <input type="text" name="unit" value={formData.unit} onChange={handleChange} />
              </div>
              <div className="moveout-form-group">
                <label>Unpaid balance</label>
                <input type="text" name="unpaidBalance" value={formData.unpaidBalance} disabled />
              </div>
            </div>

            <div className="moveout-form-row">
              <div className="moveout-form-group">
                <label>Start Date</label>
                <input type="text" name="startDate" value={formData.startDate} onChange={handleChange} />
              </div>
              <div className="moveout-form-group">
                <label>End Date</label>
                <input type="text" name="endDate" value={formData.endDate} onChange={handleChange} />
              </div>
            </div>

            <div className="moveout-modal-actions">
              <button type="button" className="moveout-modal-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="moveout-modal-submit-btn">
                Move Out
              </button>
            </div>
          </form>
        </div>
      </div>

      {showDialog && (
        <MoveOutDialog
          onClose={() => setShowDialog(false)}
          onMoveOut={handleMoveOut}
          message="This action cannot be undone. Proceed to move out this tenant?"
        />
      )}
    </>
  );
};
  