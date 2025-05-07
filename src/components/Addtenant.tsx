"use client"

import type React from "react"
import { useEffect, useState } from "react"
import "./Addtenant.css"
import supabase from "../supabaseClient"

export interface AddTenantModalProps {
  onClose: () => void
  onTenantAdded?: () => Promise<void>
}

interface Unit {
  UnitID: number
  UnitNumber: string
  Price: number
  UnitStatus: "Available" | string
}

interface ValidationErrors {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  unitID?: string
  moveInDate?: string
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ onClose, onTenantAdded }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unitID, setUnitID] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedPrice, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUnits = async () => {
      const { data, error } = await supabase
        .from("Units")
        .select("UnitID, UnitNumber, Price, UnitStatus")
        .eq("UnitStatus", "Available")

      if (!error && data) {
        const availableUnits = data.filter((unit: Unit) => unit.UnitStatus === "Available")
        setUnits(availableUnits)
      } else {
        setError("Failed to fetch units.")
      }
    }

    fetchUnits()
  }, [])

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnitID = Number.parseInt(e.target.value)
    const selectedUnit = units.find((unit) => unit.UnitID === selectedUnitID)
    setUnitID(e.target.value)
    
    // Clear unit validation error when user selects a unit
    setValidationErrors(prev => ({ ...prev, unitID: undefined }))
    
    if (selectedUnit) {
      setPrice(selectedUnit.Price)
    } else {
      setPrice(null)
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    // Check required fields
    if (!firstName.trim()) {
      errors.firstName = "First name is required"
      isValid = false
    }
    
    if (!lastName.trim()) {
      errors.lastName = "Last name is required"
      isValid = false
    }
    
    if (!phone.trim()) {
      errors.phone = "Phone number is required"
      isValid = false
    } else if (!/^[0-9+\-\s()]*$/.test(phone)) {
      errors.phone = "Please enter a valid phone number"
      isValid = false
    }
    
    if (!email.trim()) {
      errors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }
    
    if (!unitID) {
      errors.unitID = "Unit selection is required"
      isValid = false
    }
    
    if (!moveInDate) {
      errors.moveInDate = "Move-in date is required"
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof ValidationErrors
  ) => {
    const { value } = e.target
    
    // Update the field value based on which field is being changed
    switch (field) {
      case 'firstName':
        setFirstName(value)
        break
      case 'lastName':
        setLastName(value)
        break
      case 'phone':
        setPhone(value)
        break
      case 'email':
        setEmail(value)
        break
      case 'moveInDate':
        setMoveInDate(value)
        break
    }
    
    // Clear the specific field error when user starts typing
    setValidationErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("You must be logged in to add a tenant.")
        setIsSubmitting(false)
        return
      }

      const { error: insertError } = await supabase.from("Tenants").insert({
        TenantFirstName: firstName.trim(),
        TenantLastName: lastName.trim(),
        ContactNumber: phone.trim(),
        TenantEmail: email.trim(),
        UnitID: Number.parseInt(unitID),
        MoveInDate: moveInDate,
        Balance: selectedPrice,
        MoveInUserID: user.id,
      })

      if (insertError) {
        setError(insertError.message)
        setIsSubmitting(false)
        return
      }

      const { error: updateError } = await supabase
        .from("Units")
        .update({ UnitStatus: "Occupied" })
        .eq("UnitID", Number.parseInt(unitID))

      if (updateError) {
        setError("Tenant added, but failed to update unit status: " + updateError.message)
        setIsSubmitting(false)
        return
      }

      if (onTenantAdded) {
        await onTenantAdded()
      }
      onClose()
    } catch (err) {
      console.error(err)
      setError("Unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="addtenant-modal-overlay" onClick={onClose}>
      <div className="addtenant-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="addtenant-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="addtenant-form-container">
          <h1 className="addtenant-form-title">Add Tenant</h1>

          {error && (
            <div className="form-error">
              <div className="field-error">{error}</div>
            </div>
          )}

          <div className="addtenant-form-section">
            <h2>Tenant Details</h2>
            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  className={`addtenant-form-input ${validationErrors.firstName ? 'error-input' : ''}`}
                  value={firstName}
                  onChange={(e) => handleFieldChange(e, 'firstName')}
                />
                {validationErrors.firstName && (
                  <div className="field-error">{validationErrors.firstName}</div>
                )}
              </div>

              <div className="addtenant-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  className={`addtenant-form-input ${validationErrors.lastName ? 'error-input' : ''}`}
                  value={lastName}
                  onChange={(e) => handleFieldChange(e, 'lastName')}
                />
                {validationErrors.lastName && (
                  <div className="field-error">{validationErrors.lastName}</div>
                )}
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className={`addtenant-form-input ${validationErrors.phone ? 'error-input' : ''}`}
                  value={phone}
                  onChange={(e) => handleFieldChange(e, 'phone')}
                />
                {validationErrors.phone && (
                  <div className="field-error">{validationErrors.phone}</div>
                )}
              </div>

              <div className="addtenant-form-group">
                <label>Email</label>
                <input
                  type="email"
                  className={`addtenant-form-input ${validationErrors.email ? 'error-input' : ''}`}
                  value={email}
                  onChange={(e) => handleFieldChange(e, 'email')}
                />
                {validationErrors.email && (
                  <div className="field-error">{validationErrors.email}</div>
                )}
              </div>
            </div>
          </div>

          <div className="addtenant-form-section">
            <h2>Assign Unit</h2>
            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Unit Number</label>
                <select
                  className={`addtenant-form-input ${validationErrors.unitID ? 'error-input' : ''}`}
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
                {validationErrors.unitID && (
                  <div className="field-error">{validationErrors.unitID}</div>
                )}
              </div>

              <div className="addtenant-form-group">
                <label>Move-in Date</label>
                <input
                  type="date"
                  className={`addtenant-form-input ${validationErrors.moveInDate ? 'error-input' : ''}`}
                  value={moveInDate}
                  onChange={(e) => handleFieldChange(e, 'moveInDate')}
                />
                {validationErrors.moveInDate && (
                  <div className="field-error">{validationErrors.moveInDate}</div>
                )}
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Price</label>
                <input 
                  type="number" 
                  value={selectedPrice ?? ""} 
                  className="addtenant-form-input"
                  readOnly 
                />
              </div>
              <div className="addtenant-form-group" />
            </div>
          </div>

          <div className="addtenant-form-actions">
            <button
              type="button"
              className="addtenant-clear-btn"
              onClick={() => {
                setFirstName("")
                setLastName("")
                setPhone("")
                setEmail("")
                setUnitID("")
                setPrice(null)
                setMoveInDate("")
                setValidationErrors({})
                setError(null)
              }}
              disabled={isSubmitting}
            >
              Clear
            </button>

            <button 
              type="button" 
              className="addtenant-submit-btn" 
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(validationErrors).length > 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
