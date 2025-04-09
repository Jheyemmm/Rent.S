import React, { useState } from 'react';
import './AddUnit.css'; // Import the custom CSS file

interface AddUnitProps {
  closeForm: () => void; // Function to close the form
}

const AddUnit: React.FC<AddUnitProps> = ({ closeForm }) => {
  const [unitName, setUnitName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [unitDetails, setUnitDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add logic for adding the unit (e.g., sending the data to the backend)
    console.log('Unit added:', { unitName, unitPrice, unitDetails });
    closeForm(); // Close the form after submission
  };

  return (
    <div className="overlay" onClick={closeForm}>
      <div className="add-unit-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="form-title">Add Unit</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Unit Number</label>
            <input
              type="text"
              placeholder="Enter Unit Number"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price</label>
            <input
              type="number"
              placeholder="Enter Unit Price"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              placeholder="Enter Unit Description"
              value={unitDetails}
              onChange={(e) => setUnitDetails(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={closeForm}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnit;
