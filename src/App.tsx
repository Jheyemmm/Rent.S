import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./mainpage/dashboard";
import Units from "./mainpage/units";
import AccountSettings from "./mainpage/account-settings";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />        
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/units" element={<Units/>} />
        <Route path="/account-settings" element={<AccountSettings />} />
      </Routes>
    </Router>
    
  );
};

export default App;
