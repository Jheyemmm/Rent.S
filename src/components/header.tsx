import * as React from 'react';
import MenuComponent from '../components/frontdesk_menu';
import './header.css';
import notification from '../assets/icons/bell.png';
import user from '../assets/icons/User.png';

const Header: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const sidebarRef = React.useRef(null);

    return (
        <div>
            <div className="header custom-header-color">
                <div className="header-container">
                    <div className="header-right">
                        <img src={notification} alt="Notification" className="icon-bell" />
                        <div className="user-info">
                            <span className="user-name">John</span>
                            <span className="user-role">Front Desk</span>
                        </div>
                        <img src={user} alt="User" className="icon-user" />
                    </div>
                </div>
            </div>
            <MenuComponent ref={sidebarRef} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        </div>
    );
};

export default Header;