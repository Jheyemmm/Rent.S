import React, { useState, ChangeEvent } from 'react';
import Header from '../components/header';
import FrontdeskMenu from '../components/frontdesk_menu';
import './units.css';
import AddUnitButtonIcon from '../assets/icons/add-unit-button.png';
import AddUnit from '../components/add-unit';  // Import the AddUnit component
import EditUnit from '../components/edit-unit'; // Import the EditUnit component

interface Unit {
  id: number;
  name: string;
  price: number;
  details: string;
  status: 'Available' | 'Occupied';
}

const mockUnits: Unit[] = [
  {
    id: 1,
    name: 'Unit 101',
    price: 18000,
    details: '2 bedrooms, 2 restrooms, includes balcony',
    status: 'Available',
  },
];

const Units: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);
  const [isAddUnitFormVisible, setIsAddUnitFormVisible] = useState(false); // Manage the visibility of AddUnit form
  const [isEditUnitFormVisible, setIsEditUnitFormVisible] = useState(false); // Manage visibility of EditUnit form
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null); // Store the unit being edited

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDropdown = (unitId: number) => {
    if (isDropdownOpen === unitId) {
      setIsDropdownOpen(null);
    } else {
      setIsDropdownOpen(unitId);
    }
  };

  const handleUpdate = (unitId: number) => {
    const unitToEdit = units.find((unit) => unit.id === unitId);
    if (unitToEdit) {
      setUnitToEdit(unitToEdit); // Set the unit to edit
      setIsEditUnitFormVisible(true); // Show the EditUnit form
    }
  };

  const handleDelete = (unitId: number) => {
    console.log(`Delete unit ${unitId}`);
    // Add delete logic here
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
        <FrontdeskMenu isOpen={isOpen} setIsOpen={setIsOpen} />

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
            {isAddUnitFormVisible && <AddUnit closeForm={toggleAddUnitForm} />}
            {isEditUnitFormVisible && unitToEdit && (
              <EditUnit unit={unitToEdit} closeForm={closeEditUnitForm} />
            )}

            <div className="unit-list">
              {filteredUnits.length === 0 ? (
                <p>Unit list is empty.</p>
              ) : (
                filteredUnits.map((unit) => (
                  <div className="unit-card" key={unit.id}>
                    <div className="unit-thumbnail">
                      <div
                        className="dots-button"
                        onClick={() => toggleDropdown(unit.id)}
                      >
                        &#x2022;&#x2022;&#x2022; {/* Ellipsis icon */}
                      </div>

                      <div
                        className={`dropdown-menu ${isDropdownOpen === unit.id ? 'open' : ''}`}
                      >
                        <div
                          className="dropdown-option"
                          onClick={() => handleUpdate(unit.id)}
                        >
                          Edit
                        </div>
                        <div
                          className="dropdown-option"
                          onClick={() => handleDelete(unit.id)}
                        >
                          Delete
                        </div>
                      </div>
                    </div>

                    <div className="unit-details">
                      <div className="unit-header">
                        <strong>{unit.name}</strong>
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
