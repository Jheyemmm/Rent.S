import React, { useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import loginlogo from "../assets/icons/LoginLogo.png";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("All fields are required!");
    return
    }

    try {
    // 1. Get email based on entered username
    const { data: userData, error: fetchError } = await supabase
    .from("Users")
    .select("Email")
    .eq("Username", username)
    .single();

  if (fetchError || !userData) {
    setError("Username not found.");
    return;
    }

    const email = userData.Email;

    // 2. Authenticate using email and password
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      console.error("Login error:", loginError.message);
      setError("Invalid credentials.");
      return;
    }

    // ✅ Logged in successfully!
    alert("Login successful!");
    navigate("/dashboard"); // or whatever route after login

  } catch (err: any) {
    console.error(err);
    setError("Something went wrong. Please try again.");
  }
  };

  return (
    <div className="container">
      {/* Left Section - Logo */}
      <div className="logo">
        <img src={loginlogo} alt="Logo" />
      </div>
      
      {/* Right Section - Login Form */}
      <div className="login-form">
        <div className="inner-login">
          <h1>Log In</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="input">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter your username" 
                required 
              />
            </div>
            <div className="input">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password" 
                required 
              />
            </div>
            {/* Forgot password positioned just after password field */}
            <p className="forgot-password">Forgot password?</p>
            <button type="submit" className="submit">Log In</button>
          </form>
          <p className="signup">Don't have an account? 
            <span onClick={() => navigate("/register")}
            >Sign Up</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
