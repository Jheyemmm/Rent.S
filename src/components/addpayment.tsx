import React, { useEffect, useState } from 'react';
import './addpayment.css';
import supabase from '../supabaseClient';

interface AddPaymentModalProps {
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
}

interface Unit {
  UnitID: number;
  UnitNumber: string;
  Price: number;
  Tenants?: {
    TenantID: number;
    TenantFirstName: string;
    TenantLastName: string;
    MoveInDate: string;
  }
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [selectedUnit, setSelectedUnit] = useState('');
    const [units, setUnits] = useState<Unit[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [currentUserID, setCurrentUserID] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalPaid, setTotalPaid] = useState<number>(0);
  
    // Fetch current user ID when component mounts
    useEffect(() => {
      const fetchCurrentUser = async () => {
        try {
          // Get the current authenticated user
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (!authUser) {
            setError("User not authenticated");
            return;
          }
          
          // Fetch the user's database record to get their UserID
          const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('UserID')
            .eq('Email', authUser.email)
            .single();
            
          if (userError || !userData) {
            console.error('Error fetching user ID:', userError);
            setError("Failed to get user information");
            return;
          }
          
          setCurrentUserID(userData.UserID);
        } catch (err) {
          console.error("Error fetching current user:", err);
          setError("Authentication error");
        }
      };
      
      fetchCurrentUser();
    }, []);

    useEffect(() => {
      const fetchUnits = async () => {
        const { data, error } = await supabase
        .from('Units')
        .select('UnitID, UnitNumber, Price, UnitStatus, Tenants (TenantID, TenantFirstName, TenantLastName, MoveInDate)')
        .eq('UnitStatus', 'Occupied'); 

        if (error) {
          console.error(error);
          setError('Failed to fetch units.');
        } else {
          console.log('Fetched occupied units with tenants:', data);
          setUnits(data.map((unit: any) => ({
            UnitID: unit.UnitID,
            UnitNumber: unit.UnitNumber,
            Price: unit.Price || 0,  // Ensure Price is never undefined
            Tenants: Array.isArray(unit.Tenants) ? unit.Tenants[0] : unit.Tenants ?? undefined
          })));
        }
      };

      fetchUnits();
    }, []);

    const selectedUnitDetails = units.find((unit) => unit.UnitID.toString() === selectedUnit);

    useEffect(() => {
      const fetchTotalPaid = async () => {
        if (!selectedUnit) {
          setTotalPaid(0); // Reset to 0 when no unit is selected
          return;
        }

        const { data, error } = await supabase
          .from('Payments')
          .select('PaymentAmount')
          .eq('UnitID', selectedUnit);

        if (error) {
          console.error('Error fetching payments:', error);
          setTotalPaid(0);
          return;
        }

        if (data && data.length > 0) {
          const total = data.reduce((sum, p) => sum + (p.PaymentAmount || 0), 0);
          setTotalPaid(total);
        } else {
          setTotalPaid(0);
        }
      };

      fetchTotalPaid();
    }, [selectedUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
    setError(null); // Clear previous errors

    try {
      if (!amount || !paymentDate || !selectedUnit) {
        setError("Please fill all required fields.");
        setIsSubmitting(false);
        return;
      }
      
      if (!currentUserID) {
        setError("User authentication required");
        setIsSubmitting(false);
        return;
      }
    
      const unit = units.find((u) => u.UnitID.toString() === selectedUnit);
      if (!unit || !unit.Tenants) {
        setError("Please select a valid unit.");
        setIsSubmitting(false);
        return;
      }

      if (!proofFile) {
        setError("Please upload a proof of payment file.");
        setIsSubmitting(false);
        return;
      }

      let proofUrl = '';

      try {
        // Get file extension and create a unique filename
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `proofs/${fileName}`;

        console.log("Uploading file to bucket: proof-of-payment, path:", filePath);

        // Upload the proof file to the correct bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proof-of-payment')  // Using the correct bucket name
          .upload(filePath, proofFile, {
            cacheControl: '3600',
            upsert: false
          });
      
        if (uploadError) {
          console.error("Upload error:", uploadError);
          setError(`Failed to upload proof of payment: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }
        
        // Get the public URL from the correct bucket
        const { data } = supabase.storage
          .from('proof-of-payment')  // Using the correct bucket name
          .getPublicUrl(filePath);
          
        proofUrl = data.publicUrl;
        console.log("File uploaded successfully. Public URL:", proofUrl);
      } catch (uploadErr) {
        console.error("File upload error:", uploadErr);
        setError("Error during file upload. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        setError("Please enter a valid payment amount.");
        setIsSubmitting(false);
        return;
      }

      // Create payment data object matching the Payments table structure
      const paymentData = {
        TenantID: unit.Tenants.TenantID,
        UnitID: unit.UnitID,
        PaymentAmount: parsedAmount,
        PaymentDate: paymentDate,
        PaymentProof: proofUrl,
        UserID: currentUserID, // Use the fetched UserID from the authenticated user
      };

      console.log("Sending payment data:", paymentData);

      // Insert payment record into the database
      const { error: insertError } = await supabase
        .from('Payments')
        .insert([paymentData]);

      if (insertError) {
        console.error("Insert error:", insertError);
        setError(`Failed to save payment record: ${insertError.message}`);
        setIsSubmitting(false);
        return;
      }

      // Success - call onSubmit and close modal
      onSubmit(paymentData);
      onClose();
      console.log('Payment saved successfully.');
    } catch (err) {
      console.error("Error in payment submission:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="addpayment-modal-overlay"> 
      <div className="addpayment-modal-container"> 
        <div className="addpayment-modal-header"> 
          <h2>NEW PAYMENT</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
  
        <form onSubmit={handleSubmit}>
          <div className="addpayment-modal-columns">
            <div className="addpayment-left-column">
              <div className="addpayment-form-group">
                <h3>UNIT NUMBER</h3>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="unit-select"
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
                <p>Tenant: {selectedUnitDetails?.Tenants?.TenantFirstName || 'N/A'} {selectedUnitDetails?.Tenants?.TenantLastName || ''}</p>
                <p>Monthly Rental: ₱{selectedUnitDetails?.Price !== undefined ? selectedUnitDetails.Price.toLocaleString() : '0.00'}</p>
                <p>Outstanding Balance: ₱{
                  selectedUnitDetails?.Price !== undefined 
                    ? Math.max(0, selectedUnitDetails.Price - totalPaid).toLocaleString() 
                    : '0.00'
                }</p>
                <p>Total Paid: ₱{totalPaid.toLocaleString()}</p>
                <p>Rent Started: {
                    selectedUnitDetails?.Tenants?.MoveInDate
                      ? new Date(selectedUnitDetails.Tenants.MoveInDate).toLocaleDateString()
                      : 'N/A'}
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
                  className="addpayment-date-input"
                  required
                />
              </div>

              <div className="addpayment-form-group">
                <h3>AMOUNT PAID:</h3>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₱0.00"
                  className="addpayment-amount-input"
                  required
                />
              </div>

              <div className="addpayment-form-group">
                <h3>PROOF OF PAYMENT:</h3>
                <div className="addpayment-file-upload">
                  <label className="addpayment-upload-area">
                    <input
                      type="file"
                      name="paymentProof"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      accept="image/*,.pdf"
                    />
                    <p>Drag and drop file here or click to upload</p>
                  </label>
                  {proofFile && <p className="addpayment-file-name">{proofFile.name}</p>}
                </div>
              </div>

              {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

              <div className="addpayment-modal-actions">
                <button 
                  type="button" 
                  className="addpayment-cancel-btn" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="addpayment-save-btn" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Payment'}
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