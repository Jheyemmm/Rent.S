import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import MenuComponent from '../../components/admin_menu';
import Header from '../../components/header';
import AddPaymentModal from '../../components/addpayment';  
import EditPaymentModal from '../../components/edit-payment';
import SuccessModal from '../../components/paymentsuccess';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
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

  const handleAddPayment = async (paymentData: any) => {
    console.log('Submitted payment:', paymentData);
    try {
      // Store receipt data for later use when button is clicked
      const newReceiptData = {
        paymentData: {
          PaymentAmount: paymentData.PaymentAmount,
          PaymentDate: paymentData.PaymentDate,
          // Add the current timestamp as created_at
          created_at: new Date().toISOString(),
        },
        unitData: {
          UnitNumber: paymentData.UnitNumber || "",
          Price: paymentData.Price || 0,
          TenantFirstName: paymentData.TenantFirstName || "",
          TenantLastName: paymentData.TenantLastName || "",
        },
      };

      // First explicitly make sure receipt is hidden
      setShowReceipt(false);
      // Then store the receipt data for later use
      setReceiptData(newReceiptData);

      await fetchTransactions();
      setShowModal(false);
      // Show success modal only
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error refreshing transactions after add:', err);
    }
  };

  const handleViewReceipt = () => {
    setShowSuccessModal(false);
    setShowReceipt(true);
  };
  
  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  const handleEditPayment = async () => {
    try {
      await fetchTransactions();
      setShowEditModal(false);
      setSelectedTransaction(null);
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

  const openImageModal = async (receiptFile: string | null) => {
    if (!receiptFile) {
      alert('No receipt image available');
      return;
    }

    setImageLoading(true);
    setImageError(null);
    setShowImageModal(true);

    try {
      if (receiptFile.startsWith('http://') || receiptFile.startsWith('https://')) {
        setSelectedImage(receiptFile);
        return;
      }

      const fileName = receiptFile.split('/').pop();
      const storagePath = `proofs/${fileName}`;

      const { publicUrl } = supabase
        .storage
        .from('proof-of-payment')
        .getPublicUrl(storagePath).data;

      if (!publicUrl) {
        throw new Error('No public URL returned from Supabase');
      }

      setSelectedImage(publicUrl);
    } catch (error) {
      console.error('Error preparing image:', error);
      setImageError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setImageLoading(false);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setImageError(null);
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <MenuComponent ref={sidebarRef} isOpen={true} setIsOpen={() => {}} />
        <main className="dashboard-main">
          <div className="payment-container">
            <div className="payment-header">
              <h1>List of Transactions</h1>

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
                          No payment transactions found.
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
                                onClick={() => openImageModal(transaction.receiptFile)}
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
              onSubmit={handleAddPayment}
            />
          )}

          {showSuccessModal && (
            <SuccessModal
              onClose={() => setShowSuccessModal(false)}
              onViewPayment={handleViewReceipt}
            />
          )}

          {showReceipt && receiptData && (
            <Receipt
              paymentData={receiptData.paymentData}
              unitData={receiptData.unitData}
              onClose={handleCloseReceipt}
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
            <div className="image-modal-overlay" onClick={closeImageModal}>
              <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="image-modal-header">
                  <h3>Payment Receipt</h3>
                  <button onClick={closeImageModal} className="close-modal-btn">×</button>
                </div>
                <div className="image-modal-body">
                  {imageLoading && (
                    <div className="loading-receipt">Loading receipt...</div>
                  )}
                  
                  {!imageLoading && imageError && (
                    <div className="error-message">
                      <p>Error loading receipt: {imageError}</p>
                      <p>Please try again later or contact support.</p>
                    </div>
                  )}
                  
                  {!imageLoading && !imageError && selectedImage && (
                    <div className="image-container">
                      <img 
                        src={selectedImage} 
                        alt="Payment Receipt" 
                        onError={() => {
                          console.error('Image failed to load:', selectedImage);
                          setImageError('The image could not be displayed. It may be corrupted or in an unsupported format.');
                        }}
                      />
                      <div className="image-actions">
                        <a 
                          href={selectedImage} 
                          download="receipt" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="download-btn"
                        >
                          Download Receipt
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPayments;
