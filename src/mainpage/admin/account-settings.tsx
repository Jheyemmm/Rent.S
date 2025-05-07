  import React, { useState, useEffect } from 'react';
  import Header from '../../components/header';
  import AdminMenu from '../../components/admin_menu';
  import EditUser from '../../components/edit_user';
  import UpdateSuccessDialog from '../../components/Editsuccess'; // Import the success dialog
  import DeleteUserDialog from '../../components/deleteuserconfirmation'; // Import the delete dialog
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
    const [showSuccessDialog, setShowSuccessDialog] = useState(false); // State for success dialog
    const [showDeleteDialog, setShowDeleteDialog] = useState(false); // State for delete confirmation dialog
    const [userToDelete, setUserToDelete] = useState<string | null>(null); // Track user to delete
    const [showDeleteSuccessDialog, setShowDeleteSuccessDialog] = useState(false); // Show delete success dialog
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(''); // Success message for deletion

    useEffect(() => {
      fetchUsers();
    }, []);

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('UserID, UserFirstName, UserLastName, Email, Username, RoleID, StatusActive')
          .order('UserFirstName', { ascending: true });

        if (userError || !userData) {
          throw userError;
        }

        const { data: rolesData, error: rolesError } = await supabase
          .from('Roles')
          .select('RoleID, Role');

        if (rolesError || !rolesData) {
          throw rolesError;
        }

        const roleMap = new Map(rolesData.map(role => [role.RoleID, role.Role]));

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

    const handleDelete = (userId: string) => {
      setUserToDelete(userId); // Set the user to delete
      setShowDeleteDialog(true); // Show the delete confirmation dialog
    };

    const confirmDeleteUser = async () => {
      if (!userToDelete) return;

      try {
        const { error } = await supabase
          .from('Users')
          .delete()
          .eq('UserID', userToDelete);

        if (error) {
          throw error;
        }

        setDeleteSuccessMessage('User deleted successfully!');
        setShowDeleteSuccessDialog(true); // Show the delete success dialog
        fetchUsers();
        setShowDeleteDialog(false); // Close the delete dialog after success
      } catch (error: any) {
        console.error('Error deleting user:', error.message);
        alert('Failed to delete user');
        setShowDeleteDialog(false); // Close the delete dialog on error
      }
    };

    const closeEditForm = () => {
      setEditingUser(null);
      fetchUsers();
    };

    const handleUserUpdateSuccess = () => {
      setShowSuccessDialog(true); // Show success dialog after update
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
              <h1>Accounts</h1>
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
          <EditUser user={editingUser} closeForm={closeEditForm} onUpdateSuccess={handleUserUpdateSuccess} />
        )}

        {showSuccessDialog && (
          <UpdateSuccessDialog onClose={() => setShowSuccessDialog(false)} />
        )}

        {showDeleteDialog && (
          <DeleteUserDialog
            onClose={() => setShowDeleteDialog(false)}
            onDeleteUser={confirmDeleteUser}
            message="Are you sure you want to delete this user? This action cannot be undone."
          />
        )}

        {showDeleteSuccessDialog && (
          <UpdateSuccessDialog
            onClose={() => setShowDeleteSuccessDialog(false)}
            title="User Deleted"
            message={deleteSuccessMessage}
            type="edit" // Pass "delete" type to display delete-specific icon
          />
        )}
      </div>
    );
  };

  export default AccountSettings;
