import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuComponent from '../../components/admin_menu';
import Header from '../../components/header';
import AddPaymentModal from '../../components/addpayment';
import EditPaymentModal from '../../components/edit-payment';
import PaymentUpdateSuccessDialog from '../../components/paymenteditsuccess'; // Import success dialog
import Receipt from "../../components/Receipt";
import './AdminViewPayment.css';
import supabase from '../../supabaseClient';

interface Transaction {
  id: number;
  name: string;
  unit: string;
  amount: string;
  receipt: string;
  receiptFile: string | null;
  date: string;
}

interface ReceiptData {
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
}

const AdminPayments: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); // State for success dialog
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: currentTenants, error: tenantError } = await supabase
        .from('Tenants')
        .select('TenantID')
        .is('MoveOutDate', null);

      if (tenantError) {
        console.error('Error fetching current tenants:', tenantError);
        setError('Failed to load current tenants.');
        return;
      }

      const currentTenantIds = currentTenants.map(tenant => tenant.TenantID);
      
      if (currentTenantIds.length === 0) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('Payments')
        .select(`
          PaymentID,
          PaymentAmount,
          PaymentDate,
          PaymentProof,
          Tenants (TenantID, TenantFirstName, TenantLastName),
          Units (UnitID, UnitNumber)
        `)
        .in('TenantID', currentTenantIds)
        .order('PaymentDate', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        setError('Failed to load payment transactions.');
        return;
      }

      const formattedTransactions = data.map((payment: any) => {
        const receiptFileName = payment.PaymentProof 
          ? payment.PaymentProof.split('/').pop() 
          : null;

        return {
          id: payment.PaymentID,
          name: payment.Tenants 
            ? `${payment.Tenants.TenantFirstName} ${payment.Tenants.TenantLastName}`
            : 'Unknown Tenant',
          unit: payment.Units 
            ? `Unit ${payment.Units.UnitNumber}` 
            : `Unit ${payment.UnitID || 'Unknown'}`,
          amount: `₱${payment.PaymentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          receipt: receiptFileName || 'No Receipt',
          receiptFile: payment.PaymentProof,
          date: payment.PaymentDate 
            ? new Date(payment.PaymentDate).toLocaleDateString()
            : 'Unknown Date'
        };
      });

      setTransactions(formattedTransactions);
    } catch (err) {
      console.error('Error in fetchTransactions:', err);
      setError('An unexpected error occurred while loading payment data.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPayment = async () => {
    try {
      await fetchTransactions();
      setShowEditModal(false);
      setSelectedTransaction(null);
      setShowSuccessDialog(true); // Show success dialog
      setSuccessTitle('Payment Updated');
      setSuccessMessage('The payment has been successfully updated.');
    } catch (err) {
      console.error('Error refreshing transactions after edit:', err);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    transaction.unit.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <MenuComponent ref={sidebarRef} isOpen={true} setIsOpen={() => {}} />
        <main className="dashboard-main">
          <div className="payment-container">
            <div className="payment-header">
              <div className="title-section">
                <h1>List of Transactions</h1>
                <button 
                  className="payment-history-btn"
                  onClick={() => navigate('/payment-history')}
                >
                  Past Tenant Payment History
                </button>
              </div>

              <div className="header-right-section">
                <button 
                  className="add-payment-btn"
                  onClick={() => setShowModal(true)}
                >
                  Add new payment
                  <span className="plus-icon">+</span>
                </button>

                <div className="payment-search-container">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder={!searchFocused && searchValue === '' ? "Search Here" : ""}
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
              </div>
            </div>

            <div className="payment-table-container">
              {loading ? (
                <div className="loading-spinner">Loading...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Unit number</th>
                      <th>Amount</th>
                      <th>Proof of payment</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="no-transactions-message">
                          No current tenant payment transactions found.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{transaction.name}</td>
                          <td>{transaction.unit}</td>
                          <td>{transaction.amount}</td>
                          <td>
                            {transaction.receiptFile ? (
                              <button 
                                className="view-receipt-btn"
                                onClick={() => {
                                  setSelectedImage(transaction.receiptFile);
                                  setShowImageModal(true);
                                }}
                              >
                                View Receipt
                              </button>
                            ) : (
                              'No Receipt'
                            )}
                          </td>
                          <td>{transaction.date}</td>
                          <td>
                            <button
                              className="adminpayment-edit-btn"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowEditModal(true);
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {showModal && (
            <AddPaymentModal
              onClose={() => setShowModal(false)}
              onSubmit={async () => {
                await fetchTransactions();
                setShowSuccessDialog(true);
                setSuccessTitle('Payment Added');
                setSuccessMessage('The payment has been successfully added.');
              }}
            />
          )}

          {showSuccessDialog && (
            <PaymentUpdateSuccessDialog
              onClose={() => setShowSuccessDialog(false)}
              title={successTitle}
              message={successMessage}
            />
          )}

          {showEditModal && selectedTransaction && (
            <EditPaymentModal
              transaction={selectedTransaction}
              onClose={() => {
                setShowEditModal(false);
                setSelectedTransaction(null);
              }}
              onSubmit={handleEditPayment}
            />
          )}

          {showImageModal && (
            <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
              <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                {imageLoading ? (
                  <div className="loading-spinner">Loading image...</div>
                ) : imageError ? (
                  <div className="error-message">{imageError}</div>
                ) : (
                  <img src={selectedImage || ''} alt="Receipt" />
                )}
                <button className="close-image-modal-btn" onClick={() => setShowImageModal(false)}>Close</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPayments;
