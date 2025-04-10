import React, { useState } from 'react';
import './edit_user.css'; 

interface EditUserProps {
  user: {
    fullname: string;
    email: string;
    username: string;
    password?: string;
    role: string;
  };
  closeForm: () => void;
}

const EditAccount: React.FC<EditUserProps> = ({ user, closeForm }) => {
  const [fullname, setFullname] = useState(user.fullname);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [role] = useState(user.role); // Not editable

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated user:', { fullname, email, username, password, role });
    closeForm();
  };

  return (
    <div className="overlay" onClick={closeForm}>
      <div
        className="edit-account-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="form-title">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">User Role</label>
            <input
              type="text"
              value={role}
              className="form-input"
              readOnly // User role cannot be edited
              style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccount;
