import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import MenuComponent from './admin_menu';
import './header.css';
import userIcon from '../assets/icons/User.png';
import supabase from '../supabaseClient';

const AdminHeader: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [roleName, setRoleName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    async function fetchUserInfo() {
      setLoading(true);
      try {
        // Get the current authenticated user
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          setLoading(false);
          return;
        }

        // Ensure we fetch both UserFirstName and Role data
        const { data, error } = await supabase
          .from('Users')
          .select('UserFirstName, RoleID')  // Fetch RoleID to join with Roles table
          .eq('Email', authUser.email)
          .single(); // Ensure a single user is returned

        if (error || !data) {
          console.error('Error fetching user info with role:', error);
          setLoading(false);
          return;
        }

        // Set first name
        setFirstName(data.UserFirstName);

        // Now, fetch the role data based on RoleID (considering possible restrictions)
        const { data: roleData, error: roleError } = await supabase
          .from('Roles')
          .select('Role')
          .eq('RoleID', data.RoleID)  // Use RoleID from the user record to fetch role
          .single();  // Assuming RoleID corresponds to a single role

        if (roleError || !roleData) {
          console.error('Error fetching role data:', roleError);
          setRoleName('User'); // Default to 'User' if no role is found
        } else {
          // Set the role if found
          setRoleName(roleData.Role);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserInfo();
  }, []);

  return (
    <div>
      <div className="admin-header">
        <div className="adminheader-container">
          <div className="adminheader-right">
            <div className="user-info">
              {loading ? (
                <span className="user-name">Loading...</span>
              ) : (
                <>
                  <span className="user-name">{firstName || 'Guest'}</span>
                  <span className="user-role">{roleName || 'User'}</span>
                </>
              )}
            </div>
            <img src={userIcon} alt="User" className="icon-user" />
          </div>
        </div>
      </div>
      <MenuComponent
        ref={sidebarRef}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
    </div>
  );
};

export default AdminHeader;
