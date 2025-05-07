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

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unitID, setUnitID] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [balance, setBalance] = useState('');
  const [units, setUnits] = useState<{ UnitID: number; UnitNumber: string; Price: number; UnitStatus: string }[]>([]);
  const [selectedPrice, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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
        setError('Failed to fetch units.')
      }
    }

    fetchUnits()
  }, [])

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnitID = Number.parseInt(e.target.value)
    const selectedUnit = units.find((unit) => unit.UnitID === selectedUnitID)
    setUnitID(e.target.value)
    if (selectedUnit) {
      setPrice(selectedUnit.Price)
      setUnitError(null)
    } else {
      setPrice(null)
      setUnitError("Please select a valid unit.")
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    let isValid = true

    if (!firstName.trim()) {
      newErrors.firstName = "Please fill out this field."
      isValid = false
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Please fill out this field."
      isValid = false
    }
    if (!phone.trim()) {
      newErrors.phone = "Please fill out this field."
      isValid = false
    }
    if (!email.trim()) {
      newErrors.email = "Please fill out this field."
      isValid = false
    }
    if (!unitID.trim()) {
      newErrors.unitID = "Please select a unit."
      isValid = false
    }
    if (!moveInDate.trim()) {
      newErrors.moveInDate = "Please select a move-in date."
      isValid = false
    }

    setValidationErrors(newErrors)
    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      unitID: true,
      moveInDate: true,
    })

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUnitError(null)

    if (!validateForm()) return

    try {
      const { 
        data: { user }, 
        error: userError, 
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('You must be logged in to add a tenant.')
        return;
      }

      const { error: insertError } = await supabase
      .from('Tenants')
      .insert({
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
        return
      }

      const { error: updateError } = await supabase
        .from('Units')
        .update({ UnitStatus: 'Occupied' })
        .eq('UnitID', parseInt(unitID));
  
      if (updateError) {
        setError("Tenant added, but failed to update unit status: " + updateError.message)
        return
      }
  
      setError(null); // clear any previous error
      alert('Tenant added successfully!');
      onClose(); // close modal on success

    } catch (err) {
      console.error(err)
      setError("Unexpected error occurred.")
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
            <div className="validation-error">
              <span className="error-icon">!</span>
              <span className="error-message">{error}</span>
            </div>
          )}
          {unitError && (
            <div className="validation-error">
              <span className="error-icon">!</span>
              <span className="error-message">{unitError}</span>
            </div>
          )}

          <div className="addtenant-form-section">
            <h2>Tenant Details</h2>
            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  className="addtenant-form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {touched.firstName && validationErrors.firstName && (
                  <div className="validation-error">
                    <span className="error-icon">!</span>
                    <span className="error-message">{validationErrors.firstName}</span>
                  </div>
                )}
              </div>

              <div className="addtenant-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  className="addtenant-form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {touched.lastName && validationErrors.lastName && (
                  <div className="validation-error">
                    <span className="error-icon">!</span>
                    <span className="error-message">{validationErrors.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="addtenant-form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {touched.phone && validationErrors.phone && (
                  <div className="validation-error">
                    <span className="error-icon">!</span>
                    <span className="error-message">{validationErrors.phone}</span>
                  </div>
                )}
              </div>

              <div className="addtenant-form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="addtenant-form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {touched.email && validationErrors.email && (
                  <div className="validation-error">
                    <span className="error-icon">!</span>
                    <span className="error-message">{validationErrors.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="addtenant-form-section">
            <h2>Assign Unit</h2>
            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Unit number</label>
                <select
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
                {touched.unitID && validationErrors.unitID && (
                  <div className="validation-error">
                    <span className="error-icon">!</span>
                    <span className="error-message">{validationErrors.unitID}</span>
                  </div>
                )}
              </div>

              <div className="addtenant-form-group">
                <label>Move in date</label>
                <input 
                type="date" 
                value = {moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                />
              </div>
            </div>

            <div className="addtenant-form-row">
              <div className="addtenant-form-group">
                <label>Price</label>
                <input 
                type="number" 
                value={selectedPrice ?? ''} readOnly 
                />
              </div>
              <div className="addtenant-form-group" />
            </div>
          </div>

          <div className="addtenant-form-actions">
            <button 
            type="button" 
            className="addtenant-clear-btn"
            onClick={() =>{
              setFirstName('');
              setLastName('');
              setPhone('');
              setEmail('');
              setUnitID('');
              setPrice(null);
              setMoveInDate('');
            }}
            >Clear</button>

            <button 
            type="button"
            className="addtenant-submit-btn"
            onClick={handleSubmit}
            >Submit</button>
          </div>
        </div>
      </div>
    </div>
  )
}
