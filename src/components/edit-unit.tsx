import React, { useState } from 'react';
import './AddUnit.css';
import supabase from '../supabaseClient';

interface EditUnitProps {
  unit: { 
    unitID: number; 
    number: string; 
    price: number; 
    details: string;
    status?: string;
  };
  closeForm: () => void;
  refreshUnits: () => void;
  onSuccess: () => void; // ✅ Trigger success
}

const EditUnit: React.FC<EditUnitProps> = ({ unit, closeForm, refreshUnits, onSuccess }) => {
  const [unitName, setUnitName] = useState(unit.number);
  const [unitPrice, setUnitPrice] = useState(unit.price.toString());
  const [unitDetails, setUnitDetails] = useState(unit.details);
  const [unitStatus, setUnitStatus] = useState(unit.status || 'Available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnitStatus(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const { error } = await supabase
      .from('Units')
      .update({
        Price: parseFloat(unitPrice),
        Description: unitDetails,
        UnitNumber: unitName,
        UnitStatus: unitStatus
      })
      .eq('UnitID', unit.unitID);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await refreshUnits();
    setLoading(false);
    onSuccess(); // ✅ show success dialog
    closeForm(); // ✅ close form
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
          <div className="form-group">
            <label className="form-label">Status</label>
            {unitStatus === "Unavailable" ? (
              <select
                value={unitStatus}
                onChange={handleStatusChange}
                className="form-input"
                required
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            ) : (
              <input
                type="text"
                value={unitStatus}
                className="form-input"
                readOnly
              />
            )}
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
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Submit'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default EditUnit;
