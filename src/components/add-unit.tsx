import React, { useState } from 'react';
import './AddUnit.css'; 
import supabase from '../supabaseClient';

interface AddUnitProps {
  closeForm: () => void; 
  refreshUnits: () => void;
  onSuccess: () => void;  // New prop for success callback
}

const AddUnit: React.FC<AddUnitProps> = ({ closeForm, refreshUnits, onSuccess }) => {
  const [unitNumber, setUnitNumber] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [unitDetails, setUnitDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('You must be logged in to add a unit.');
        return;
      }

      const { error: insertError } = await supabase.from('Units').insert([{
        UnitNumber: unitNumber.trim(),
        Price: Number(unitPrice.trim()),
        Description: unitDetails.trim(),
        UnitStatus: 'Available',
        UserID: user.id,
      }]);

      if (insertError) {
        setError(insertError.message);
      } else {
        refreshUnits();
        onSuccess();  // Trigger success dialog
        closeForm();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={closeForm}>
      <div className="add-unit-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="form-title">Add Unit</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <label className="form-label">Unit Number</label>
            <input
              type="text"
              placeholder="Enter Unit Number"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
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
            <button type="button" className="cancel-btn" onClick={closeForm}>
              Cancel
            </button>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnit;
