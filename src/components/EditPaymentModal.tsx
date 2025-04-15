import React, { useState, useEffect } from 'react';
import './EditPaymentModal.css';

interface EditPaymentModalProps {
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
  transaction: any;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({ onClose, onSubmit, transaction }) => {
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    proof: null as File | null
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.replace('$', '').replace(',', ''),
        date: transaction.date,
        proof: null
      });
    }
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, proof: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      originalTransaction: transaction
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  return (
    <div className="editpayment-modal-overlay" onClick={onClose}>
      <div className="editpayment-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="editpayment-modal-header">
          <h1>Edit Payment</h1>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="editpayment-modal-content">
          <div className="tenant-section">
            <h2>Tenant</h2>
            <h3>{transaction?.name}</h3>
            
            <div className="tenant-details-grid">
              <div className="grid-row">
                <div className="grid-cell">
                  <span>Tenant: {transaction?.name}</span>
                </div>
                <div className="grid-cell">
                  <span>Monthly Rental fee: ₽{parseFloat(transaction?.amount.replace('$', '')).toFixed(2)}</span>
                </div>
              </div>
              <div className="grid-row">
                <div className="grid-cell">
                  <span>Unit: {transaction?.unit.replace('Unit ', '')}</span>
                </div>
                <div className="grid-cell">
                  <span>Outstanding Balance: ₽{parseFloat(transaction?.amount.replace('$', '')).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="additional-details">
              <p>Total Paid: ₽0.00</p>
              <p>Rent Started: {formatDate(transaction?.date)}</p>
              <p>Payable Months: 1</p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="amount-section">
            <h2>Amount Paid:</h2>
            <div className="amount-input-group">
              <span className="currency-symbol">₽</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="amount-input"
              />
            </div>
            <div className="date-input-group">
              <span className="date-label">Date:</span>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="date-input"
              />
            </div>
          </div>

          <div className="divider"></div>

          <div className="proof-section">
            <h2>Proof of payment:</h2>
            <label className="file-upload-label">
              <div className="file-upload-box">
                <p>Drag and drop file or click to upload</p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="file-input"
                />
              </div>
              {formData.proof && (
                <p className="file-name">{formData.proof.name}</p>
              )}
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};