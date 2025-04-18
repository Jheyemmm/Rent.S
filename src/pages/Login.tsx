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
      return;
    }

    try {
      // Step 1: Get the user's email and RoleID by username
      const { data: userData, error: fetchError } = await supabase
        .from("Users")
        .select("Email, RoleID")
        .ilike("Username", username)
        .single();

      if (fetchError || !userData) {
        setError("Username not found.");
        return;
      }

      const { Email: email, RoleID } = userData;

      // Step 2: Sign in using Supabase auth
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError("Invalid credentials.");
        return;
      }

      // Step 3: Fetch the role name based on RoleID
      const { data: roleData, error: roleError } = await supabase
        .from("Roles")
        .select("Role")
        .eq("RoleID", RoleID)
        .single();

      if (roleError || !roleData) {
        setError("Could not retrieve user role.");
        return;
      }

      const userRole = roleData.Role;

      // Step 4: Navigate based on the user role
      if (userRole === "Admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "Front Desk") {
        navigate("/frontdesk-dashboard");
      } else {
        setError("Unauthorized role.");
      }

    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="logo">
        <img src={loginlogo} alt="Logo" />
      </div>

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
            <p className="forgot-password">Forgot password?</p>
            <button type="submit" className="submit">
              Log In
            </button>
          </form>
          <p className="signup">
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")}>Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
