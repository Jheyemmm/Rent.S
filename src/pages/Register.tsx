import React, { useState } from "react";
import "./Register.css";
import loginlogo from "../assets/icons/LoginLogo.png";
import Login from "./Login";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    userRole: ""
  });
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email ||
      !formData.username || !formData.password || !formData.userRole) {
      setError("All fields are required!");
    } else {
      setError("");
      alert("Registration submitted!");
    }
  };

  return (
    <div className="register-container">
      {/* Left side - form */}
      <div className="register-form-container">
        <div className="register-form-inner">
          <h1 className="register-title">Sign Up</h1>
          {error && <p className="register-error">{error}</p>}
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-input-group">
              <label className="register-label">Name</label>
              <div className="register-name-fields">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="register-input"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="register-input"
                  required
                />
              </div>
            </div>

            <div className="register-input-wrapper">
              <label className="register-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="register-input"
                required
              />
            </div>

            <div className="register-input-wrapper">
              <label className="register-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="register-input"
                required
              />
            </div>

            <div className="register-input-wrapper">
              <label className="register-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="register-input"
                required
              />
            </div>

            <div className="register-input-wrapper">
              <label className="register-label">User Role</label>
              <select
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                className="register-select"
                required
              >
                <option value="">Select a role</option>
                <option value="Frontdesk">Landlord</option>
                <option value="admin">Admin</option>
              </select>
            </div>  

            <button type="submit" className="register-submit">Sign Up</button>
          </form>
        </div>
      </div>

      {/* Right side - logo */}
      <div className="register-logo-container">
        <img src={loginlogo} alt="Rent.S Logo" className="register-logo" />
      </div>
    </div>
  );
};

export default Register;
