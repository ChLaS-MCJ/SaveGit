import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Typography, Modal, Switch, Spin } from 'antd';

import BellGris from '../../Assets/Images/Icones/bellGris.svg';
import BellVert from '../../Assets/Images/Icones/bellVert.svg';
import logoprofil from '../../Assets/Images/utilisateur.png';

import UserService from '../../Services/User.service';

import SearchBar from '../../Components/SearchBar';
import SuccessModal from '../../Components/ModalSuccess';
import DisplaySearch from '../../Components/DisplaySearch';
import NotificationInitializer from '../../Components/Notification/NotificationInitializer';

import { useAuth } from '../../Context/AuthContext';

import { AddressDetails, FullUserData } from '../../Modules/types';

const { Text } = Typography;

const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>('');
    const [userPhotoURL, setUserPhotoURL] = useState<string>('');
    const [userId, setUserId] = useState<string | null>(null);
    const [fullUserInfo, setFullUserInfo] = useState<FullUserData | null>(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    const { user, isAuthenticated, notificationsEnabled, updateNotifications } = useAuth();

    const [successModalTitle, setSuccessModalTitle] = useState('');
    const [successModalMessage, setSuccessModalMessage] = useState('');

    const [defaultAddress, setDefaultAddress] = useState<string>('');
    const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    const fetchFullUserInfo = async (userId: string) => {
        try {
            const fullUserInfo = await UserService.fetchFullUserInfo(userId);

            setFullUserInfo(fullUserInfo);

            if (fullUserInfo) {
                const { street, city, postalcode, codeInsee, codeRivoli } = fullUserInfo.user;

                const formattedAddress =
                    street && city && postalcode
                        ? `${street}, ${postalcode} ${city}`
                        : 'Recherchez votre adresse';

                setDefaultAddress(formattedAddress);
                setSelectedAddress({ street, city, postalcode, codeInsee, codeRivoli });

                setUserName(() => {
                    const firstName = user?.givenName !== "null" && user?.givenName ? user.givenName : "";
                    const lastName = user?.familyName !== "null" && user?.familyName ? user.familyName : "";

                    if (firstName && lastName) {
                        return `${lastName} ${firstName}`;
                    } else if (lastName) {
                        return lastName;
                    } else if (firstName) {
                        return firstName;
                    } else {
                        return "";
                    }
                });
                setUserPhotoURL(user?.imageUrl || logoprofil);
            } else {
                localStorage.clear();
                navigate('/accueil', { replace: true });
            }
        } catch (error) {
            localStorage.clear();
            navigate('/accueil', { replace: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchFullUserInfo(user.idgoogle);
            setUserId(user.idgoogle);
        }


    }, [isAuthenticated, user]);

    const toggleNotifications = async (checked: boolean) => {
        try {
            await updateNotifications(checked); // 🔥 Utilise la fonction du contexte

            setIsModalVisible(false);
            setSuccessModalTitle('Succès');
            setSuccessModalMessage(`Notifications ${checked ? 'activées' : 'désactivées'} avec succès`);
            setIsSuccessModalVisible(true);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des notifications:', error);
        }
    };

    const handleAddressSelect = async (addressDetails: AddressDetails, saveAddress: boolean) => {
        setSelectedAddress(addressDetails);

        if (saveAddress && userId) {
            try {
                const updatedUser = await UserService.updateUserLocation(addressDetails, userId);
                if (updatedUser) {
                    setSuccessModalTitle('Adresse sauvegardée');
                    setSuccessModalMessage('Votre adresse a été enregistrée avec succès');
                    setIsSuccessModalVisible(true);
                }
            } catch (error) {
                console.error('Error updating user location:', error);
            }
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const closeSuccessModal = () => {
        setIsSuccessModalVisible(false);
    };

    return (
        <>
            <div className="search-page-header">
                <div className="user-info">
                    <Avatar src={userPhotoURL} size={48} />
                    <div className="user-details">
                        <Text className="user-name">Bonjour {userName}</Text>
                        <Text className="user-message">N'oubliez plus vos poubelles !</Text>
                    </div>
                </div>
                <span className="notification-iconbell">
                    <img
                        src={notificationsEnabled ? BellVert : BellGris}
                        alt="Notifications"
                        className="custom-iconbell"
                        onClick={() => setIsModalVisible(true)}
                    />
                </span>

                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Notifications</span>
                            <img src={BellVert} className="custom-iconbell" alt="Notification Icon" />
                        </div>
                    }
                    open={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                    centered
                    className="custom-modal"
                >
                    <p className="messagenotif">
                        Vous avez la possibilité {notificationsEnabled ? 'de désactiver' : "d'activer"} les notifications
                        vous rappelant de rentrer vos poubelles après la collecte.
                        Utilisez le bouton ci-dessous pour les {notificationsEnabled ? 'désactiver' : 'activer'}.
                    </p>
                    <div className="notification-toggle">
                        <Text>{notificationsEnabled ? 'Désactiver' : 'Activer'} les notifications :</Text>
                        <Switch
                            checked={notificationsEnabled}
                            onChange={(checked) => toggleNotifications(checked)}
                            style={{ marginLeft: '10px' }}
                        />
                    </div>
                </Modal>

                {isSuccessModalVisible && (
                    <SuccessModal
                        visible={isSuccessModalVisible}
                        onClose={closeSuccessModal}
                        title={successModalTitle}
                        message={successModalMessage}
                        buttonText="Continuer"
                    />
                )}
            </div>

            <div>
                <NotificationInitializer userId={userId} />
                <SearchBar handleSelect={handleAddressSelect} defaultAddress={defaultAddress} />
            </div>
            <div>
                <Spin spinning={loading}>
                    {fullUserInfo && (
                        <DisplaySearch
                            selectedOption={selectedAddress || {
                                street: '',
                                city: '',
                                postalcode: '',
                                codeInsee: '',
                                codeRivoli: ''
                            }}
                            fullUserInfo={fullUserInfo}
                        />
                    )}
                </Spin>
            </div>
        </>
    );
};

export default SearchPage;
