// Header.tsx
import React from 'react';
import { Typography } from 'antd';
import logo from '../../Assets/Images/LogoQuandPb500x500.png';

const { Title, Text } = Typography;

const HeaderContent: React.FC = () => (
    <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <Title level={2} className="title">SORS TA POUBELLE</Title>
        <Text className="subtitle">L' APPLICATION GRATUITE QUI VOUS FACILITE LA VIE !</Text>
    </header>
);

export default HeaderContent;
