import React, { useState } from "react";
import supabase from "../supabaseClient";
import "./Register.css";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate(); // Add this hook

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { firstName, lastName, email, username, password, userRole } = formData;

    if (!formData.firstName || !formData.lastName || !formData.email ||
      !formData.username || !formData.password || !formData.userRole) {
      setError("All fields are required!");
      return
    }

    try {
      // register the user un supabase auth system
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });
  
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
  
      const userId = authData.user?.id;
      if (!userId) {
        setError("User ID not found after sign up.");
        return;
      }
  
      const { error: insertError } = await supabase.from("Users").insert([
        {
          UserID: userId,
          Email: email,
          Username: username,
          UserFirstName: firstName,
          UserLastName: lastName,
          RoleID: parseInt(userRole)
        }
      ]);
  
      if (insertError) {
        setError(insertError.message);
        return;
      }
  
      alert("Registration successful! Please check your email to confirm.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        userRole: ""
      });
      setError("");
  
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Please try again.");
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
                <option value="1">Admin</option>
                <option value="2">Front Desk</option>
              </select>
            </div>  

            <button type="submit" className="register-submit">Sign Up</button>
            <div className="register-login-link">
  Already have an account?{" "}
  <span 
    onClick={() => navigate("/login")} 
    className="register-login-text"
  >
    Log in
  </span>
</div>

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
