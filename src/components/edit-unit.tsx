import React, { useState } from 'react';
import './AddUnit.css'; // Same styles as before

interface EditUnitProps {
  unit: { name: string; price: number; details: string }; // Pass the unit to be edited
  closeForm: () => void;
}

const EditUnit: React.FC<EditUnitProps> = ({ unit, closeForm }) => {
  const [unitName, setUnitName] = useState(unit.name);
  const [unitPrice, setUnitPrice] = useState(unit.price.toString());
  const [unitDetails, setUnitDetails] = useState(unit.details);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Unit updated:', { unitName, unitPrice, unitDetails });
    closeForm(); // Close the form after updating
  };

  return (
    <div className="overlay" onClick={closeForm}>
      <div className="add-unit-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="form-title">Edit Unit</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Unit Number</label>
            <input
              type="text"
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
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
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

export default EditUnit;
