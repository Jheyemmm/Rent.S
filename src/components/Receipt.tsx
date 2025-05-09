"use client"

import type React from "react"
import { Check } from "lucide-react"
import { useRef } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import "./Receipt.css"

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
  // Reference to the receipt content
  const receiptRef = useRef<HTMLDivElement>(null)
  
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
  
  // Function to handle receipt download
  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return
    
    try {
      // Set a temporary background color for better PDF rendering
      const originalBackground = receiptRef.current.style.background
      receiptRef.current.style.background = "white"
      
      // Create canvas from receipt element
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      })
      
      // Reset background
      receiptRef.current.style.background = originalBackground
      
      // Get dimensions
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 297] // A4 size
      })
      
      // Calculate dimensions to maintain aspect ratio
      const imgWidth = 210 - 40 // A4 width with margins
      const pageHeight = 297
      const imgHeight = canvas.height * imgWidth / canvas.width
      let heightLeft = imgHeight
      let position = 20 // Initial y-position
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight)
      
      // Generate filename with tenant name and date
      const tenantName = `${unitData.TenantFirstName}-${unitData.TenantLastName}`.replace(/\s+/g, '-')
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `payment-receipt-${tenantName}-${dateStr}.pdf`
      
      // Download the PDF
      pdf.save(filename)
      
    } catch (error) {
      console.error("Error generating receipt PDF:", error)
      alert("There was an error creating the PDF. Please try again.")
    }
  }

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-container" onClick={(e) => e.stopPropagation()}>
        <div ref={receiptRef}>
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
            {paymentData.PaymentID && (
              <div className="receipt-row">
                <span className="label">Transaction ID</span>
                <span className="value">#{paymentData.PaymentID}</span>
              </div>
            )}
          </div>

          <div className="divider" />
        </div>

        <div className="receipt-footer">
          <button className="done-button" onClick={onClose}>
            View Payment
          </button>
          <button className="download-button" onClick={handleDownloadReceipt}>
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

export default Receipt
