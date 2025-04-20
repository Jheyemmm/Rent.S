import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/header";
import MenuComponent from "../../components/frontdesk_menu";
import supabase from "../../supabaseClient";
import './frontdesk-settings.css';

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

const FrontdeskSettings: React.FC = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // User state
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roleID, setRoleID] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First, check if we can get the user directly from auth
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError.message);
          setMessage({ text: "Authentication error", type: "error" });
          setLoading(false);
          return;
        }
        
        if (!authData.user) {
          console.error("No authenticated user found");
          setMessage({ text: "No authenticated user found", type: "error" });
          setLoading(false);
          return;
        }
        
        // Get user info from Users table based on email
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('*')
          .eq('Email', authData.user.email)
          .single();
        
        if (userError) {
          console.error("Failed to fetch user data:", userError.message);
          setMessage({ text: "Failed to load user data", type: "error" });
          setLoading(false);
          return;
        }
        
        if (!userData) {
          console.error("No user data found");
          setMessage({ text: "User data not found", type: "error" });
          setLoading(false);
          return;
        }
        
        // Get the role name from the Roles table
        const { data: roleData, error: roleError } = await supabase
          .from('Roles')
          .select('Role')
          .eq('RoleID', userData.RoleID)
          .single();
        
        if (roleError) {
          console.error("Failed to fetch role data:", roleError.message);
        }
        
        // Set user data in state
        setCurrentUser(userData);
        setUserFirstName(userData.UserFirstName || "");
        setUserLastName(userData.UserLastName || "");
        setUsername(userData.Username || "");
        setEmail(userData.Email || "");
        setRoleID(userData.RoleID);
        setRoleName(roleData?.Role || "Unknown Role");
      } catch (error) {
        console.error("Unexpected error:", error);
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
      // Update the user record
      const { error: updateError } = await supabase
        .from('Users')
        .update({
          UserFirstName: userFirstName,
          UserLastName: userLastName,
          Username: username,
          Email: email,
          // Note: We're not updating RoleID here as it should be managed separately
        })
        .eq('UserID', currentUser.UserID);
      
      if (updateError) {
        console.error("Error updating profile:", updateError.message);
        setMessage({ text: "Failed to update profile", type: "error" });
        return;
      }
      
      // Also update auth user metadata if needed
      await supabase.auth.updateUser({
        data: { 
          first_name: userFirstName,
          last_name: userLastName
        }
      });
      
      setMessage({ text: "Changes saved successfully", type: "success" });
    } catch (error) {
      console.error("Unexpected error:", error);
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
    </div>
  );
};

export default FrontdeskSettings;