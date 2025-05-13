import React, { useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import loginlogo from "../assets/icons/LoginLogo.png";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    // Supabase will send a password reset email to the user
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`// After reset, redirect to login
    });

    if (error) {
      setError("Failed to send reset email. Please check your email address.");
    } else {
      setMessage(
        "If this email is registered, a password reset link has been sent. Please check your Gmail inbox (and spam folder)."
      );
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
          <h1>Forgot Password</h1>
          {message && <p className="error" style={{ color: "green" }}>{message}</p>}
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="input">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          <p className="forgotpassword">
            Remembered your password?{" "}
            <span onClick={() => navigate("/login")}>Log In</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;