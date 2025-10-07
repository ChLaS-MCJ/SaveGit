import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderContent from '../Layout/Header/Header';
import FooterContent from '../Layout/Footer/Footer';

const MainLayout: React.FC = () => {
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

export default MainLayout;
