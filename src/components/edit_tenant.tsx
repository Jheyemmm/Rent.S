import React, { useEffect, useState } from 'react';
import './Addtenant.css';
import supabase from '../supabaseClient';

interface EditTenantModalProps {
  onClose: () => void;
  tenantData?: any;
  onTenantUpdated: () => Promise<void>;
}

interface Unit {
  UnitID: number;
  UnitNumber: string;
  Price: number;
  UnitStatus: 'Available' | 'Occupied' | string;  
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string; // Adding email validation
  unitID?: string;
  moveInDate?: string;
  balance?: string;
}

export const EditTenantModal: React.FC<EditTenantModalProps> = ({ onClose, tenantData, onTenantUpdated }) => {
  const [firstName, setFirstName] = useState(tenantData ? tenantData.firstName : '');
  const [lastName, setLastName] = useState(tenantData ? tenantData.lastName : '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unitID, setUnitID] = useState(tenantData ? tenantData.unit.toString() : '');
  const [moveInDate, setMoveInDate] = useState('');
  const [balance, setBalance] = useState(tenantData ? tenantData.balance.toString() : '');
  const [units, setUnits] = useState<{ UnitID: number; UnitNumber: string; Price: number; UnitStatus: string }[]>([]);
  const [selectedPrice, setPrice] = useState<number | null>(tenantData ? Number(tenantData.monthlyRent) : null);
  const [error, setError] = useState<string | null>(null);
  const [tenantID, setTenantID] = useState(tenantData ? tenantData.tenantID : null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add a state to track if form has been touched
  const [formTouched, setFormTouched] = useState(false);
  
  useEffect(() => {
    const fetchUnits = async () => {
      // For edit, we need both available units and the current tenant's unit
      const { data, error } = await supabase
        .from('Units')
        .select('UnitID, UnitNumber, Price, UnitStatus');

      if (!error && data) {
        // Include current tenant's unit even if occupied
        const relevantUnits = data.filter((unit: Unit) => 
          unit.UnitStatus === 'Available' || (tenantData && unit.UnitID === tenantData.unit)
        );
        setUnits(relevantUnits);
      } else {
        setError('Failed to fetch units.')
      }
    };

    const fetchTenantDetails = async () => {
      if (tenantData && tenantData.tenantID) {
        const { data, error } = await supabase
          .from('Tenants')
          .select('TenantFirstName, TenantLastName, ContactNumber, TenantEmail, MoveInDate')
          .eq('TenantID', tenantData.tenantID)
          .single();
        
        if (!error && data) {
          setPhone(data.ContactNumber || '');
          setEmail(data.TenantEmail || '');
          // Format date for input element
          if (data.MoveInDate) {
            const dateObj = new Date(data.MoveInDate);
            const formattedDate = dateObj.toISOString().split('T')[0];
            setMoveInDate(formattedDate);
          }
        }
      }
    };

    fetchUnits();
    fetchTenantDetails();
  }, [tenantData]);

  // Run validation on all fields to check for completeness
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;
    
    // Check required fields
    if (!firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    }
    
    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    }
    
    if (!phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^[0-9+\-\s()]*$/.test(phone)) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }
    
    // Email validation - optional but validated if provided
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    if (!unitID) {
      errors.unitID = "Unit selection is required";
      isValid = false;
    }
    
    if (!moveInDate) {
      errors.moveInDate = "Move-in date is required";
      isValid = false;
    }
    
    // Validate balance if present
    if (balance && !validateBalance(balance)) {
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  // Mark form as touched and validate all fields
  const touchForm = () => {
    if (!formTouched) {
      setFormTouched(true);
      validateForm();
    }
  };
  
  const validateBalance = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setBalanceError("Balance cannot be negative");
      return false;
    }
    setBalanceError(null);
    return true;
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ValidationErrors) => {
    const value = e.target.value;
    
    // Mark form as touched when user starts making changes
    if (!formTouched) touchForm();
    
    // Update the specific field
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'email':
        setEmail(value);
        break;
    }
    
    // Clear the specific validation error
    setValidationErrors(prev => ({...prev, [field]: undefined}));
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!formTouched) touchForm();
    
    const selectedUnitID = parseInt(e.target.value);
    const selectedUnit = units.find(unit => unit.UnitID === selectedUnitID);
    setUnitID(e.target.value);
    setPrice(selectedUnit?.Price ?? null);
    
    // Clear unit validation error when user selects a unit
    setValidationErrors(prev => ({ ...prev, unitID: undefined }));
  };
  
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formTouched) touchForm();
    
    const value = e.target.value;
    setBalance(value);
    validateBalance(value);
  };

  const handleMoveInDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formTouched) touchForm();
    
    setMoveInDate(e.target.value);
    setValidationErrors(prev => ({...prev, moveInDate: undefined}));
  };

  const handleSubmit = async () => {
    // Always touch the form when submitting
    touchForm();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { 
        data: { user }, 
        error: userError, 
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('You must be logged in to update a tenant.')
        setIsSubmitting(false);
        return;
      }

      // Update tenant information
      const { error: updateError } = await supabase
      .from('Tenants')
      .update({
        TenantFirstName: firstName.trim(),
        TenantLastName: lastName.trim(),
        ContactNumber: phone.trim(),
        TenantEmail: email.trim(),
        UnitID: parseInt(unitID),
        MoveInDate: moveInDate,
        Balance: balance,
      })
      .eq('TenantID', tenantID);

      if (updateError) {
        setError(updateError.message);
        setIsSubmitting(false);
        return;
      }
  
      // Update unit status if unit has changed
      if (tenantData && tenantData.unit !== parseInt(unitID)) {
        // Set previous unit to Available
        const { error: prevUnitError } = await supabase
          .from('Units')
          .update({ UnitStatus: 'Available' })
          .eq('UnitID', tenantData.unit);
          
        if (prevUnitError) {
          setError('Tenant updated, but failed to update previous unit status.');
          setIsSubmitting(false);
          return;
        }
        
        // Set new unit to Occupied
        const { error: newUnitError } = await supabase
          .from('Units')
          .update({ UnitStatus: 'Occupied' })
          .eq('UnitID', parseInt(unitID));
          
        if (newUnitError) {
          setError('Tenant updated, but failed to update new unit status.');
          setIsSubmitting(false);
          return;
        }
      }
  
      setError(null); // clear any previous error
      
      // Call the onTenantUpdated callback to refresh the tenant list
      await onTenantUpdated();
      
      onClose(); // close modal on success

    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if there are any errors that would prevent submission
  const hasErrors = Object.keys(validationErrors).length > 0 || balanceError !== null;

  return (
    <div className="addtenant-modal-overlay" onClick={onClose}>
      <div className="addtenant-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="addtenant-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="addtenant-form-container">
          <h1 className="addtenant-form-title">Edit Tenant</h1>

          {error && (
            <div className="form-error">
              <div className="field-error">{error}</div>
            </div>
          )}

          <div className="addtenant-form-section">
            <h2>Tenant Details</h2>
            <div className="addtenant-form-row">

              <div className="addtenant-form-group">
                <label>First Name <span className="required-field">*</span></label>
                <input 
                  type="text" 
                  className={`addtenant-form-input ${validationErrors.firstName ? 'error-input' : ''}`}
                  value={firstName} 
                  onChange={(e) => handleFieldChange(e, 'firstName')}
                  required
                />
                {validationErrors.firstName && (
                  <div className="field-error">{validationErrors.firstName}</div>
                )}
              </div>

              <div className="addtenant-form-group">
                <label>Last Name <span className="required-field">*</span></label>
                <input 
                  type="text" 
                  className={`addtenant-form-input ${validationErrors.lastName ? 'error-input' : ''}`}
                  value={lastName} 
                  onChange={(e) => handleFieldChange(e, 'lastName')}
                  required
                />
                {validationErrors.lastName && (
                  <div className="field-error">{validationErrors.lastName}</div>
                )}
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Phone Number <span className="required-field">*</span></label>
                <input 
                  type="tel" 
                  className={`addtenant-form-input ${validationErrors.phone ? 'error-input' : ''}`}
                  value={phone} 
                  onChange={(e) => handleFieldChange(e, 'phone')}
                  required
                />
                {validationErrors.phone && (
                  <div className="field-error">{validationErrors.phone}</div>
                )}
              </div>

              <div className="addtenant-form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  className={`addtenant-form-input ${validationErrors.email ? 'error-input' : ''}`}
                  value={email} 
                  onChange={(e) => handleFieldChange(e, 'email')}
                />
                {validationErrors.email && (
                  <div className="field-error">{validationErrors.email}</div>
                )}
              </div>
            </div>
          </div>

          <div className="addtenant-form-section">
            <h2>Assign unit</h2>
            <div className="addtenant-form-row">

              <div className="addtenant-form-group">
                <label>Unit number <span className="required-field">*</span></label>
                <select
                  value={unitID}
                  onChange={handleUnitChange}
                  className={`addtenant-form-input ${validationErrors.unitID ? 'error-input' : ''}`}
                  required
                >
                  <option value="">Select a unit</option>
                  {units.map((unit) => (
                    <option key={unit.UnitID} value={unit.UnitID}>
                      {unit.UnitNumber}
                    </option>
                  ))}
                </select>
                {validationErrors.unitID && (
                  <div className="field-error">{validationErrors.unitID}</div>
                )}
              </div>

              <div className="addtenant-form-group">
                <label>Move in date <span className="required-field">*</span></label>
                <input 
                  type="date" 
                  value={moveInDate}
                  onChange={handleMoveInDateChange}
                  className={`addtenant-form-input ${validationErrors.moveInDate ? 'error-input' : ''}`}
                  required
                />
                {validationErrors.moveInDate && (
                  <div className="field-error">{validationErrors.moveInDate}</div>
                )}
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Price</label>
                <input 
                  type="number" 
                  value={selectedPrice ?? ''} 
                  className="addtenant-form-input"
                  readOnly 
                />
              </div>

              <div className="addtenant-form-group">
                <label>Balance</label>
                <input 
                  type="number" 
                  value={balance}
                  onChange={handleBalanceChange}
                  className={`addtenant-form-input ${balanceError ? 'error-input' : ''}`}
                />
                {balanceError && (
                  <div className="field-error">{balanceError}</div>
                )}
              </div>
            </div>
          </div>

          <div className="addtenant-form-actions">
            <button 
              type="button" 
              className="addtenant-clear-btn"
              onClick={() =>{
                setFirstName('');
                setLastName('');
                setPhone('');
                setEmail('');
                setUnitID('');
                setPrice(null);
                setMoveInDate('');
                setBalance('');
                setValidationErrors({});
                setBalanceError(null);
              }}
              disabled={isSubmitting}
            >
              Clear
            </button>

            <button 
              type="button"
              className="addtenant-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || (formTouched && hasErrors)}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};