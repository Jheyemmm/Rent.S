import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./mainpage/admin/dashboard";
import FDUnits from "./mainpage/frontdesk/units";
import AdminUnits from "./mainpage/admin/units";
import FDDashboard from "./mainpage/frontdesk/frontdesk_dashboard";
import FDViewTenant from "./mainpage/frontdesk/Viewtenant";
import FDViewPayment from "./mainpage/frontdesk/ViewPayment";
import AdminViewPayment from "./mainpage/admin/AdminViewPayment";
import AdminViewTenant from "./mainpage/admin/AdminViewtenant";

import AccountSettings from "./mainpage/admin/account-settings";
import TenantArchive from "./mainpage/admin/TenantArchive";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />        
        <Route path="/admin-dashboard" element={<AdminDashboard/>} />
        <Route path="/frontdesk-dashboard" element={<FDDashboard/>} />
        <Route path="/frontdesk-viewtenant" element={<FDViewTenant/>} />
        <Route path="/frontdesk-payment" element={<FDViewPayment/>} />
        <Route path="/adminViewPayment" element={<AdminViewPayment/>} />
        <Route path="/adminViewtenant" element={<AdminViewTenant/>} />
        <Route path="/frontdesk-units" element={<FDUnits/>} />
        
        <Route path="/TenantArchive" element={<TenantArchive/>} />
        <Route path="/admin-units" element={<AdminUnits/>} />
        <Route path="/account-settings" element={<AccountSettings />} />
      </Routes>
    </Router>
    
  );
};

export default App;
