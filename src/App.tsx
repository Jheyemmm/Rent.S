import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./mainpage/dashboard";
import Units from "./mainpage/units";
import FrontdeskDashboard from "./mainpage/frontdeskdashboard";
import ViewTenant from "./mainpage/Viewtenant";
import ViewPayment from "./mainpage/ViewPayment";
import AccountSettings from "./mainpage/account-settings";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />        
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/frontdeskDashboard" element={<FrontdeskDashboard/>} />
        <Route path="/viewtenant" element={<ViewTenant/>} />
        <Route path="/viewpayment" element={<ViewPayment/>} />
        <Route path="/units" element={<Units/>} />
        <Route path="/account-settings" element={<AccountSettings />} />
      </Routes>
    </Router>
    
  );
};

export default App;
