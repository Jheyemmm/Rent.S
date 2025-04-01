import React, { useState, useEffect, useRef } from 'react';
import MenuComponent from '../components/frontdesk_menu'; // Adjust the path as needed

const Dashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleOutsideClick = (event: MouseEvent) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
            setSidebarOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return (
        <div>
            <div className="header">
                <div className="header-container">
                    
                    <h1>Dashboard</h1>
                </div>
            </div>
            <MenuComponent ref={sidebarRef} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            {/* Other Dashboard content */}
        </div>
    );
};

export default Dashboard;
