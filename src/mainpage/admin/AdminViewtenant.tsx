import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header";
import MenuComponent from "../../components/admin_menu";
import { AddTenantModal } from "../../components/Addtenant";
import { MoveOutModal } from "../../components/moveout";
import { EditTenantModal } from "../../components/edit_tenant";
import UpdateSuccessDialog from "../../components/Editsuccess"; // Import the success dialog
import "./AdminViewtenant.css";
import supabase from "../../supabaseClient";

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

const AdminViewTenant: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveOutModal, setShowMoveOutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); // State for success dialog
  const [successTitle, setSuccessTitle] = useState("Tenant Added");
  const [successMessage, setSuccessMessage] = useState("The tenant has been successfully added.");
  const sidebarRef = useRef<HTMLDivElement>(null);

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Tenants")
      .select(
        "TenantID, TenantFirstName, TenantLastName, UnitID, MoveInDate, Balance, Units ( Price ), Payments (PaymentDate)"
      )
      .is("MoveOutDate", null);

    if (error) {
      console.error("Error fetching tenants:", error.message);
      setError("Failed to load tenants.");
    } else {
      const formattedTenants = data.map((tenant: any) => {
        const sortedPayments = tenant.Payments?.sort(
          (a: any, b: any) =>
            new Date(b.PaymentDate).getTime() - new Date(a.PaymentDate).getTime()
        );
        const lastPayment = sortedPayments?.[0]?.PaymentDate || "-";

        return {
          tenantID: tenant.TenantID,
          firstName: tenant.TenantFirstName,
          lastName: tenant.TenantLastName,
          moveIn: new Date(tenant.MoveInDate).toLocaleDateString(),
          unit: tenant.UnitID,
          balance: tenant.Balance,
          monthlyRent: tenant.Units?.Price ?? "-",
          lastPayment:
            lastPayment !== "-"
              ? new Date(lastPayment).toLocaleDateString()
              : "-",
        };
      });

      setTenants(formattedTenants);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.lastName.toLowerCase().includes(search.toLowerCase()) ||
      tenant.firstName.toLowerCase().includes(search.toLowerCase())
  );

  const handleMoveOutClick = (tenant: any) => {
    setSelectedTenant(tenant);
    setShowMoveOutModal(true);
  };

  const handleEditClick = (tenant: any) => {
    setSelectedTenant(tenant);
    setShowEditModal(true);
  };

  const handleMoveOutSubmit = async (formData: any) => {
    try {
      const { error: tenantError } = await supabase
        .from("Tenants")
        .update({
          MoveOutDate: formData.endDate,
          Balance: formData.unpaidBalance,
          MoveOutReason: formData.moveOutReason,
        })
        .eq("TenantID", selectedTenant.tenantID);

      if (tenantError) throw tenantError;

      const { error: unitError } = await supabase
        .from("Units")
        .update({
          UnitStatus: "Available",
        })
        .eq("UnitID", selectedTenant.unit);

      if (unitError) throw unitError;

      fetchTenants();

      // Show success dialog after move-out is successful
      setShowSuccessDialog(true);
      setSuccessTitle("Tenant Moved Out");
      setSuccessMessage("The tenant has been successfully moved out.");
      setShowMoveOutModal(false); // Close the move-out modal
    } catch (error: any) {
      console.error("Error processing move out:", error.message);
    }
  };

  const navigateToTenantHistory = () => {
    navigate("/TenantArchive");
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
          <button
          className="tenant-archive-btn"
          onClick={navigateToTenantHistory}
          >
          Tenant History
          </button>
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
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={!searchFocused && search === "" ? "Search Here" : ""}
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          </div>
        </div>

        <div className="tenant-table-container">
          {loading ? (
          <div className="loading-spinner">Loading...</div>
          ) : error ? (
          <div className="error-message">{error}</div>
          ) : (
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
            {filteredTenants.length === 0 ? (
              <tr>
              <td colSpan={8} className="no-tenants-message">
                No active tenants found.
              </td>
              </tr>
            ) : (
              filteredTenants.map((tenant, index) => (
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
                  className="tenant-edit-btn"
                  onClick={() => handleEditClick(tenant)}
                >
                  Edit
                </button>
                <button
                  className="move-out-btn"
                  onClick={() => handleMoveOutClick(tenant)}
                >
                  Move out
                </button>
                </td>
              </tr>
              ))
            )}
            </tbody>
          </table>
          )}
        </div>
        </div>
      </main>
      </div>

      {showAddModal && (
      <AddTenantModal
        onClose={() => setShowAddModal(false)}
        onTenantAdded={async () => {
        await fetchTenants();
        setShowSuccessDialog(true); // Show success dialog
        setSuccessTitle("Tenant Added"); // Set success dialog title
        setSuccessMessage("The tenant has been successfully added."); // Set success message
        }}
      />
      )}

      {showSuccessDialog && (
      <UpdateSuccessDialog
        onClose={() => setShowSuccessDialog(false)}
        title={successTitle}
        message={successMessage}
        type="edit" // Using 'edit' type for adding tenant
      />
      )}

      {showMoveOutModal && selectedTenant && (
      <MoveOutModal
        initialData={{
        name: selectedTenant.firstName,
        lastName: selectedTenant.lastName,
        unit: selectedTenant.unit,
        unpaidBalance: selectedTenant.balance,
        startDate: selectedTenant.moveIn,
        endDate: "",  
        }}
        onClose={() => setShowMoveOutModal(false)}
        onSubmit={handleMoveOutSubmit}
      />
      )}

      {showEditModal && selectedTenant && (
      <EditTenantModal
        tenantData={selectedTenant}
        onClose={() => setShowEditModal(false)}
        onTenantUpdated={async () => {
        await fetchTenants();
        setShowSuccessDialog(true); // Show success dialog
        setSuccessTitle("Tenant Updated"); // Set success dialog title
        setSuccessMessage("The tenant has been successfully updated."); // Set success message
        }}
      />
      )}
    </div>
  );
};

export default AdminViewTenant;
