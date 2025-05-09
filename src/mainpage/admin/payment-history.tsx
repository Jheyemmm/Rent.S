import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import supabase from "../../supabaseClient";
import Header from "../../components/header";
import MenuComponent from "../../components/admin_menu";
import "./payment-history.css";

interface Payment {
  PaymentID: number;
  PaymentAmount: number;
  PaymentDate: string;
  PaymentProof: string | null;
  TenantName?: string;
  UnitNumber?: string;
  UserName?: string;
  MoveOutDate?: string;
}

const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First, get all tenants who have moved out
        const { data: pastTenants, error: tenantError } = await supabase
          .from("Tenants")
          .select("TenantID")
          .not("MoveOutDate", "is", null);

        if (tenantError) {
          console.error("Error fetching past tenants:", tenantError);
          setLoading(false);
          return;
        }

        // Extract tenant IDs
        const pastTenantIds = pastTenants.map(tenant => tenant.TenantID);
        
        if (pastTenantIds.length === 0) {
          // No past tenants found
          setPayments([]);
          setFilteredPayments([]);
          setLoading(false);
          return;
        }

        // Fetch payments for past tenants only
        const { data: paymentData, error: paymentError } = await supabase
          .from("Payments")
          .select(`
            PaymentID,
            PaymentAmount,
            PaymentDate,
            PaymentProof,
            TenantID,
            UnitID,
            UserID,
            Tenants (TenantFirstName, TenantLastName, MoveOutDate),
            Units (UnitNumber),
            Users (UserFirstName, UserLastName)
          `)
          .in("TenantID", pastTenantIds)
          .order("PaymentDate", { ascending: false });

        if (paymentError) {
          console.error("Error fetching payments:", paymentError);
          setLoading(false);
          return;
        }

        // Format payment data with tenant and unit information
        const formattedPayments = paymentData.map((payment: any) => {
          const tenantName = payment.Tenants 
            ? `${payment.Tenants.TenantFirstName} ${payment.Tenants.TenantLastName}`
            : "Unknown";

          const userName = payment.Users
            ? `${payment.Users.UserFirstName} ${payment.Users.UserLastName}`
            : "Unknown";

          return {
            PaymentID: payment.PaymentID,
            PaymentAmount: payment.PaymentAmount,
            PaymentDate: new Date(payment.PaymentDate).toLocaleDateString(),
            PaymentProof: payment.PaymentProof,
            TenantName: tenantName,
            UnitNumber: payment.Units?.UnitNumber || "Unknown",
            UserName: userName,
            MoveOutDate: payment.Tenants?.MoveOutDate ? new Date(payment.Tenants.MoveOutDate).toLocaleDateString() : "Unknown"
          };
        });

        setPayments(formattedPayments);
        setFilteredPayments(formattedPayments);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPayments(payments);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = payments.filter(
      (payment) =>
        payment.TenantName?.toLowerCase().includes(term) ||
        payment.UnitNumber?.toLowerCase().includes(term) ||
        payment.PaymentDate.includes(term) ||
        payment.PaymentAmount.toString().includes(term) ||
        payment.UserName?.toLowerCase().includes(term)
    );

    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleViewPayments = () => {
    navigate("/adminViewPayment");
  };

  const formatAmount = (amount: number): string => {
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const openReceiptModal = (receiptUrl: string) => {
    setSelectedReceipt(receiptUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReceipt(null);
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <MenuComponent isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="dashboard-main">
          <div className="tenant-container">
            <div className="tenant-header">
              <h1>Past Tenant Payment History</h1>
              
              <div className="header-right-section">
                <button 
                  style={{ backgroundColor: "#4CBD8D", color: "white" }}
                  onClick={handleViewPayments}
                >
                  Current Payments
                </button>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <i className="fas fa-search"></i>
                </div>
              </div>
            </div>

            <div className="tenant-table-container">
              {loading ? (
                <div className="loading-indicator">Loading payment history...</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Unit</th>
                      <th>Payment Date</th>
                      <th>Move-Out Date</th>
                      <th>Amount</th>
                      <th>Recorded By</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <tr key={payment.PaymentID}>
                          <td>{payment.TenantName}</td>
                          <td>{payment.UnitNumber}</td>
                          <td>{payment.PaymentDate}</td>
                          <td>{payment.MoveOutDate}</td>
                          <td style={{ fontWeight: 500 }}>
                            {formatAmount(payment.PaymentAmount)}
                          </td>
                          <td>{payment.UserName}</td>
                          <td>
                            {payment.PaymentProof && (
                              <button 
                                className="view-receipt-btn"
                                onClick={() => openReceiptModal(payment.PaymentProof as string)}
                              >
                                View Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                          No past tenant payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image/Receipt Modal */}
      {showModal && selectedReceipt && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>Payment Receipt</h3>
              <button onClick={closeModal}>×</button>
            </div>
            <div className="image-modal-body">
              <img src={selectedReceipt || "/placeholder.svg"} alt="Payment Receipt" />
              <a href={selectedReceipt} target="_blank" rel="noopener noreferrer">
                Open Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;