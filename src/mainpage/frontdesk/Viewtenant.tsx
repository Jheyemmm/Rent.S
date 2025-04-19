import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Header from '../../components/header';
import MenuComponent from '../../components/frontdesk_menu';
import { AddTenantModal } from '../../components/Addtenant';
import { MoveOutModal } from '../../components/moveout';
import './FrontdeskViewtenant.css';
import supabase from '../../supabaseClient';

interface Tenant {
  tenantID: number;
  firstName: string;
  lastName: string;
  moveIn: string;
  unit: number;
  balance: number;
  monthlyRent: number | string;
  lastPayment: string;
}

const FrontdeskViewTenant: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveOutModal, setShowMoveOutModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  const fetchTenants = async () => {
    setLoading(true);

    const { data, error } = await supabase
    .from('Tenants')
    .select('TenantID, TenantFirstName, TenantLastName, UnitID, MoveInDate, Balance, Units ( Price ), Payments (PaymentDate)');

    if (error) {
      console.error('Error fetching tenants:', error.message);
      setError('Failed to load tenants.');
    } else {
      const formattedTenants = data.map((tenant: any) => {
        // Sort payments by date to get the latest one
        const sortedPayments = tenant.Payments?.sort((a: any, b: any) => new Date(b.PaymentDate).getTime() - new Date(a.PaymentDate).getTime());
        const lastPayment = sortedPayments?.[0]?.PaymentDate || '-';
  
        return {
          tenantID: tenant.TenantID,
          firstName: tenant.TenantFirstName,
          lastName: tenant.TenantLastName,
          moveIn: new Date(tenant.MoveInDate).toLocaleDateString(),
          unit: tenant.UnitID,
          balance: tenant.Balance,
          monthlyRent: tenant.Units?.Price ?? '-',
          lastPayment,
        };
      });
      setTenants(formattedTenants);
    }
    setLoading(false);
  };

  useEffect(() => {
      fetchTenants();
    }, [])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
  };

  const filteredTenants = tenants.filter((tenant) =>
    tenant.lastName.toLowerCase().includes(search.toLowerCase())
  );

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
                      <td>{tenant.moveIn}</td>
                      <td>{tenant.unit}</td>
                      <td>{tenant.monthlyRent}</td>
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

export default FrontdeskViewTenant;
