import React, { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './admin_menu.css';

import dashboardIcon from '../assets/icons/dashboard.png';
import coloredDashboardIcon from '../assets/icons/colored_dashboard.png';
import tenantsIcon from '../assets/icons/tenant.png';
import coloredTenantsIcon from '../assets/icons/colored_tenants.png';
import unitsIcon from '../assets/icons/units.png';
import coloredUnitsIcon from '../assets/icons/colored_units.png';
import paymentsIcon from '../assets/icons/payments.png';
import coloredPaymentsIcon from '../assets/icons/colored_payments.png';
import settingsIcon from '../assets/icons/Settings.png';
import AccountsettingsIcon from '../assets/icons/Account.png';
import coloredAccountsettingsIcon from '../assets/icons/coloredAccount.png';
import coloredSettingsIcon from '../assets/icons/colored_settings.png';
import logoutIcon from '../assets/icons/logout.png';
import logo from '../assets/icons/Logo.png';

interface MenuComponentProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const AdminMenuComponent = forwardRef<HTMLDivElement, MenuComponentProps>(({ isOpen, setIsOpen }, ref) => {
    const location = useLocation();
    const dashboardActive = location.pathname === "/dashboard";
    const tenantActive = location.pathname === "/add-tenant" || location.pathname === "/view-tenants";
    const unitsActive = location.pathname === "/add-units" || location.pathname === "/units";
    const paymentsActive = location.pathname === "/add-payment" || location.pathname === "/view-payments";
    const settingsActive = location.pathname === "/admin-settings";
    const AccountsettingsActive = location.pathname === "/account-settings";

    return (
        <div>
            <div ref={ref} className="admin_sidebar open">
                <div className="admin_logo-container">
                    <img src={logo} alt="Logo" />
                </div>

                <ul>
                    <li>
                        <Link to="/admin-dashboard" className={dashboardActive ? "active" : ""}>
                            <img src={dashboardActive ? coloredDashboardIcon : dashboardIcon} className="icon" alt="Dashboard" />
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin-units" className={unitsActive ? "active" : ""}>
                            <img src={unitsActive ? coloredUnitsIcon : unitsIcon} className="icon" alt="Units" />
                            Units
                        </Link>
                    </li>

                    <li>
                        <Link to="/adminViewtenant" className={tenantActive ? "active" : ""}>
                            <img src={tenantActive ? coloredTenantsIcon : tenantsIcon} className="icon" alt="Tenant" />
                            Tenant
                        </Link>
                    </li>


                    <li>
                        <Link to="/adminViewPayment" className={paymentsActive ? "active" : ""}>
                            <img src={paymentsActive ? coloredPaymentsIcon : paymentsIcon} className="icon" alt="Payments" />
                            Payments
                        </Link>
                    </li>
                    

                    <li>
                        <Link to="/admin-settings" className={settingsActive ? "active" : ""}>
                            <img src={settingsActive ? coloredSettingsIcon : settingsIcon} className="icon" alt="Settings" />
                            Settings
                        </Link>
                    </li>
                    <li>
                        <Link to="/account-settings" className={AccountsettingsActive ? "active" : ""}>
                            <img src={AccountsettingsActive ? coloredAccountsettingsIcon : AccountsettingsIcon} className="icon" alt="Settings" />
                            Accounts
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

export default AdminMenuComponent;
