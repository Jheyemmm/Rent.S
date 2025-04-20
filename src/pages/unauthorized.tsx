import React from "react";
import { useNavigate } from "react-router-dom";
import "./unauthorized.css"; // Using your existing CSS file

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
        </div>
        <h1>Access Denied</h1>
        <p className="main-message">You don't have permission to access this page.</p>
        <p className="sub-message">This area is restricted to authorized personnel only.</p>
        <div className="unauthorized-buttons">
          <button className="back-button" onClick={() => navigate(-1)}>
            Go Back
          </button>
          <button className="login-button" onClick={() => navigate("/login")}>
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;