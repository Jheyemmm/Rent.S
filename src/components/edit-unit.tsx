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
  onSuccess: () => void;
}

const EditUnit: React.FC<EditUnitProps> = ({ unit, closeForm, refreshUnits, onSuccess }) => {
  const [unitName, setUnitName] = useState(String(unit.number));
  const [unitPrice, setUnitPrice] = useState(unit.price.toString());
  const [unitDetails, setUnitDetails] = useState(unit.details);
  const [unitStatus, setUnitStatus] = useState(unit.status || 'Available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    unitNumber?: string;
  }>({});

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnitStatus(e.target.value);
  };

  const validateUnitNumber = (value: string | number) => {
    const stringValue = String(value);
    if (!/^\d+$/.test(stringValue.trim())) {
      setValidationErrors(prev => ({...prev, unitNumber: "Unit number must contain only digits"}));
      return false;
    }
    setValidationErrors(prev => ({...prev, unitNumber: undefined}));
    return true;
  };

  const validatePrice = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setPriceError("Price must be greater than zero");
      return false;
    }
    setPriceError(null);
    return true;
  };

  const handleUnitNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnitName(e.target.value);
    validateUnitNumber(e.target.value);
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnitPrice(e.target.value);
    validatePrice(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validate all fields before submission
    const isUnitNumberValid = validateUnitNumber(unitName);
    const isPriceValid = validatePrice(unitPrice);

    if (!isUnitNumberValid || !isPriceValid) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
        return;
      }

      await refreshUnits();
      onSuccess();
      closeForm();
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={closeForm}>
      <div className="add-unit-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="form-title">Edit Unit</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Unit Number</label>
            <input
              type="text"
              value={unitName}
              onChange={handleUnitNameChange}
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
              disabled={loading || !!priceError || !!validationErrors.unitNumber}
            >
              {loading ? 'Updating...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUnit;
