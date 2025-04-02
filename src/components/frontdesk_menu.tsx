import React, { useState, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './frontdesk_menu.css';

// Import icons
import dashboardIcon from '../assets/icons/dashboard.png';
import coloredDashboardIcon from '../assets/icons/colored_dashboard.png';
import tenantsIcon from '../assets/icons/tenant.png';
import coloredTenantsIcon from '../assets/icons/colored_tenants.png';
import unitsIcon from '../assets/icons/units.png';
import coloredUnitsIcon from '../assets/icons/colored_units.png';
import paymentsIcon from '../assets/icons/payments.png';
import coloredPaymentsIcon from '../assets/icons/colored_payments.png';
import settingsIcon from '../assets/icons/Settings.png';
import coloredSettingsIcon from '../assets/icons/colored_settings.png';
import logoutIcon from '../assets/icons/logout.png';
// Logo
import logo from '../assets/icons/Logo.png';

interface MenuComponentProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const MenuComponent = forwardRef<HTMLDivElement, MenuComponentProps>(({ isOpen, setIsOpen }, ref) => {
    const [tenantOpen, setTenantOpen] = useState(false);
    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [unitsOpen, setUnitsOpen] = useState(false);
    const location = useLocation();

    // Close sidebar when route changes
    React.useEffect(() => {
        setIsOpen(false);
    }, [location.pathname, setIsOpen]);

    const toggleSidebar = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    // Active page detection
    const dashboardActive = location.pathname === "/dashboard";
    const tenantActive = location.pathname === "/add-tenant" || location.pathname === "/view-tenants";
    const unitsActive = location.pathname === "/add-units" || location.pathname === "/units";
    const paymentsActive = location.pathname === "/add-payment" || location.pathname === "/view-payments";
    const settingsActive = location.pathname === "/settings";

    return (
        <div>
            {/* Toggle Button */}
            <button className="menu-toggle" onClick={toggleSidebar}>
                &#9776;
            </button>

            {/* Sidebar */}
            <div ref={ref} className={`sidebar ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                
                {/* Logo */}
                <div className="logo-container">
                    <img src={logo} alt="Logo" />
                </div>

                <ul>
                    <li>
                        <Link to="/dashboard" className={dashboardActive ? "active" : ""}>
                            <img src={dashboardActive ? coloredDashboardIcon : dashboardIcon} className="icon" alt="Dashboard" />
                            Dashboard
                        </Link>
                    </li>

                    <li>
                        <button className={`menu-btn ${tenantActive ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); setTenantOpen(!tenantOpen); }}>
                            <img src={tenantActive ? coloredTenantsIcon : tenantsIcon} className="icon" alt="Tenant" />
                            Tenant
                        </button>
                        {tenantOpen && (
                            <ul className="submenu">
                                <li>
                                    <Link to="/add-tenant" className={location.pathname === "/add-tenant" ? "active" : ""}>
                                        <img src={tenantsIcon} className="icon" alt="Add Tenant" />
                                        Add Tenant
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/view-tenants" className={location.pathname === "/view-tenants" ? "active" : ""}>
                                        <img src={tenantsIcon} className="icon" alt="View Tenants" />
                                        View Tenants
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    <li>
                        <button className={`menu-btn ${unitsActive ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); setUnitsOpen(!unitsOpen); }}>
                            <img src={unitsActive ? coloredUnitsIcon : unitsIcon} className="icon" alt="Units" />
                            Units
                        </button>
                        {unitsOpen && (
                            <ul className="submenu">
                                <li>
                                    <Link to="/add-units" className={location.pathname === "/add-units" ? "active" : ""}>
                                        <img src={unitsIcon} className="icon" alt="Add Units" />
                                        Add Units
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/units" className={location.pathname === "/units" ? "active" : ""}>
                                        <img src={unitsIcon} className="icon" alt="View Units" />
                                        View Units
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    <li>
                        <button className={`menu-btn ${paymentsActive ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); setPaymentsOpen(!paymentsOpen); }}>
                            <img src={paymentsActive ? coloredPaymentsIcon : paymentsIcon} className="icon" alt="Payments" />
                            Payments
                        </button>
                        {paymentsOpen && (
                            <ul className="submenu">
                                <li>
                                    <Link to="/add-payment" className={location.pathname === "/add-payment" ? "active" : ""}>
                                        <img src={paymentsIcon} className="icon" alt="Add Payment" />
                                        Add Payment
                                    </Link>
                                </li>
                                
                            </ul>
                        )}
                    </li>

                    <li>
                        <Link to="/settings" className={settingsActive ? "active" : ""}>
                            <img src={settingsActive ? coloredSettingsIcon : settingsIcon} className="icon" alt="Settings" />
                            Settings
                        </Link>
                    </li>
                    <li>
                    <Link to="/" className="link-logout" onClick={() => setIsOpen(false)}>
                        <img src={logoutIcon} className="icon-logout" alt="Logout" />
                        Logout
                    </Link>

                    </li>
                </ul>
            </div>
        </div>
    );
});

export default MenuComponent;
