import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import supabase from "../../supabaseClient";
import Header from "../../components/header";
import MenuComponent from "../../components/admin_menu";
import "./TenantArchive.css";

interface Tenant {
  TenantID: number;
  TenantFirstName: string;
  TenantLastName: string;
  MoveInDate: string;
  MoveOutDate: string;
  Balance: number;
  UnitID: number;
  UnitNumber?: string;
  UnitPrice?: number;
}

const TenantArchive: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false); // Added for MenuComponent

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const { data: tenantData, error: tenantError } = await supabase
          .from("Tenants")
          .select("*")
          .not("MoveOutDate", "is", null);

        if (tenantError) {
          console.error("Error fetching tenants:", tenantError);
          setLoading(false);
          return;
        }

        const tenantsWithUnit = await Promise.all(
          tenantData.map(async (tenant: Tenant) => {
            const { data: unitData, error: unitError } = await supabase
              .from("Units")
              .select("UnitNumber, Price")
              .eq("UnitID", tenant.UnitID)
              .single();

            if (unitError) {
              console.error(
                `Error fetching unit for TenantID ${tenant.TenantID}:`,
                unitError
              );
              return { ...tenant, UnitNumber: "Unknown", UnitPrice: 0 };
            }

            return {
              ...tenant,
              UnitNumber: unitData.UnitNumber,
              UnitPrice: unitData.Price,
            };
          })
        );

        setTenants(tenantsWithUnit);
        setFilteredTenants(tenantsWithUnit);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTenants(tenants);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = tenants.filter(
      (tenant) =>
        tenant.TenantFirstName.toLowerCase().includes(term) ||
        tenant.TenantLastName.toLowerCase().includes(term) ||
        tenant.UnitNumber?.toLowerCase().includes(term) ||
        tenant.MoveInDate.includes(term) ||
        tenant.MoveOutDate?.includes(term)
    );

    setFilteredTenants(filtered);
  }, [searchTerm, tenants]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleViewTenants = () => {
    navigate("/adminViewtenant");
  };

  return (
    <div className="tenant-archive-wrapper">
      <Header />
      <MenuComponent isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="tenant-archive-content">
        <div className="tenant-archive-container">
          <div className="tenant-archive-header">
            <h1 className="tenant-archive-title">Tenant Archive</h1>
            
            <div className="tenant-archive-right">
              <button 
                className="tenant-archive-button" 
                onClick={handleViewTenants}
              >
                View Tenants
              </button>
              
              <div className="tenant-archive-search">
                <input 
                  type="text" 
                  placeholder="Search Here" 
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <span className="fas fa-search search-icon"></span>
              </div>
            </div>
          </div>

          <div className="tenant-archive-table-container">
            {loading ? (
              <div className="loading-indicator">Loading tenant history...</div>
            ) : (
              <table className="tenant-archive-table">
                <thead>
                  <tr className="tenant-archive-table-header">
                    <th className="tenant-archive-th">Firstname</th>
                    <th className="tenant-archive-th">Lastname</th>
                    <th className="tenant-archive-th">Move-in Date</th>
                    <th className="tenant-archive-th">Unit</th>
                    <th className="tenant-archive-th">Move-out Date</th>
                    <th className="tenant-archive-th">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.length > 0 ? (
                    filteredTenants.map((tenant) => (
                      <tr key={tenant.TenantID}>
                        <td className="tenant-archive-td">{tenant.TenantFirstName}</td>
                        <td className="tenant-archive-td">{tenant.TenantLastName}</td>
                        <td className="tenant-archive-td">{tenant.MoveInDate}</td>
                        <td className="tenant-archive-td">{tenant.UnitNumber}</td>
                        <td className="tenant-archive-td">{tenant.MoveOutDate}</td>
                        <td className="tenant-archive-td tenant-archive-td-balance">${tenant.Balance}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                        No tenants found matching your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantArchive;