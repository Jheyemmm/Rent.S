"use client"

import type React from "react"
import { Check } from "lucide-react"
import "./receipt.css"


interface ReceiptProps {
  paymentData: {
    PaymentAmount: number
    PaymentDate: string
  }
  unitData: {
    UnitNumber: string
    Price: number
    TenantFirstName: string
    TenantLastName: string
  }
  onClose: () => void
}

const Receipt: React.FC<ReceiptProps> = ({ paymentData, unitData, onClose }) => {
  const paymentDate = new Date(paymentData.PaymentDate)
  const formattedDate = paymentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const formattedTime = paymentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-container" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header">
          <div className="check-icon">
            <Check className="check-icon-inner" />
          </div>
          <h2 className="receipt-title">Payment Success!</h2>
        </div>

        <div className="divider" />

        <div className="receipt-section">
          <div className="receipt-row">
            <span className="label">Date</span>
            <span className="value">{formattedDate}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Time</span>
            <span className="value">{formattedTime}</span>
          </div>
        </div>

        <div className="divider" />

        <div className="receipt-section">
          <div className="receipt-row">
            <span className="label">Amount</span>
            <span className="value">₱{paymentData.PaymentAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="divider" />

        <div className="receipt-footer">
          <button className="done-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default Receipt
