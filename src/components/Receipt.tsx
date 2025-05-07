"use client"

import type React from "react"
import { Check } from "lucide-react"
import "./receipt.css"

interface ReceiptProps {
  paymentData: {
    PaymentAmount: number
    PaymentDate: string
    PaymentID?: number
    created_at?: string
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
  // Format the date from PaymentDate
  const formatDate = () => {
    try {
      const paymentDate = new Date(paymentData.PaymentDate)

      if (isNaN(paymentDate.getTime())) {
        return "Invalid date"
      }

      return paymentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Error parsing date"
    }
  }

  // Extract just the time from created_at or use PaymentDate as fallback
  const formatTime = () => {
    try {
      // Use created_at if available, otherwise fall back to PaymentDate
      const dateToUse = paymentData.created_at || paymentData.PaymentDate
      const date = new Date(dateToUse)

      if (isNaN(date.getTime())) {
        return "Invalid time"
      }

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    } catch (error) {
      console.error("Error formatting time:", error)
      return "Error parsing time"
    }
  }

  const formattedDate = formatDate()
  const formattedTime = formatTime()

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
            <span className="label">Tenant</span>
            <span className="value">
              {unitData.TenantFirstName} {unitData.TenantLastName}
            </span>
          </div>
          <div className="receipt-row">
            <span className="label">Unit</span>
            <span className="value">{unitData.UnitNumber}</span>
          </div>
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
