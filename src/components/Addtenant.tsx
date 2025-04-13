import React from 'react';
import './Addtenant.css';

interface AddTenantModalProps {
  onClose: () => void;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ onClose }) => {
  return (
    <div className="addtenant-modal-overlay" onClick={onClose}>
      <div className="addtenant-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="addtenant-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="addtenant-form-container">
          <h1 className="addtenant-form-title">Add Tenant</h1>

          <div className="addtenant-form-section">
            <h2>Tenant Details</h2>
            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>First Name</label>
                <input type="text" className="addtenant-form-input" />
              </div>
              <div className="addtenant-form-group">
                <label>Last Name</label>
                <input type="text" className="addtenant-form-input" />
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Phone Number</label>
                <input type="tel" className="addtenant-form-input" />
              </div>
              <div className="addtenant-form-group">
                <label>Email</label>
                <input type="email" className="addtenant-form-input" />
              </div>
            </div>
          </div>

          <div className="addtenant-form-section">
            <h2>Assign unit</h2>
            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Unit number</label>
                <input type="text" className="addtenant-form-input" />
              </div>
              <div className="addtenant-form-group">
                <label>Move in date</label>
                <input type="date" className="addtenant-form-input" placeholder="dd/mm/yyyy" />
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Price</label>
                <input type="number" className="addtenant-form-input" />
              </div>
              <div className="addtenant-form-group"></div>
            </div>
          </div>

          <div className="addtenant-form-actions">
            <button type="button" className="addtenant-clear-btn">Clear</button>
            <button type="submit" className="addtenant-submit-btn">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};
