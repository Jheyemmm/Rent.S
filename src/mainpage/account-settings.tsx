import React, { useState } from 'react';
import Header from '../components/admin_header';
import AdminMenu from '../components/admin_menu';
import EditUser from '../components/edit_user';
import './account-settings.css';

interface User {
  id: number;
  fullname: string;
  email: string;
  username: string;
  role: string;
}

const mockUsers: User[] = [
  { id: 1, fullname: 'Angelina Jolie', email: 'angelina.j@gmail.com', username: 'angie23', role: 'Front Desk' },
  { id: 2, fullname: 'JM Macasacbwang', email: 'jmkokoy@gmail.com', username: 'Jheyem', role: 'Admin' },
  { id: 3, fullname: 'Princess Caballeda', email: 'p.caumanc@gmail.com', username: 'Prim', role: 'Admin' },
  { id: 4, fullname: 'Famira Mel Catalan', email: 'fm.catalan@gmail.com', username: 'Pai', role: 'Front Desk' },
];

const AccountSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const toggleDropdown = (userId: number) => {
    setDropdownOpenId(prev => (prev === userId ? null : userId));
  };

  const handleEdit = (userId: number) => {
    const user = mockUsers.find((u) => u.id === userId);
    if (user) setEditingUser(user);
  };

  const handleDelete = (userId: number) => {
    console.log(`Delete user ${userId}`);
  };

  const closeEditForm = () => {
    setEditingUser(null);
  };

  return (
    <div className="page-container">
      <Header />

      <div className="main-content-container">
        <AdminMenu isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="content-wrapper">
          <div className="white-container">
            <h1>Settings</h1>
            <h3>List of Users</h3>

            <table className="user-table">
              <thead>
                <tr>
                  <th>Fullname</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullname}</td>
                    <td>{user.email}</td>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td className="dropdown-cell">
                      <div
                        className="dots-button"
                        onClick={() => toggleDropdown(user.id)}
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
                ))}
              </tbody>
            </table>
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
