import React, { useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import loginlogo from "../assets/icons/LoginLogo.png";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Failed to reset password. Please try again.");
    } else {
      setMessage("Password reset successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="logo">
        <img src={loginlogo} alt="Logo" />
      </div>
      <div className="login-form">
        <div className="inner-login">
          <h1>Reset Password</h1>
          {message && <p className="error" style={{ color: "green" }}>{message}</p>}
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="input">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />
            </div>
            <button type="submit" className="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;