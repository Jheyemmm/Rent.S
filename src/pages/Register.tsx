import React, { useState } from 'react';
import loginlogo from '../assets/icon/LoginLogo.png';
import './Register.css';

const Signup: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userRole, setUserRole] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log('User Data:', { firstName, lastName, email, username, password, userRole });
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <div className="signup-form">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSubmit}>
                    <label htmlFor="Name">Name</label>
                        <div className="name-fields">
                            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                        <label htmlFor="Email">Email</label>
                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        
                        <label htmlFor="username">Username</label>
                        <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        
                        <label htmlFor="pass">Password</label>
                        <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        
                        <label htmlFor="Role">Username</label>
                        <select value={userRole} onChange={(e) => setUserRole(e.target.value)} required>
                            <option value="">Select User Role</option>
                            <option value="admin">Admin</option>
                            <option value="receptionist">Receptionist</option>
                        </select>
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
                <div className="signup-logo">
                    <img src={loginlogo} alt="Rent.S Logo" />
                </div>
            </div>
        </div>
    );
};

export default Signup;
