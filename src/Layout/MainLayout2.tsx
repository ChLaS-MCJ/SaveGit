import React from 'react';
import { Outlet } from 'react-router-dom';
import FooterContent from './Footer/Footer';
import HeaderContent from '../Layout/Header/Header';
const MainLayout2: React.FC = () => {
    return (
        <div className="layout">
            <HeaderContent />
            <main className="main-content">
                <Outlet />
            </main>
            <FooterContent />
        </div>
    );
};

export default MainLayout2;
