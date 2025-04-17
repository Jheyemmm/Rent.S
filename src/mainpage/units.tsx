import React, { useState, ChangeEvent } from 'react';
import Header from '../components/admin_header';
import AdminMenu from '../components/admin_menu';
import './units.css';
import AddUnitButtonIcon from '../assets/icons/add-unit-button.png';
import AddUnit from '../components/add-unit';  // Import the AddUnit component
import EditUnit from '../components/edit-unit'; // Import the EditUnit component
import supabase from '../supabaseClient';
import { useEffect } from 'react';

interface Unit {
  unitID: number;
  number: string;
  price: number;
  details: string;
  status: 'Available' | 'Occupied';
}

const Units: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);
  const [isAddUnitFormVisible, setIsAddUnitFormVisible] = useState(false); // Manage the visibility of AddUnit form
  const [isEditUnitFormVisible, setIsEditUnitFormVisible] = useState(false); // Manage visibility of EditUnit form
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null); // Store the unit being edited

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
  }, [])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredUnits = units.filter((unit) =>
    unit.number.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDropdown = (unitId: number) => {
    if (isDropdownOpen === unitId) {
      setIsDropdownOpen(null);
    } else {
      setIsDropdownOpen(unitId);
    }
  };

  const handleUpdate = (unitId: number) => {
    const unitToEdit = units.find((unit) => unit.unitID === unitId);
    if (unitToEdit) {
      setUnitToEdit(unitToEdit); // Set the unit to edit
      setIsEditUnitFormVisible(true); // Show the EditUnit form
    }
  };

  const handleDelete = async (unitID: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this unit?')
    if (!confirmDelete) return;

    const { error } = await supabase
    .from('Units')
    .delete()
    .eq('UnitID', unitID)

    if (error) {
      console.error('Error deleting unit:', error.message);
      setError('Failed to delete unit.');
    } else {
      fetchUnits();
    }
  };

  // Toggle Add Unit Form visibility
  const toggleAddUnitForm = () => {
    setIsAddUnitFormVisible(!isAddUnitFormVisible);
  };

  // Close the EditUnit form
  const closeEditUnitForm = () => {
    setIsEditUnitFormVisible(false);
    setUnitToEdit(null); // Reset the unit being edited
  };

  return (
    <div className="page-container">
      <Header />

      <div className="main-content-container">
        <AdminMenu isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="content-wrapper">
          <div className="white-container">
            <div className="header-section">
              <h1>Manage Units</h1>
              <div className="search-button-container">
                <button
                  className="add-unit-btn"
                  onClick={toggleAddUnitForm} // Toggle visibility of Add Unit form
                >
                  Add Unit
                  <img
                    src={AddUnitButtonIcon}
                    alt="Add Unit"
                    className="add-unit-button-icon"
                  />
                </button>
                <input
                  type="text"
                  placeholder="Search Here"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Conditionally render AddUnit and EditUnit components */}
            {isAddUnitFormVisible && <AddUnit closeForm={toggleAddUnitForm} refreshUnits={fetchUnits}/>}
            {isEditUnitFormVisible && unitToEdit && (
              <EditUnit unit = {unitToEdit} closeForm={closeEditUnitForm} refreshUnits={fetchUnits}/>
            )}

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
                      <div
                        className="dots-button"
                        onClick={() => toggleDropdown(unit.unitID)}
                      >
                        &#x2022;&#x2022;&#x2022; {/* Ellipsis icon */}
                      </div>

                      <div
                        className={`dropdown-menu ${isDropdownOpen === unit.unitID ? 'open' : ''}`}
                      >
                        <div
                          className="dropdown-option"
                          onClick={() => handleUpdate(unit.unitID)}
                        >
                          Edit
                        </div>
                        <div
                          className="dropdown-option"
                          onClick={() => handleDelete(unit.unitID)}
                        >
                          Delete
                        </div>
                      </div>
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

export default Units;