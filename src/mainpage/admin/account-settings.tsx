import React, { useState, useEffect } from 'react';
import Header from '../../components/header';
import AdminMenu from '../../components/admin_menu';
import EditUser from '../../components/edit_user'; 
import './account-settings.css';
import supabase from '../../supabaseClient';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  roleId: number;
  isActive: boolean;
}

const AccountSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Step 1: Fetch users
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('UserID, UserFirstName, UserLastName, Email, Username, RoleID, StatusActive')
        .order('UserFirstName', { ascending: true });
  
      if (userError || !userData) {
        throw userError;
      }
  
      // Step 2: Fetch roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('Roles')
        .select('RoleID, Role');
  
      if (rolesError || !rolesData) {
        throw rolesError;
      }
  
      // Step 3: Map RoleID to role name
      const roleMap = new Map(rolesData.map(role => [role.RoleID, role.Role]));
  
      // Step 4: Combine user data with role names
      const formattedUsers: User[] = userData.map(user => ({
        id: user.UserID,
        firstName: user.UserFirstName || '',
        lastName: user.UserLastName || '',
        fullName: `${user.UserFirstName || ''} ${user.UserLastName || ''}`.trim(),
        email: user.Email || '',
        username: user.Username || '',
        roleId: user.RoleID,
        role: roleMap.get(user.RoleID) || 'Unknown',
        isActive: user.StatusActive || false
      }));
  
      setUsers(formattedUsers);
  
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      setError('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (userId: string) => {
    setDropdownOpenId(prev => (prev === userId ? null : userId));
  };

  const handleEdit = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) setEditingUser(user);
  };

  const handleDelete = async (userId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('Users')
        .delete()
        .eq('UserID', userId);

      if (error) {
        throw error;
      }

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      alert('Failed to delete user');
    }
  };

  const closeEditForm = () => {
    setEditingUser(null);
    fetchUsers();
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownOpenId !== null) {
      setDropdownOpenId(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpenId]);

  return (
    <div className="page-container">
      <Header />

      <div className="main-content-container">
        <AdminMenu isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="content-wrapper">
          <div className="accountsettings-container">
            <h1>Account Settings</h1>
            <h3>List of Users</h3>

            {loading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Fullname</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No users found</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{user.username}</td>
                        <td>{user.role}</td>
                        <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                        <td className="dropdown-cell">
                          <div
                            className="dots-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(user.id);
                            }}
                          >
                            &#x2022;&#x2022;&#x2022;
                          </div>

                          {dropdownOpenId === user.id && (
                            <div className="dropdown-menu open">
                              <div className="dropdown-option" onClick={() => handleEdit(user.id)}>Edit</div>
                              <div className="dropdown-option" onClick={() => handleDelete(user.id)}>Delete</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editingUser && (
        <EditUser user={editingUser} closeForm={closeEditForm} />
      )}
    </div>
  );
};

export default AccountSettings;