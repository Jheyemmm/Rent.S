import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./mainpage/admin/dashboard";
import Units from "./mainpage/frontdesk/units";
import FrontdeskDashboard from "./mainpage/frontdesk/frontdesk_dashboard";
import ViewTenant from "./mainpage/frontdesk/Viewtenant";
import ViewPayment from "./mainpage/frontdesk/ViewPayment";
import AdminViewPayment from "./mainpage/admin/AdminViewPayment";
import AccountSettings from "./mainpage/admin/account-settings";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />        
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/FrontDesk_Dashboard" element={<FrontdeskDashboard/>} />
        <Route path="/viewtenant" element={<ViewTenant/>} />
        <Route path="/viewpayment" element={<ViewPayment/>} />
        <Route path="/adminViewPayment" element={<AdminViewPayment/>} />
        <Route path="/units" element={<Units/>} />
        <Route path="/account-settings" element={<AccountSettings />} />
      </Routes>
    </Router>
    
  );
};

export default App;
