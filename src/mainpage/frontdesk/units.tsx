import React, { useState, ChangeEvent, useEffect } from 'react';
import Header from '../../components/frontdesk_header';
import AdminMenu from '../../components/frontdesk_menu';
import './frontdeskunits.css';
import supabase from '../../supabaseClient';

interface Unit {
  unitID: number;
  number: string;
  price: number;
  details: string;
  status: 'Available' | 'Occupied';
}

const FrontdeskUnits: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchUnits = async () => {
    setLoading(true);
    const { data, error } = await supabase
    .from('Units')
    .select('UnitID, UnitNumber, Price, Description, UnitStatus');

    if (error) {
      console.error('Error fetching units:', error.message);
      setError('Failed to load units.');
    } else {
      const formattedUnits = data.map((unit: any) => ({
        unitID: unit.UnitID,
        number: unit.UnitNumber,
        price: unit.Price,
        details: unit.Description,
        status: unit.UnitStatus,
      }));
      setUnits(formattedUnits);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredUnits = units.filter((unit) =>
    unit.number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <Header />

      <div className="main-content-container">
        <AdminMenu isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="content-wrapper">
          <div className="white-container">
            <div className="header-section">
              <h1>Manage Units</h1>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search Here"
                  value={search}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
            </div>

            <div className="unit-list">
              {loading ? (
                <p>Loading units...</p>
              ) : error ? (
                <p className='form-error'>{error}</p>
              ) : filteredUnits.length === 0 ? (
                <p>Unit list is empty.</p>
              ) : (
                filteredUnits.map((unit) => (
                  <div className="unit-card" key={unit.unitID}>
                    <div className="unit-thumbnail">
                      {/* Placeholder for unit image */}
                    </div>

                    <div className="unit-details">
                      <div className="unit-header">
                        <strong>{unit.number}</strong>
                        <span>₱{unit.price.toLocaleString()}.00</span>
                      </div>
                      <p>{unit.details}</p>
                      <small className={`unit-status ${unit.status.toLowerCase()}`}>
                        {unit.status}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontdeskUnits;