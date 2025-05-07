"use client"

import type React from "react"
import { useState } from "react"
import "./edit-payment.css"
import supabase from "../supabaseClient"

interface EditPaymentModalProps {
  transaction: {
    id: number
    name: string
    unit: string
    amount: string
    receipt: string
    receiptFile: string | null
    date: string
  }
  onClose: () => void
  onSubmit: () => void
}

const EditPaymentModal: React.FC<EditPaymentModalProps> = ({ transaction, onClose, onSubmit }) => {
  // Parse amount properly (remove currency symbol and commas)
  const initialAmount = transaction.amount.replace(/[₱,]/g, "")

  const [amount, setAmount] = useState(initialAmount)
  const [amountError, setAmountError] = useState<string | null>(null)

  // Convert date string to proper format for input[type="date"]
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    } catch (e) {
      console.error("Date parsing error:", e)
      return new Date().toISOString().split("T")[0]
    }
  }

  const [paymentDate, setPaymentDate] = useState(formatDateForInput(transaction.date))
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // Fix: Added null check and default to null if split/pop returns undefined
  const [fileName, setFileName] = useState<string | null>(
    transaction.receiptFile ? transaction.receiptFile.split("/").pop() || null : null,
  )

  const validateAmount = (value: string): boolean => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      setAmountError("Amount must be greater than zero")
      return false
    }
    setAmountError(null)
    return true
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    validateAmount(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate amount before submitting
    if (!validateAmount(amount)) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let updatedProofUrl = transaction.receiptFile

      if (proofFile) {
        // Upload new file if provided
        const ext = proofFile.name.split(".").pop() || "file"
        const filename = `payment_${transaction.id}_${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("proof-of-payment")
          .upload(`proofs/${filename}`, proofFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from("proof-of-payment").getPublicUrl(`proofs/${filename}`)

        updatedProofUrl = data.publicUrl
      }

      // Update payment record
      const { error: updateError } = await supabase
        .from("Payments")
        .update({
          PaymentAmount: Number.parseFloat(amount),
          PaymentDate: new Date(paymentDate).toISOString(),
          ...(proofFile && { PaymentProof: updatedProofUrl }),
        })
        .eq("PaymentID", transaction.id)

      if (updateError) throw updateError

      // Notify parent components of success
      onSubmit()
      onClose()
    } catch (err: any) {
      console.error("Error updating payment:", err)
      setError(err.message || "Something went wrong while updating the payment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    // Reset previous file error
    setFileError(null)

    if (file) {
      // Check if file is an image
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/jpg",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
      ]

      if (!validImageTypes.includes(file.type)) {
        setFileError("Please upload only image files (JPG, JPEG, PNG, GIF, etc).")
        setProofFile(null)
        setFileName(null)
        return
      }

      setProofFile(file)
      setFileName(file.name)
    } else {
      setProofFile(null)
      setFileName(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">EDIT PAYMENT</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-two-columns">
            <div className="modal-left-column">
              <div className="form-section">
                <h3 className="section-label">UNIT NUMBER</h3>
                <div className="form-display-field">{transaction.unit}</div>
              </div>

              <div className="details-section">
                <h3 className="section-label">DETAILS</h3>
                <div className="details-content">
                  <p>Tenant: {transaction.name}</p>
                  {/* Include other details as needed */}
                </div>
              </div>
            </div>

            <div className="modal-right-column">
              <div className="form-section">
                <h3 className="section-label">DATE:</h3>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="date-input"
                  required
                />
              </div>

              <div className="form-section">
                <h3 className="section-label">AMOUNT PAID:</h3>
                <div className="amount-input-container">
                  <span className="currency-symbol">₱</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className={`amount-input ${amountError ? "error-input" : ""}`}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                {amountError && <div className="field-error">{amountError}</div>}
              </div>

              <div className="form-section">
                <h3 className="section-label">PROOF OF PAYMENT:</h3>
                <div className="file-upload-area">
                  <input
                    id="edit-payment-proof"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="edit-payment-proof" className="file-upload-box">
                    Drag and drop file here or click to upload
                  </label>
                  {fileName && <div className="file-name-display">Selected: {fileName}</div>}
                  {fileError && <div className="field-error">{fileError}</div>}
                  {!proofFile && transaction.receiptFile && (
                    <div className="current-file-display">Current file: {transaction.receipt}</div>
                  )}
                </div>
              </div>

              {error && (
                <div className="form-error">
                  <div className="field-error">{error}</div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="save-button" disabled={isSubmitting || !!amountError || !!fileError}>
                  {isSubmitting ? "Updating..." : "Update Payment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPaymentModal
