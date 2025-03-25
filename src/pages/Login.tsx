import React, { useState } from "react";
import "./Login.css";
import loginlogo from "../assets/icon/LoginLogo.png";

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!username || !password) {
            setError("All fields are required!");
        } else {
            setError(""); 
            alert("Login button clicked (for debugging purposes)");
        }
    };

    return (
        <div className="container">
            <div className="logo">
                <img src={loginlogo} alt="logo" />
            </div>
            <div className="login-form">
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
                    <button type="submit" className="submit">Log In</button>
                </form>
                <p className="forgot-password">Forgot password? <span>Click Here</span></p>
                <p className="signup">Don't have an account? <span>Sign Up</span></p>
            </div>
        </div>
    );
};

export default Login;
