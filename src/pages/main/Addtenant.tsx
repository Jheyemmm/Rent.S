import React from 'react';
import './Addtenant.css';

const AddTenantForm: React.FC = () => {
  return (
    <div className="form-container">
      <h1 className="form-title">Add Tenant</h1>
      
      <div className="form-section">
        <h2>Tenant Details</h2>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" className="form-input" />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" className="form-input" />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" className="form-input" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Assign unit</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Unit number</label>
            <input type="text" className="form-input" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-input" placeholder="dd/mm/yyyy" />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Price</label>
            <input type="number" className="form-input" />
          </div>
          <div className="form-group"></div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="clear-btn">Clear</button>
        <button type="submit" className="submit-btn">Submit</button>
      </div>
    </div>
  );
};

export default AddTenantForm;