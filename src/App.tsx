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
import AccountSettings from "./mainpage/admin/account-settings";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />        
        <Route path="/dashboard" element={<AdminDashboard/>} />
        <Route path="/FrontDesk_Dashboard" element={<FDDashboard/>} />
        <Route path="/viewtenant" element={<FDViewTenant/>} />
        <Route path="/viewpayment" element={<FDViewPayment/>} />
        <Route path="/adminViewPayment" element={<AdminViewPayment/>} />
        <Route path="/frontdesk-units" element={<FDUnits/>} />
        <Route path="/admin-units" element={<AdminUnits/>} />
        <Route path="/account-settings" element={<AccountSettings />} />
      </Routes>
    </Router>
    
  );
};

export default App;
