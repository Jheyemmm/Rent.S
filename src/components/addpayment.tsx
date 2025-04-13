import React, { useState } from 'react';
import './addpayment.css';

interface AddPaymentModalProps {
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [selectedUnit, setSelectedUnit] = useState('');
  
    const units = [
      { number: '201', tenant: 'John Smith' },
      { number: '203', tenant: 'Sherlock Holmes' },
      { number: '205', tenant: 'Trafalgar Law' }
    ];
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        unit: selectedUnit,
        amount,
        paymentDate,
        proofFile
      });
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
            <option key={unit.number} value={unit.number}>
              Unit {unit.number} - {unit.tenant}
            </option>
          ))}
        </select>
      </div>

      <div className="addpayment-unit-details">
        <h4>DETAILS</h4>
        <p>Monthly Rental: ₱18,500.00</p>
        <p>Outstanding Balance: ₱18,500.00</p>
        <p>Total Paid: ₱0.00</p>
        <p>Rent Started: 09/25/24</p>
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