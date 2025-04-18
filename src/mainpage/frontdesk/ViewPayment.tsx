import React, { useState, useRef } from 'react';
import MenuComponent from '../../components/frontdesk_menu';
import Header from '../../components/header';
import AddPaymentModal from '../../components/addpayment';
import './ViewPayment.css';

const Payments: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    console.log('Submitted payment:', paymentData);
    // Add the new payment to transactions
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
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder={!searchFocused && searchValue === '' ? "Search Here" : ""}
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
              </div>
            </div>

            <div className="payment-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Unit number</th>
                    <th>Amount</th>
                    <th>Proof of payment</th>
                    <th>Date</th>
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
        </main>
      </div>
    </div>
  );
};

export default Payments;