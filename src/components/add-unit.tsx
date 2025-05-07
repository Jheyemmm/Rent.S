import React, { useState } from 'react';
import './AddUnit.css'; 
import supabase from '../supabaseClient';

interface AddUnitProps {
  closeForm: () => void; 
  refreshUnits: () => void;
  onSuccess: () => void;
}

const AddUnit: React.FC<AddUnitProps> = ({ closeForm, refreshUnits, onSuccess }) => {
  const [unitNumber, setUnitNumber] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [unitDetails, setUnitDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    unitNumber?: string;
  }>({});
  const [priceError, setPriceError] = useState<string | null>(null);

  const validateUnitNumber = (value: string): boolean => {
    if (!/^\d+$/.test(value.trim())) {
      setValidationErrors(prev => ({...prev, unitNumber: "Unit number must contain only digits"}));
      return false;
    }
    setValidationErrors(prev => ({...prev, unitNumber: undefined}));
    return true;
  };

  const validatePrice = (value: string): boolean => {
    if (!value) return true; // Skip empty validation, handled by required attribute
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setPriceError("Price must be greater than zero");
      return false;
    }
    setPriceError(null);
    return true;
  };

  const handleUnitNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUnitNumber(value);
    validateUnitNumber(value);
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUnitPrice(value);
    validatePrice(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form fields before submission
    const isUnitNumberValid = validateUnitNumber(unitNumber);
    const isPriceValid = validatePrice(unitPrice);

    if (!isUnitNumberValid || !isPriceValid) {
      return;
    }

    setLoading(true);

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
        onSuccess();
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
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Unit Number</label>
            <input
              type="text"
              placeholder="Enter Unit Number"
              value={unitNumber}
              onChange={handleUnitNumberChange}
              className={`form-input ${validationErrors.unitNumber ? 'error-input' : ''}`}
              required
            />
            {validationErrors.unitNumber && (
              <div className="field-error">{validationErrors.unitNumber}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Price</label>
            <input
              type="number"
              placeholder="Enter Unit Price"
              value={unitPrice}
              onChange={handleUnitPriceChange}
              className={`form-input ${priceError ? 'error-input' : ''}`}
              min="0.01"
              step="0.01"
              required
            />
            {priceError && (
              <div className="field-error">{priceError}</div>
            )}
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

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || !!priceError || !!validationErrors.unitNumber}
            >
              {loading ? 'Adding...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnit;
