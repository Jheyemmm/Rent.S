import React from 'react';
import './Receipt.css';

interface ReceiptProps {
  paymentData: {
    PaymentAmount: number;
    PaymentDate: string;
  };
  unitData: {
    UnitNumber: string;
    Price: number;
    TenantFirstName: string;
    TenantLastName: string;
  };
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ paymentData, unitData, onClose }) => {
  return (
    <div className="receipt-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="receipt-container" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header">
          <h2>PAYMENT RECEIPT</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="receipt-body">
          <div className="receipt-details">
            <div className="receipt-row">
              <span>Tenant:</span>
              <span>{unitData.TenantFirstName} {unitData.TenantLastName}</span>
            </div>
            <div className="receipt-row">
              <span>Unit:</span>
              <span>{unitData.UnitNumber}</span>
            </div>
            <div className="receipt-row">
              <span>Amount Paid:</span>
              <span>₱{paymentData.PaymentAmount.toLocaleString()}</span>
            </div>
            <div className="receipt-row">
              <span>Date:</span>
              <span>{new Date(paymentData.PaymentDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="receipt-actions">
            <button onClick={() => window.print()} className="print-btn">
              Print Receipt
            </button>
            <button onClick={onClose} className="done-btn">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;