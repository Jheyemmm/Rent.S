import React, { useEffect, useRef, useState } from 'react';
import MenuComponent from '../components/frontdesk_menu'; // Adjust the path as needed
import Header from '../components/header'; // Adjust the path as needed
import './dashboard.css'; // Import the CSS file for styling

const Dashboard: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside the sidebar to close it
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        console.log('Dashboard mounted');
    }, []);

    return (
        <div className="dashboard-container">
            <Header />
            <div className="dashboard-content">
                {/* Attach ref to MenuComponent */}
                <MenuComponent ref={sidebarRef} isOpen={isOpen} setIsOpen={setIsOpen} />
                <main className="dashboard-main">
                    <p>Dashboard</p>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
