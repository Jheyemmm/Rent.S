import React, { useState, ChangeEvent, useEffect } from 'react';
import Header from '../../components/header';
import AdminMenu from '../../components/admin_menu';
import './units.css';
import AddUnit from '../../components/add-unit';
import EditUnit from '../../components/edit-unit';
import SuccessDialog from '../../components/unitsuccess'; // For Add
import UnitUpdateSuccess from '../../components/unit-update-success'; // ✅ For Edit
import supabase from '../../supabaseClient';

interface Unit {
  unitID: number;
  number: string;
  price: number;
  details: string;
  status: 'Available' | 'Occupied' | 'Unavailable';
}

const Units: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);
  const [isAddUnitFormVisible, setIsAddUnitFormVisible] = useState(false);
  const [isEditUnitFormVisible, setIsEditUnitFormVisible] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showEditSuccessDialog, setShowEditSuccessDialog] = useState(false); // ✅

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
    unit.number.toString().toLowerCase().includes(search.toLowerCase())
  );

  const toggleDropdown = (unitId: number) => {
    setIsDropdownOpen((prev) => (prev === unitId ? null : unitId));
  };

  const handleUpdate = (unitId: number) => {
    const unitToEdit = units.find((unit) => unit.unitID === unitId);
    if (unitToEdit) {
      setUnitToEdit(unitToEdit);
      setIsEditUnitFormVisible(true);
    }
  };

  const handleDelete = async (unitID: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this unit?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('Units')
      .update({ UnitStatus: 'Unavailable' })
      .eq('UnitID', unitID);

    if (error) {
      console.error('Error deleting unit:', error.message);
      setError('Failed to delete unit.');
    } else {
      fetchUnits();
    }
  };

  const toggleAddUnitForm = () => {
    setIsAddUnitFormVisible(!isAddUnitFormVisible);
  };

  const closeEditUnitForm = () => {
    setIsEditUnitFormVisible(false);
    setUnitToEdit(null);
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
                <button className="add-unit-btn" onClick={toggleAddUnitForm}>
                  Add Unit <span className="plus-icon">+</span>
                </button>
                <input
                  type="text"
                  placeholder="Search Here"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {isAddUnitFormVisible && (
              <AddUnit
                closeForm={toggleAddUnitForm}
                refreshUnits={fetchUnits}
                onSuccess={() => setShowSuccessDialog(true)}
              />
            )}
            {isEditUnitFormVisible && unitToEdit && (
              <EditUnit
                unit={unitToEdit}
                closeForm={closeEditUnitForm}
                refreshUnits={fetchUnits}
                onSuccess={() => setShowEditSuccessDialog(true)} // ✅
              />
            )}

            <div className="unit-list">
              {loading ? (
                <p>Loading units...</p>
              ) : error ? (
                <p className="form-error">{error}</p>
              ) : filteredUnits.length === 0 ? (
                <p>Unit list is empty.</p>
              ) : (
                filteredUnits.map((unit) => (
                  <div className="unit-card" key={unit.unitID}>
                    <div className="unit-thumbnail">
                      <div
                        className="unit-dots-button"
                        onClick={() => toggleDropdown(unit.unitID)}
                      >
                        &#x2022;&#x2022;&#x2022;
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

      {showSuccessDialog && <SuccessDialog onClose={() => setShowSuccessDialog(false)} />}
      {showEditSuccessDialog && (
        <UnitUpdateSuccess onClose={() => setShowEditSuccessDialog(false)} />
      )}
    </div>
  );
};

export default Units;
