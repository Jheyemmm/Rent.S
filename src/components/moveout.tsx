import React, { useState } from 'react';
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

// Get today's date in MM/DD/YY format
const getToday = () => {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yy = String(today.getFullYear()).slice(-2);
  return `${mm}/${dd}/${today.getFullYear()}`;
};

export const MoveOutModal: React.FC<MoveOutModalProps> = ({ onClose, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState<FormData>({
    name: initialData.name || 'John',
    lastName: initialData.lastName || 'Smith',
    unit: initialData.unit || '201',
    email: initialData.email || '',
    unpaidBalance: initialData.unpaidBalance || '₱0.00',
    startDate: initialData.startDate || '09/25/24',
    endDate: initialData.endDate || getToday(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
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
              <input type="text" name="unpaidBalance" value={formData.unpaidBalance} onChange={handleChange} disabled />
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
            <button type="button" className="moveout-modal-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="moveout-modal-submit-btn">Move out</button>
          </div>
        </form>
      </div>
    </div>
  );
};
