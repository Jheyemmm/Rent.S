import React, { useState, useRef } from 'react';

import Header from "../../components/header";
import MenuComponent from '../../components/admin_menu';
import AddPaymentModal from '../../components/addpayment';
import { EditPaymentModal } from '../../components/EditPaymentModal';
import './AdminViewPayment.css';

const AdminViewPayment: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      name: 'John Smith',
      unit: 'Unit 302',
      amount: '$1,250.00',
      receipt: 'receipt_302_1015.pdf',
      date: '2023-10-15'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      unit: 'Unit 105',
      amount: '$1,150.00',
      receipt: 'receipt_105_1014.pdf',
      date: '2023-10-14'
    },
    {
      id: 3,
      name: 'David Kim',
      unit: 'Unit 412',
      amount: '$1,350.00',
      receipt: 'receipt_412_1012.pdf',
      date: '2023-10-12'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      unit: 'Unit 208',
      amount: '$1,100.00',
      receipt: 'receipt_208_1010.pdf',
      date: '2023-10-10'
    },
    {
      id: 5,
      name: 'Robert Chen',
      unit: 'Unit 501',
      amount: '$1,400.00',
      receipt: 'receipt_501_1008.pdf',
      date: '2023-10-08'
    }
  ]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const handleAddPayment = (paymentData: any) => {
    setTransactions(prev => [
      {
        id: prev.length + 1,
        name: paymentData.name,
        unit: paymentData.unit,
        amount: `$${paymentData.amount.toFixed(2)}`,
        receipt: `receipt_${paymentData.unit.replace('Unit ', '')}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`,
        date: new Date().toISOString().slice(0, 10)
      },
      ...prev
    ]);
    setShowModal(false);
  };

  const handleEdit = (id: number) => {
    const transactionToEdit = transactions.find(t => t.id === id);
    if (transactionToEdit) {
      setEditingTransaction(transactionToEdit);
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = (paymentData: any) => {
    setTransactions(prev => prev.map(t => 
      t.id === editingTransaction.id 
        ? { 
            ...t, 
            name: paymentData.name,
            unit: paymentData.unit,
            amount: `$${parseFloat(paymentData.amount).toFixed(2)}`,
            date: paymentData.date
          } 
        : t
    ));
    setShowEditModal(false);
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    transaction.unit.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="admin-dashboard-content">
      <Header />
      <MenuComponent ref={sidebarRef} isOpen={true} setIsOpen={() => {}} />
      <main className="admin-dashboard-main">
        <div className="admin-payment-container">
          <div className="admin-payment-header">
            <h1>Payments</h1>

            <div className="admin-header-right-section">
              <div className="admin-header-actions">
                <button 
                  className="admin-add-payment-btn"
                  onClick={() => setShowModal(true)}
                >
                  Add new payment
                  <span className="admin-plus-icon">+</span>
                </button>

                <div className="admin-payment-search-container">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder={!searchFocused && searchValue === '' ? "Search Here" : ""}
                  />
                  <i className="fas fa-search admin-search-icon"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-payment-table-container">
            <table className="admin-payment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Unit number</th>
                  <th>Amount</th>
                  <th>Proof of payment</th>
                  <th>Date</th>
                  <th> </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.name}</td>
                    <td>{transaction.unit}</td>
                    <td>{transaction.amount}</td>
                    <td>
                      <a href="#" onClick={(e) => { 
                        e.preventDefault(); 
                        alert(`Viewing ${transaction.receipt}`); 
                      }}>
                        View Receipt
                      </a>
                    </td>
                    <td>{transaction.date}</td>
                    <td>
                      <button 
                        className="admin-edit-btn"
                        onClick={() => handleEdit(transaction.id)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <AddPaymentModal
            onClose={() => setShowModal(false)}
            onSubmit={handleAddPayment}
          />
        )}

        {showEditModal && editingTransaction && (
          <EditPaymentModal
            onClose={() => setShowEditModal(false)}
            onSubmit={handleEditSubmit}
            transaction={editingTransaction}
          />
        )}
      </main>
    </div>
  );
};

export default AdminViewPayment;