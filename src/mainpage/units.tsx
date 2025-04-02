import React, { useState, ChangeEvent } from 'react';
import Header from '../components/header';
import FrontdeskMenu from '../components/frontdesk_menu';
import './units.css';

interface Unit {
  id: number;
  name: string;
}

const Units: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [units] = useState<Unit[]>([]);
  const [search, setSearch] = useState<string>('');

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <Header />

      <div className="content-container">
        <FrontdeskMenu isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="main-content">
          <div className="white-container">
            
            <div className="header-section">
              <h1>Manage Units</h1>
              <div className="search-button-container">
                <input
                  type="text"
                  placeholder="Search units..."
                  value={search}
                  onChange={handleSearchChange}
                />
                <button className="add-unit-btn">Add Unit</button>
              </div>
            </div>

            <div className="list-section">
              {filteredUnits.length === 0 ? (
                <p>Unit is empty</p>
              ) : (
                <ul>
                  {filteredUnits.map((unit) => (
                    <li key={unit.id}>{unit.name}</li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Units;
