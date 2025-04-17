import React, { useState } from 'react';
import './AddUnit.css'; // Same styles as before
import supabase from '../supabaseClient';

interface EditUnitProps {
  unit: { unitID: number; number: string; price: number; details: string }; // Pass the unit to be edited
  closeForm: () => void;
  refreshUnits: () => void;
}

const EditUnit: React.FC<EditUnitProps> = ({ unit, closeForm, refreshUnits }) => {
  const [unitName, setUnitName] = useState(unit.number);
  const [unitPrice, setUnitPrice] = useState(unit.price.toString());
  const [unitDetails, setUnitDetails] = useState(unit.details);
  const [loading, setLoading] = useState(false); // For loading state
  const [error, setError] = useState<string | null>(null); // For error handling

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // to prevent submitting if loading or there is an error
    if (loading) return; 
    setLoading(true); // start loading

    const { data, error } = await supabase
    .from('Units')
    .update({
      Price: parseFloat(unitPrice),
      Description: unitDetails,
      UnitNumber: unitName
    })
    .eq('UnitID', unit.unitID);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }


    console.log('Unit updated:', { unitName, unitPrice, unitDetails });

    await refreshUnits();
    setLoading(false);
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
function refreshUnits() {
  throw new Error('Function not implemented.');
}

