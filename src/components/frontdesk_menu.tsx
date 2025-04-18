import React, { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './FrontDesk_menu.css';

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
import logo from '../assets/icons/Logo.png';

interface FrontdeskMenuComponentProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const FrontdeskMenuComponent = forwardRef<HTMLDivElement, FrontdeskMenuComponentProps>(({ isOpen, setIsOpen }, ref) => {
    const location = useLocation();
    const dashboardActive = location.pathname === "/dashboard";
    const tenantActive = location.pathname === "/add-tenant" || location.pathname === "/view-tenants";
    const unitsActive = location.pathname === "/add-units" || location.pathname === "/units";
    const paymentsActive = location.pathname === "/add-payment" || location.pathname === "/view-payments";
    const settingsActive = location.pathname === "/settings";

    return (
        <div>
            <div ref={ref} className="frontdesk_sidebar open">
                <div className="frontdesklogo-container">
                    <img src={logo} alt="Logo" />
                </div>

                <ul>
                    <li>
                        <Link to="/frontdesk-dashboard" className={dashboardActive ? "active" : ""}>
                            <img src={dashboardActive ? coloredDashboardIcon : dashboardIcon} className="icon" alt="Dashboard" />
                            Dashboard
                        </Link>
                    </li>

                    <li>
                        <Link to="/frontdesk-viewtenant" className={tenantActive ? "active" : ""}>
                            <img src={tenantActive ? coloredTenantsIcon : tenantsIcon} className="icon" alt="Tenant" />
                            Tenant
                        </Link>
                    </li>

                    <li>
                        <Link to="/frontdesk-units" className={unitsActive ? "active" : ""}>
                            <img src={unitsActive ? coloredUnitsIcon : unitsIcon} className="icon" alt="Units" />
                            Units
                        </Link>
                    </li>

                    <li>
                        <Link to="/frontdesk-payment" className={paymentsActive ? "active" : ""}>
                            <img src={paymentsActive ? coloredPaymentsIcon : paymentsIcon} className="icon" alt="Payments" />
                            Payments
                        </Link>
                    </li>
                    

                    <li>
                        <Link to="/frontdesk-settings" className={settingsActive ? "active" : ""}>
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

export default FrontdeskMenuComponent;
