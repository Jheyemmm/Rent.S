import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import FDSettings from "./mainpage/frontdesk/frontdesk-settings";
import AccountSettings from "./mainpage/admin/account-settings";
import TenantArchive from "./mainpage/admin/TenantArchive";
import AdminSettings from "./mainpage/admin/admin-settings";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/unauthorized"; // You'll need to create this page

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-units" element={<AdminUnits />} />
          <Route path="/adminViewPayment" element={<AdminViewPayment />} />
          <Route path="/adminViewtenant" element={<AdminViewTenant />} />
          <Route path="/admin-settings" element={<AdminSettings />} />
          <Route path="/TenantArchive" element={<TenantArchive />} />
          <Route path="/account-settings" element={<AccountSettings />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['Front Desk']} />}>
          <Route path="/frontdesk-dashboard" element={<FDDashboard />} />
          <Route path="/frontdesk-units" element={<FDUnits />} />
          <Route path="/frontdesk-viewtenant" element={<FDViewTenant />} />
          <Route path="/frontdesk-payment" element={<FDViewPayment />} />
          <Route path="/frontdesk-settings" element={<FDSettings />} />
        </Route>
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;