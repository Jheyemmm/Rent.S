import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/header";
import MenuComponent from "../../components/admin_menu";
import supabase from "../../supabaseClient";
import './admin-settings.css';
import UpdateSuccessDialog from "../../components/Editsuccess";

interface User {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  Username: string;
  Email: string;
  RoleID: number;
  StatusActive: boolean;
  created_at: string;
}

interface RoleData {
  RoleID: number;
  Role: string;
}

const AdminSettings: React.FC = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roleID, setRoleID] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          setMessage({ text: "Authentication error", type: "error" });
          setLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('*')
          .eq('Email', authData.user.email)
          .single();

        if (userError || !userData) {
          setMessage({ text: "Failed to load user data", type: "error" });
          setLoading(false);
          return;
        }

        const { data: roleData } = await supabase
          .from('Roles')
          .select('Role')
          .eq('RoleID', userData.RoleID)
          .single();

        setCurrentUser(userData);
        setUserFirstName(userData.UserFirstName || "");
        setUserLastName(userData.UserLastName || "");
        setUsername(userData.Username || "");
        setEmail(userData.Email || "");
        setRoleID(userData.RoleID);
        setRoleName(roleData?.Role || "Unknown Role");
      } catch (error) {
        setMessage({ text: "An unexpected error occurred", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveChanges = async () => {
    if (!currentUser) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error: updateError } = await supabase
        .from('Users')
        .update({
          UserFirstName: userFirstName,
          UserLastName: userLastName,
          Username: username,
          Email: email,
        })
        .eq('UserID', currentUser.UserID);

      if (updateError) {
        setMessage({ text: "Failed to update profile", type: "error" });
        return;
      }

      await supabase.auth.updateUser({
        data: { 
          first_name: userFirstName,
          last_name: userLastName
        }
      });

      setMessage({ text: "Changes saved successfully", type: "success" });
      setShowSuccessDialog(true);
    } catch (error) {
      setMessage({ text: "An unexpected error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <MenuComponent ref={sidebarRef} isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className="dashboard-main">
          <div className="settings-container">
            <div className="settings-header">
              <h1>Settings</h1>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading user data...</div>
            ) : (
              <div className="settings-form">
                <div className="settings-form-group">
                  <label>Name</label>
                  <div className="name-inputs">
                    <input 
                      type="text"
                      placeholder="First Name"
                      value={userFirstName}
                      onChange={(e) => setUserFirstName(e.target.value)}
                      className="settings-input half"
                    />
                    <input 
                      type="text"
                      placeholder="Last Name"
                      value={userLastName}
                      onChange={(e) => setUserLastName(e.target.value)}
                      className="settings-input half"
                    />
                  </div>
                </div>
                
                <div className="settings-form-group">
                  <label>Username</label>
                  <input 
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="settings-input"
                  />
                </div>
                
                <div className="settings-form-group">
                  <label>Email</label>
                  <input 
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="settings-input"
                  />
                </div>
                
                <div className="settings-form-group">
                  <label>User Role</label>
                  <div className="role-select">
                    <input 
                      type="text"
                      value={roleName}
                      readOnly
                      className="settings-input role-input"
                    />
                  </div>
                </div>
                
                {message && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}
                
                <div className="settings-actions">
                  <button 
                    className="save-button"
                    onClick={handleSaveChanges}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showSuccessDialog && (
        <UpdateSuccessDialog
        type="edit"
          title="Profile Updated"
          message="Your profile information has been successfully updated."
          onClose={() => setShowSuccessDialog(false)}
        />
      )}
    </div>
  );
};

export default AdminSettings;
