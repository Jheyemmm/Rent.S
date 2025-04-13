import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/frontdesk_header';
import MenuComponent from '../components/frontdesk_menu';
import { AddTenantModal } from '../components/Addtenant';
import { MoveOutModal } from '../components/moveout';
import './Viewtenant.css';


const ViewTenant: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveOutModal, setShowMoveOutModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Tenant data
  const tenants = [
    { firstName: 'John', lastName: 'Simth', moveInDate: '09/25/24', unit: '201', rent: 'P18,000', balance: 'P18,000', lastPayment: 'N/A' },
    { firstName: 'Nick', lastName: 'Gghani', moveInDate: '08/25/24', unit: '202', rent: 'P18,000', balance: 'P10,000', lastPayment: '09/30/24' },
    { firstName: 'Nick', lastName: 'Gghani', moveInDate: '08/25/24', unit: '203', rent: 'P18,000', balance: 'P10,000', lastPayment: '09/30/24' },
    { firstName: 'Nick', lastName: 'Gghani', moveInDate: '08/25/24', unit: '204', rent: 'P18,000', balance: 'P0.00', lastPayment: '09/30/24' }
  ];

  const handleMoveOutClick = (tenant: any) => {
    setSelectedTenant(tenant);
    setShowMoveOutModal(true);
  };

  const handleMoveOutSubmit = (formData: any) => {
    console.log('Move out submitted:', formData);
    // Add your move-out logic here
    setShowMoveOutModal(false);
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <MenuComponent ref={sidebarRef} isOpen={isOpen} setIsOpen={setIsOpen} />
        
        <main className="dashboard-main">
          <div className="tenant-container">
            <div className="tenant-header">
              <h1>All Tenants</h1>
              
              <div className="header-right-section">
                <button 
                  className="add-tenants-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Tenants
                  <span className="plus-icon">+</span>
                </button>

                <div className="search-container">
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

            <div className="tenant-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Firstname</th>
                    <th>Lastname</th>
                    <th>Move-in Date</th>
                    <th>Unit</th>
                    <th>Monthly Rent</th>
                    <th>Outstanding balance</th>
                    <th>Last payment</th>
                    <th>Action</th>
                  </tr>   
                </thead>
                <tbody>
                  {tenants.map((tenant, index) => (
                    <tr key={index}>
                      <td>{tenant.firstName}</td>
                      <td>{tenant.lastName}</td>
                      <td>{tenant.moveInDate}</td>
                      <td>{tenant.unit}</td>
                      <td>{tenant.rent}</td>
                      <td>{tenant.balance}</td>
                      <td>{tenant.lastPayment}</td>
                      <td>
                        <button 
                          className="move-out-btn" 
                          onClick={() => handleMoveOutClick(tenant)}
                        >
                          Move out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {showAddModal && <AddTenantModal onClose={() => setShowAddModal(false)} />}
      {showMoveOutModal && selectedTenant && (
        <MoveOutModal 
          onClose={() => setShowMoveOutModal(false)}
          onSubmit={handleMoveOutSubmit}
          initialData={{
            name: selectedTenant.firstName,
            lastName: selectedTenant.lastName,
            unit: selectedTenant.unit,
            unpaidBalance: selectedTenant.balance,
            startDate: selectedTenant.moveInDate,
            endDate: new Date().toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: '2-digit'
            }).replace(/\//g, '/')
          }}
        />
      )}
    </div>

  );
};

export default ViewTenant;
