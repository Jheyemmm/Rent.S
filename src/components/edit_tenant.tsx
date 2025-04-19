import React, { useEffect, useState } from 'react';
import './Addtenant.css';
import supabase from '../supabaseClient';

interface EditTenantModalProps {
  onClose: () => void;
  tenantData?: any; // Add this prop to receive tenant data
  onTenantUpdated: () => Promise<void>; // Add this prop for callback after update
}

interface Unit {
  UnitID: number;
  UnitNumber: string;
  Price: number;
  UnitStatus: 'Available' | 'Occupied' | string;
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

    // Fetch tenant details if this is an edit operation
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

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnitID = parseInt(e.target.value);
    const selectedUnit = units.find(unit => unit.UnitID === selectedUnitID);
    setUnitID(e.target.value);
    setPrice(selectedUnit?.Price ?? null);
  };

  const handleSubmit = async () => {
    try {
      const { 
        data: { user }, 
        error: userError, 
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('You must be logged in to update a tenant.')
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
          return;
        }
        
        // Set new unit to Occupied
        const { error: newUnitError } = await supabase
          .from('Units')
          .update({ UnitStatus: 'Occupied' })
          .eq('UnitID', parseInt(unitID));
          
        if (newUnitError) {
          setError('Tenant updated, but failed to update new unit status.');
          return;
        }
      }
  
      setError(null); // clear any previous error
      alert('Tenant updated successfully!');
      
      // Call the onTenantUpdated callback to refresh the tenant list
      await onTenantUpdated();
      
      onClose(); // close modal on success

    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred.');
    }
  };

  return (
    <div className="addtenant-modal-overlay" onClick={onClose}>
      <div className="addtenant-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="addtenant-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="addtenant-form-container">
          <h1 className="addtenant-form-title">Edit Tenant</h1>

          {error && <p className="addtenant-error">{error}</p>}

          <div className="addtenant-form-section">
            <h2>Tenant Details</h2>
            <div className="addtenant-form-row">

              <div className="addtenant-form-group">
                <label>First Name</label>
                <input 
                type="text" 
                className="addtenant-form-input" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="addtenant-form-group">
                <label>Last Name</label>
                <input 
                type="text" 
                className="addtenant-form-input"
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Phone Number</label>
                <input 
                type="tel" 
                className="addtenant-form-input" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="addtenant-form-group">
                <label>Email</label>
                <input 
                type="email" 
                className="addtenant-form-input" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="addtenant-form-section">
            <h2>Assign unit</h2>
            <div className="addtenant-form-row">

              <div className="addtenant-form-group">
                <label>Unit number</label>
                <select
                  value={unitID} 
                  onChange={handleUnitChange}
                >
                  <option value="">Select a unit</option>
                  {units.map((unit) => (
                    <option key={unit.UnitID} value={unit.UnitID}>
                      {unit.UnitNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="addtenant-form-group">
                <label>Move in date</label>
                <input 
                type="date" 
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                />
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Price</label>
                <input 
                type="number" 
                value={selectedPrice ?? ''} readOnly 
                />
              </div>

              <div className="addtenant-form-group">
                <label>Balance</label>
                <input 
                type="number" 
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                />
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
            }}
            >Clear</button>

            <button 
            type="button"
            className="addtenant-submit-btn"
            onClick={handleSubmit}
            >Update</button>
          </div>
        </div>
      </div>
    </div>
  );
};