import React, { useState, useRef } from "react";
import Header from "../../components/header";
import MenuComponent from "../../components/admin_menu";
import './admin-settings.css';

const AdminSettings: React.FC = () => {

    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <MenuComponent ref={sidebarRef} isOpen={true} setIsOpen={() => {}} />
          <main className="dashboard-main">
            <div className="payment-container">
              <div className="payment-header">
                <h1>Settings</h1>
  
                
              </div>
  
              
            </div>
  
            
          </main>
        </div>
      </div>
    );
};

export default AdminSettings;