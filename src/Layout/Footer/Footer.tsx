import React, { useState } from 'react';
import { UpCircleOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';
import { Drawer } from 'antd';
import Account from '../../Components/Account';

import HomeIconGris from '../../Assets/Images/Icones/HomeGris.svg';
import HomeIconVert from '../../Assets/Images/Icones/HomeVert.svg';
import UserIconGris from '../../Assets/Images/Icones/UserGris.svg';
import UserIconVert from '../../Assets/Images/Icones/UserVert.svg';
import WalletIconGris from '../../Assets/Images/Icones/WalletGris.svg';
import WalletIconVert from '../../Assets/Images/Icones/WalletVert.svg';

import { useAuth } from '../../Context/AuthContext';

const FooterContent: React.FC = () => {
    const location = useLocation();
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const { isAuthenticated } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const scrollToTop = () => {
        const layoutContainer = document.querySelector('.main-content');
        if (layoutContainer) {
            layoutContainer.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
        }
    };

    const openDrawer = () => {
        if (isAuthenticated) {
            setIsDrawerVisible(true);
        }
    };

    const closeDrawer = () => {
        setIsDrawerVisible(false);
    };


    return (
        <footer className="footer">
            <div className="footer-icons">
                <div className="containerIconegauche">
                    <Link to="/accueil" className={`footer-icon ${isActive('/accueil') ? 'active' : ''}`}>
                        <img
                            src={isActive('/accueil') ? HomeIconVert : HomeIconGris}
                            alt="Home"
                            className="custom-icon"
                        />
                    </Link>
                    {isAuthenticated ? (
                        <Link to="/auth/search" className={`footer-icon ${isActive('/auth/search') ? 'active' : ''}`}>
                            <img
                                src={isActive('/auth/search') ? WalletIconVert : WalletIconGris}
                                alt="Wallet"
                                className="custom-icon"
                            />
                        </Link>
                    ) : (
                        <span className="footer-icon disabled">
                            <img src={WalletIconGris} alt="Wallet" className="custom-icon" />
                        </span>
                    )}
                </div>
                {isAuthenticated ? (
                    <div onClick={openDrawer} className={`footer-icon ${isActive('/auth/account') ? 'active' : ''}`}>
                        <img
                            src={isActive('/auth/account') ? UserIconVert : UserIconGris}
                            alt="User"
                            className="custom-icon"
                        />
                    </div>
                ) : (
                    <span className="footer-icon disabled">
                        <img src={UserIconGris} alt="User" className="custom-icon" />
                    </span>
                )}
            </div>
            <div className="footer-button">
                <UpCircleOutlined onClick={scrollToTop} />
            </div>

            <Drawer
                title={<div style={{ textAlign: 'center', width: '100%' }}>Compte</div>}
                placement="bottom"
                onClose={closeDrawer}
                open={isDrawerVisible}
                height="70%"
                className='draweraccount'
            >
                <Account />
            </Drawer>
        </footer>
    );
};

export default FooterContent;
