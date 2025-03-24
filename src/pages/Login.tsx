import React from 'react';
import './Login.css';
import loginlogo from '../assets/icon/LoginLogo.png';
const Login: React.FC = () => {
return (<div className="container">
    {/* Logo Section */}
    <div className="logo">
        <img src={loginlogo} alt="logo" />
    </div>

    {/* Login Form Section */}
    <div className="login-form">
        <div className="header">
            <h1>Log In</h1>
        </div>
        <form className="inputs">
            <div className="input">
                <label htmlFor="username">Username</label>
                <input type="text" name="username" placeholder="Enter your username" required />
            </div>
            <div className="input">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" placeholder="Enter your password" required />
            </div>
            <div className="forgot-password">
                Forgot password? <span>Click Here</span>
            </div>
            <div className="submit-container">
                <button type="submit" className="submit">Log In</button>
            </div>
        </form>
        <div className="signup">
            Don't have an account? <span>Sign Up</span>
        </div>
    </div>
</div>

)

};

export default Login;