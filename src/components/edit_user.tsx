import React, { useState, useEffect } from 'react';
import './edit_user.css';
import supabase from '../supabaseClient';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  password?: string;
  role: string;
  roleId: number;
  isActive: boolean;
}

interface Role {
  RoleID: number;
  Role: string; // Changed from RoleName to Role
}

interface EditUserProps {
  user: User;
  closeForm: () => void;
}

const EditUser: React.FC<EditUserProps> = ({ user, closeForm }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(user.roleId);
  const [isActive, setIsActive] = useState(user.isActive);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('Roles')
        .select('RoleID, Role') // Changed from RoleName to Role
        .order('Role'); // Changed from RoleName to Role

      if (error) {
        throw error;
      }

      if (data) {
        setRoles(data);
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error.message);
      setError('Failed to load roles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare update object
      const updates: any = {
        UserFirstName: firstName,
        UserLastName: lastName,
        Email: email,
        Username: username,
        RoleID: roleId,
        StatusActive: isActive
      };
      
      if (password) {
        updates.Password = password;
      }

      const { error: updateError } = await supabase
        .from('Users')
        .update(updates)
        .eq('UserID', user.id);

      if (updateError) {
        throw updateError;
      }

      console.log('User updated successfully');
      closeForm();
    } catch (error: any) {
      console.error('Error updating user:', error.message);
      setError(`Failed to update user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Close the form when clicking outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeForm();
    }
  };

  return (
    <div className="overlay" onClick={handleOverlayClick}>
      <div
        className="edit-account-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="form-title">Edit User</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
              placeholder="Leave empty to keep current password"
            />
            <small className="input-note">Leave empty to keep current password</small>
          </div>

          <div className="form-group">
            <label className="form-label">User Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="form-input"
              required
            >
              {roles.map((role) => (
                <option key={role.RoleID} value={role.RoleID}>
                  {role.Role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              className="form-input"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;