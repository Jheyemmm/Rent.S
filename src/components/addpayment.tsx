"use client"

import type React from "react"
import { useEffect, useState } from "react"
import "./addpayment.css"
import supabase from "../supabaseClient"
import Receipt from "../components/Receipt"

interface AddPaymentModalProps {
  onClose: () => void
  onSubmit: (paymentData: any) => void
}

interface Unit {
  UnitID: number
  UnitNumber: string
  Price: number
  Tenants?: {
    TenantID: number
    TenantFirstName: string
    TenantLastName: string
    MoveInDate: string
  }
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ onClose, onSubmit }) => {
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState<string | null>(null) // Add dedicated amount error state
  const [paymentDate, setPaymentDate] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null) // Add dedicated file error state
  const [selectedUnit, setSelectedUnit] = useState("")
  const [units, setUnits] = useState<Unit[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentUserID, setCurrentUserID] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalPaid, setTotalPaid] = useState<number>(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)

  // Fetch current user ID when component mounts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Get the current authenticated user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          setError("User not authenticated")
          return
        }

        // Fetch the user's database record to get their UserID
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("UserID")
          .eq("Email", authUser.email)
          .single()

        if (userError || !userData) {
          console.error("Error fetching user ID:", userError)
          setError("Failed to get user information")
          return
        }

        setCurrentUserID(userData.UserID)
      } catch (err) {
        console.error("Error fetching current user:", err)
        setError("Authentication error")
      }
    }

    fetchCurrentUser()
  }, [])

  useEffect(() => {
    const fetchUnits = async () => {
      const { data, error } = await supabase
        .from("Units")
        .select(
          "UnitID, UnitNumber, Price, UnitStatus, Tenants (TenantID, TenantFirstName, TenantLastName, MoveInDate)",
        )
        .eq("UnitStatus", "Occupied")

      if (error) {
        console.error(error)
        setError("Failed to fetch units.")
      } else {
        console.log("Fetched occupied units with tenants:", data)
        setUnits(
          data.map((unit: any) => ({
            UnitID: unit.UnitID,
            UnitNumber: unit.UnitNumber,
            Price: unit.Price || 0, // Ensure Price is never undefined
            Tenants: Array.isArray(unit.Tenants) ? unit.Tenants[0] : (unit.Tenants ?? undefined),
          })),
        )
      }
    }

    fetchUnits()
  }, [])

  const selectedUnitDetails = units.find((unit) => unit.UnitID.toString() === selectedUnit)

  useEffect(() => {
    const fetchTotalPaid = async () => {
      if (!selectedUnit) {
        setTotalPaid(0) // Reset to 0 when no unit is selected
        return
      }

      const { data, error } = await supabase.from("Payments").select("PaymentAmount").eq("UnitID", selectedUnit)

      if (error) {
        console.error("Error fetching payments:", error)
        setTotalPaid(0)
        return
      }

      if (data && data.length > 0) {
        const total = data.reduce((sum, p) => sum + (p.PaymentAmount || 0), 0)
        setTotalPaid(total)
      } else {
        setTotalPaid(0)
      }
    }

    fetchTotalPaid()
  }, [selectedUnit])

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    onClose() // Close the modal after closing receipt
  }

  // Add a dedicated amount validation function
  const validateAmount = (value: string): boolean => {
    if (!value.trim()) {
      return true // Empty is handled by required field validation
    }

    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) {
      setAmountError("Please enter a valid number")
      return false
    }

    if (numValue <= 0) {
      setAmountError("Amount must be greater than zero")
      return false
    }

    setAmountError(null)
    return true
  }

  // Update the amount change handler with dedicated validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Allow empty string (for clearing the input) or valid number format
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
      validateAmount(value)

      // Clear general error if it was related to amount
      if (error && (error.includes("valid payment amount") || error.includes("greater than zero"))) {
        setError(null)
      }
    }
  }

  // Add file change handler with validation
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
        return
      }

      setProofFile(file)

      // Clear general error if it was related to file
      if (error && error.includes("proof of payment file")) {
        setError(null)
      }
    } else {
      setProofFile(null)
    }
  }

  const checkAndResetTenantBalance = async (tenantID: number, unitPrice: number) => {
    try {
      // Get tenant's move-in date and current balance
      const { data: tenant, error: tenantError } = await supabase
        .from("Tenants")
        .select("MoveInDate, Balance")
        .eq("TenantID", tenantID)
        .single()

      if (tenantError) {
        console.error("Error fetching tenant data:", tenantError)
        return false
      }

      const moveInDate = new Date(tenant.MoveInDate)
      const today = new Date()
      
      // Get the billing day from the move-in date
      const billingDay = moveInDate.getDate()
      
      // Find the most recent billing date that has passed
      let lastBillingDate = new Date(today.getFullYear(), today.getMonth(), billingDay)
      
      // If the billing date hasn't occurred yet this month, use previous month's date
      if (today.getDate() < billingDay) {
        lastBillingDate.setMonth(lastBillingDate.getMonth() - 1)
      }
      
      // Find most recent payment to estimate when rent was last added
      const { data: recentPayments, error: paymentError } = await supabase
        .from("Payments")
        .select("PaymentDate")
        .eq("TenantID", tenantID)
        .order("PaymentDate", { ascending: false })
        .limit(10)
      
      if (paymentError) {
        console.error("Error fetching payments:", paymentError)
      }
      
      // Check if we need to add rent
      let shouldAddRent = false
      
      if (recentPayments && recentPayments.length > 0) {
        // Get the last payment date
        const lastPaymentDate = new Date(recentPayments[0].PaymentDate)
        
        // Find the billing date for the month of the last payment
        const lastPaymentBillingDate = new Date(
          lastPaymentDate.getFullYear(),
          lastPaymentDate.getMonth(),
          billingDay
        )
        
        // If last payment was before the most recent billing date,
        // we need to add rent to the balance
        shouldAddRent = lastBillingDate > lastPaymentBillingDate
      } else {
        // If no payment history, check if it's been at least one month since move-in
        shouldAddRent = today >= new Date(moveInDate.getFullYear(), moveInDate.getMonth() + 1, moveInDate.getDate())
      }
      
      if (shouldAddRent) {
        // Add one month's rent to the balance
        const newBalance = (tenant.Balance || 0) + unitPrice
        
        const { error: updateError } = await supabase
          .from("Tenants")
          .update({ Balance: newBalance })
          .eq("TenantID", tenantID)
        
        if (updateError) {
          console.error("Error updating tenant balance:", updateError)
          return false
        }
        
        console.log(`Added monthly rent of ${unitPrice} to tenant ${tenantID}, new balance: ${newBalance}`)
        return true
      }
      
      return false // No rent added
    } catch (err) {
      console.error("Error in checking/resetting balance:", err)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    // Validate amount specifically before continuing
    if (!validateAmount(amount)) {
      setIsSubmitting(false)
      return
    }

    try {
      // Existing validation for required fields
      if (!amount || !paymentDate || !selectedUnit) {
        setError("Please fill all required fields.")
        setIsSubmitting(false)
        return
      }

      if (!currentUserID) {
        setError("User authentication required")
        setIsSubmitting(false)
        return
      }

      const unit = units.find((u) => u.UnitID.toString() === selectedUnit)
      if (!unit || !unit.Tenants) {
        setError("Please select a valid unit.")
        setIsSubmitting(false)
        return
      }

      if (!proofFile) {
        setError("Please upload a proof of payment file.")
        setIsSubmitting(false)
        return
      }

      const parsedAmount = Number.parseFloat(amount)
      if (isNaN(parsedAmount)) {
        setError("Please enter a valid payment amount.")
        setIsSubmitting(false)
        return
      }

      // Add validation for negative numbers or zero
      if (parsedAmount <= 0) {
        setError("Payment amount must be greater than zero.")
        setIsSubmitting(false)
        return
      }

      let proofUrl = ""

      try {
        // File upload logic...
        // Get file extension and create a unique filename
        const fileExt = proofFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `proofs/${fileName}`

        console.log("Uploading file to bucket: proof-of-payment, path:", filePath)

        // Upload the proof file to the correct bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("proof-of-payment")
          .upload(filePath, proofFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error("Upload error:", uploadError)
          setError(`Failed to upload proof of payment: ${uploadError.message}`)
          setIsSubmitting(false)
          return
        }

        // Get the public URL from the correct bucket
        const { data } = supabase.storage
          .from("proof-of-payment")
          .getPublicUrl(filePath)

        proofUrl = data.publicUrl
      } catch (uploadErr) {
        console.error("File upload error:", uploadErr)
        setError("Error during file upload. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Create payment data object matching the Payments table structure
      const paymentData = {
        TenantID: unit.Tenants.TenantID,
        UnitID: unit.UnitID,
        PaymentAmount: parsedAmount,
        PaymentDate: paymentDate,
        PaymentProof: proofUrl,
        UserID: currentUserID,
      }

      console.log("Sending payment data:", paymentData)

      // Check and possibly reset the tenant's balance if it's a new month
      await checkAndResetTenantBalance(unit.Tenants.TenantID, unit.Price)

      // Get current tenant balance
      const { data: tenantData, error: tenantError } = await supabase
        .from("Tenants")
        .select("Balance")
        .eq("TenantID", unit.Tenants.TenantID)
        .single()

      if (tenantError) {
        console.error("Error fetching tenant balance:", tenantError)
        setError("Failed to retrieve tenant balance information")
        setIsSubmitting(false)
        return
      }

      // Calculate new balance
      const currentBalance = tenantData.Balance || 0
      const newBalance = Math.max(0, currentBalance - parsedAmount) // Ensure balance doesn't go negative

      // Update tenant balance
      const { error: balanceError } = await supabase
        .from("Tenants")
        .update({ Balance: newBalance })
        .eq("TenantID", unit.Tenants.TenantID)

      if (balanceError) {
        console.error("Error updating tenant balance:", balanceError)
        setError("Failed to update tenant balance")
        setIsSubmitting(false)
        return
      }

      // Insert payment record into the database
      const { error: insertError } = await supabase
        .from("Payments")
        .insert([paymentData])

      if (insertError) {
        console.error("Insert error:", insertError)
        setError(`Failed to save payment record: ${insertError.message}`)
        setIsSubmitting(false)
        return
      }

      // Rest of your code for showing receipt and success...
      // Prepare receipt data and show receipt
      const paymentSuccessData = {
        ...paymentData,
        UnitNumber: unit.UnitNumber,
        TenantFirstName: unit.Tenants.TenantFirstName,
        TenantLastName: unit.Tenants.TenantLastName,
        Price: unit.Price,
      }

      setReceiptData({
        paymentData: paymentSuccessData,
        unitData: {
          UnitNumber: unit.UnitNumber,
          Price: unit.Price,
          TenantFirstName: unit.Tenants.TenantFirstName,
          TenantLastName: unit.Tenants.TenantLastName,
        },
      })

      onSubmit(paymentSuccessData)
    } catch (err) {
      console.error("Error in payment submission:", err)
      setError("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="addpayment-modal-overlay">
      <div className="addpayment-modal-container">
        <div className="addpayment-modal-header">
          <h2>NEW PAYMENT</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="addpayment-modal-columns">
            <div className="addpayment-left-column">
              <div className="addpayment-form-group">
                <h3>UNIT NUMBER</h3>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className={`unit-select ${error && (error.includes("valid unit") || (error.includes("required fields") && !selectedUnit)) ? "error-input" : ""}`}
                  required
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
                <p>
                  Tenant: {selectedUnitDetails?.Tenants?.TenantFirstName || "N/A"}{" "}
                  {selectedUnitDetails?.Tenants?.TenantLastName || ""}
                </p>
                <p>
                  Monthly Rental: ₱
                  {selectedUnitDetails?.Price !== undefined ? selectedUnitDetails.Price.toLocaleString() : "0.00"}
                </p>
                <p>
                  Outstanding Balance: ₱
                  {selectedUnitDetails?.Price !== undefined
                    ? Math.max(0, selectedUnitDetails.Price - totalPaid).toLocaleString()
                    : "0.00"}
                </p>
                <p>Total Paid: ₱{totalPaid.toLocaleString()}</p>
                <p>
                  Rent Started:{" "}
                  {selectedUnitDetails?.Tenants?.MoveInDate
                    ? new Date(selectedUnitDetails.Tenants.MoveInDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>Payable Months: 1</p>
              </div>
            </div>

            <div className="addpayment-right-column">
              <div className="addpayment-date-input-group">
                <h3>DATE:</h3>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className={`addpayment-date-input ${error && error.includes("required fields") && !paymentDate ? "error-input" : ""}`}
                  required
                />
              </div>

              <div className="addpayment-form-group">
                <h3>AMOUNT PAID:</h3>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="₱0.00"
                  className={`addpayment-amount-input ${amountError ? "error-input" : ""}`}
                  required
                />
                {/* Show specific amount error under the field */}
                {amountError && <div className="field-error">{amountError}</div>}
              </div>

              <div className="addpayment-form-group">
                <h3>PROOF OF PAYMENT:</h3>
                <div className="addpayment-file-upload">
                  <label className="addpayment-upload-area">
                    <input type="file" name="paymentProof" onChange={handleFileChange} accept="image/*" />
                    <p>Drag and drop file here or click to upload</p>
                  </label>
                  {proofFile && <p className="addpayment-file-name">{proofFile.name}</p>}
                  {fileError && <div className="field-error">{fileError}</div>}
                </div>
              </div>

              {error && (
                <div className="form-error">
                  <div className="field-error">{error}</div>
                </div>
              )}

              <div className="addpayment-modal-actions">
                <button type="button" className="addpayment-cancel-btn" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="addpayment-save-btn"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !!amountError || !!fileError} // Disable button when there's an error
                >
                  {isSubmitting ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <Receipt paymentData={receiptData.paymentData} unitData={receiptData.unitData} onClose={handleCloseReceipt} />
      )}
    </div>
  )
}

export default AddPaymentModal
