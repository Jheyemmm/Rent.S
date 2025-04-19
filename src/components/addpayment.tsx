import React, { useEffect, useState } from 'react';
import './addpayment.css';
import supabase from '../supabaseClient';

interface AddPaymentModalProps {
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
}

interface Unit {
  UnitID: number;
  UnitNumber: string;
  Price: number;
  Tenants?: {
    TenantID: number;
    TenantFirstName: string;
    TenantLastName: string;
    MoveInDate: string;
  }
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [selectedUnit, setSelectedUnit] = useState('');
    const [units, setUnits] = useState<Unit[]>([]);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchUnits = async () => {
        const { data, error } = await supabase
        .from('Units')
        .select('UnitID, UnitNumber, Price, UnitStatus, Tenants (TenantID, TenantFirstName, TenantLastName, MoveInDate)')
        .eq('UnitStatus', 'Occupied'); // filter occupied units

        if (error) {
          console.error(error);
          setError('Failed to fetch units.');
        } else {
          console.log('Fetched occupied units with tenants:', data);
          setUnits(data.map((unit: any) => ({
            UnitID: unit.UnitID,
            UnitNumber: unit.UnitNumber,
            Price: unit.Price,
            Tenants: Array.isArray(unit.Tenants) ? unit.Tenants[0] : unit.Tenants ?? undefined
          })));
        }
      };

      fetchUnits();
    }, []);

    const selectedUnitDetails = units.find((unit) => unit.UnitID.toString() === selectedUnit);

    const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    const fetchTotalPaid = async () => {
      if (!selectedUnit) return;

      const { data, error } = await supabase
        .from('Payments')
        .select('PaymentAmount')
        .eq('UnitID', selectedUnit);

      if (!error && data) {
        const total = data.reduce((sum, p) => sum + p.PaymentAmount, 0);
        setTotalPaid(total);
      }
    };

    fetchTotalPaid();
  }, [selectedUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission triggered");
  
    const unit = units.find((u) => u.UnitID.toString() === selectedUnit);
    if (!unit || !unit.Tenants) {
      setError("Please select a valid unit.");
      return;
    }

    if (!proofFile) {
      setError("Please upload a proof of payment file.");
      return;
    }

    const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('payment_proofs')
    .upload(`proofs/${Date.now()}_${proofFile.name}`, proofFile);
  
    if (uploadError || !uploadData) {
      setError("Failed to upload proof of payment.");
      return;
    }
    
    const proofUrl = supabase.storage
      .from('payment_proofs')
      .getPublicUrl(uploadData.path).data.publicUrl;
  
    const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        setError("Please enter a valid payment amount.");
        return;
      }

    const paymentData = {
      UnitID: unit.UnitID,
      TenantID: unit.Tenants.TenantID,
      PaymentAmount: parseFloat(amount),
      PaymentDate: paymentDate,
      PaymentProof: proofUrl, // you'd need to upload this to Supabase storage first
      UserID: 123, // replace with logged-in user's ID
    };
  
    onSubmit(paymentData);
    console.log('Submitted payment data:', paymentData);
  };
  
  
    return (
<div className="addpayment-modal-overlay"> {/* Changed from modal-overlay */}
    <div className="addpayment-modal-container"> {/* Changed from payment-modal */}
      <div className="addpayment-modal-header"> 
            <h2>NEW PAYMENT</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
  
          <form onSubmit={handleSubmit}>
  <div className="addpayment-modal-columns">
    {/* LEFT COLUMN - UNIT SELECTION ONLY */}
    <div className="addpayment-left-column">
      <div className="addpayment-form-group">
        <h3>UNIT NUMBER</h3>
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="unit-select"
        >
          <option value="">Select Unit</option>
          {units.map((unit) => (
            <option key={unit.UnitID} value={unit.UnitID}>
              Unit {unit.UnitNumber}
            </option>
          ))}
        </select>
      </div>

      <div className="addpayment-unit-details">
        <h4>DETAILS</h4>
        <p>Tenant: {selectedUnitDetails?.Tenants?.TenantFirstName} {selectedUnitDetails?.Tenants?.TenantLastName}</p>
        <p>Monthly Rental: ₱{selectedUnitDetails?.Price?.toLocaleString()}</p>
        <p>Outstanding Balance: ₱{selectedUnitDetails?.Price ? (selectedUnitDetails.Price - totalPaid).toLocaleString() : '0.00'}</p>
        <p>Total Paid: ₱{totalPaid.toLocaleString()}</p>
        <p>Rent Started: {
            selectedUnitDetails?.Tenants?.MoveInDate
              ? new Date(selectedUnitDetails.Tenants.MoveInDate).toLocaleDateString()
              : 'N/A'}
        </p>
        <p>Payable Months: 1</p>
      </div>
    </div>

    {/* RIGHT COLUMN - DATE, AMOUNT & ACTIONS */}
    <div className="addpayment-right-column">
      {/* DATE INPUT */}
      <div className="addpayment-date-input-group">
        <h3>DATE:</h3>
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="addpayment-date-input"
        />
      </div>

      {/* AMOUNT INPUT */}
      <div className="addpayment-form-group">
        <h3>AMOUNT PAID:</h3>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="₱0.00"
          className="addpayment-amount-input"
        />
      </div>

      {/* PROOF OF PAYMENT */}
      <div className="addpayment-form-group">
        <h3>PROOF OF PAYMENT:</h3>
        <div className="addpayment-file-upload">
          <label className="addpayment-upload-area">
            <input
              type="file"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              accept="image/*,.pdf"
            />
            <p>Drag and drop file here or click to upload</p>
          </label>
          {proofFile && <p className="addpayment-file-name">{proofFile.name}</p>}
        </div>
      </div>

      {/* ACTIONS BUTTONS */}
      <div className="addpayment-modal-actions">
        <button type="button" className="addpayment-cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="addpayment-save-btn">
          Save Payment
        </button>
      </div>
    </div>
  </div>
</form>
        </div>
      </div>
    );
  };
export default AddPaymentModal;