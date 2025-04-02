import React, { useState } from 'react';
import './Viewtenant.css';

const ViewTenant: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Tenant data ilisi ra ug naa nay data
  const tenants = [
    { firstName: 'John', lastName: 'Simth', moveInDate: '09/25/24', unit: '201', rent: 'P18,000', balance: 'P18,000', lastPayment: 'N/A' },
    { firstName: 'Nick', lastName: 'Gghani', moveInDate: '08/25/24', unit: '202', rent: 'P18,000', balance: 'P10,000', lastPayment: '09/30/24' },
    { firstName: 'Nick', lastName: 'Gghani', moveInDate: '08/25/24', unit: '203', rent: 'P18,000', balance: 'P10,000', lastPayment: '09/30/24' },
    { firstName: 'Nick', lastName: 'Gghani', moveInDate: '08/25/24', unit: '204', rent: 'P18,000', balance: 'P0.00', lastPayment: '09/30/24' }
  ];

  return (
    <div className="tenant-container">
      <div className="tenant-header">
        <h1>All Tenants</h1>
        <div className="search-container">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={!searchFocused && searchValue === '' ? "Search Here" : ""}
          />
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
              <th> </th>
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
                <td><button className="move-out-btn">Move out</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewTenant;