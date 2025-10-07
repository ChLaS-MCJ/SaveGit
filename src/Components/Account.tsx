import React, { useState, useEffect } from 'react';
import { Row, Col, Avatar, Divider, Typography, Button, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

import ErrorNotif from '../Assets/Images/traverser.png';
import ValidateNotif from '../Assets/Images/verifier.png';
import Info from '../Assets/Images/Icones/information.svg';
import Shield from '../Assets/Images/Icones/secure-shield-shield.svg';

import ConditionsUtilisation from "../Components/ConditionsUtilisation";
import AvisConfidentialité from "../Components/AvisConfidentialité";
import { FullUserData } from '../Modules/types';
import logoprofil from '../Assets/Images/utilisateur.png';
import UserService from '../Services/User.service';
import AuthService from '../Services/Auth.services';
import { useAuth } from '../Context/AuthContext';
// Suppression de l'import de useNotification car on gère cela localement

const { Text } = Typography;

const Account: React.FC = () => {
    const navigate = useNavigate();

    const { user, isAuthenticated, refreshUser, notificationsEnabled, updateNotifications } = useAuth();
    const [allInfo, setAllInfo] = useState<FullUserData | null>(null);

    const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
    const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [successModalTitle, setSuccessModalTitle] = useState('');
    const [successModalMessage, setSuccessModalMessage] = useState('');

    useEffect(() => {

        if (!isAuthenticated) {
            navigate("/accueil");
        } else {

            const fetchUserInfo = async () => {
                try {
                    const fullUserInfo = await UserService.fetchFullUserInfo(user?.idgoogle || '');
                    if (fullUserInfo) {
                        setAllInfo(fullUserInfo);

                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération des informations utilisateur :", error);
                }
            };
            fetchUserInfo();
        }
    }, [isAuthenticated, user, navigate]);

    // Fonction de bascule pour les notifications
    const handleToggle = async () => {
        const newValue = !notificationsEnabled;
        try {
            await updateNotifications(newValue);

            setSuccessModalTitle('Succès');
            setSuccessModalMessage(`Notifications ${newValue ? 'activées' : 'désactivées'} avec succès`);
            setIsSuccessModalVisible(true);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des notifications:', error);
        }
    };

    const handleLogout = async () => {
        await AuthService.logout(refreshUser);
        navigate("/accueil", {
            state: {
                modalInfo: {
                    title: "Déconnexion réussie",
                    message: "Vous avez été déconnecté avec succès.",
                },
            },
        });
    };

    const handleDataDeletion = () => {
        setIsDeleteModalVisible(true);
    };

    const confirmDataDeletion = async () => {
        if (allInfo && allInfo.user.idgoogle) {
            try {
                const response = await UserService.deleteUserData(allInfo.user.idgoogle);
                if (response) {
                    closeDeleteModal();
                    navigate("/accueil", {
                        state: {
                            modalInfo: {
                                title: "Compte supprimé",
                                message: "Votre compte a été supprimé avec succès.",
                            },
                        },
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la suppression des données :", error);
            }
        }
    };

    const handlePrivacyPolicy = () => {
        setIsPrivacyModalVisible(true);
    };

    const handleTermsOfUse = () => {
        setIsTermsModalVisible(true);
    };

    const closePrivacyModal = () => {
        setIsPrivacyModalVisible(false);
    };

    const closeTermsModal = () => {
        setIsTermsModalVisible(false);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalVisible(false);
    };

    // Détermination du nom à afficher
    const firstName = user?.givenName !== "null" && user?.givenName ? user.givenName : "";
    const lastName = user?.familyName !== "null" && user?.familyName ? user.familyName : "";

    let displayName = "";
    if (firstName && lastName) {
        displayName = `${lastName} ${firstName}`;
    } else if (lastName) {
        displayName = lastName;
    } else if (firstName) {
        displayName = firstName;
    }

    return (
        <>
            {allInfo && (
                <div className="account-page-header">
                    <Row gutter={24} align="middle">
                        <Col span={10} style={{ textAlign: 'center' }}>
                            <Avatar src={user?.imageUrl || logoprofil} size={60} />
                        </Col>
                        <Col span={24}>
                            <div className="account-user-details">
                                <Text className="account-user-name">{displayName}</Text>
                                <Text className="account-user-message">{allInfo.user.email}</Text>
                                <Text className="titleaccountadresse">
                                    {allInfo.user.street}, {allInfo.user.city} {allInfo.user.postalcode}
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </div>
            )}
            <div className="BoxInfo">
                <Divider />
                {allInfo && (
                    <div className="additional-info">
                        <Text className="titleaccount">
                            Notifications pour rentrer votre poubelle
                        </Text>
                        <Button
                            type="primary"
                            shape="round"
                            className="btnaccount"
                            onClick={handleToggle}
                        >
                            <span className="notification-iconbellAccount">
                                <img
                                    src={notificationsEnabled ? ValidateNotif : ErrorNotif}
                                    alt="Notifications"
                                    className="custom-iconbellAccount"
                                />
                            </span>
                            {notificationsEnabled ? 'Activées' : 'Désactivées'}
                        </Button>
                    </div>
                )}
                <Divider />

                <div className="account-action-buttons">
                    <Button
                        type="link"
                        block
                        onClick={handleTermsOfUse}
                        style={{ marginBottom: '25px', color: '#678e70' }}
                    >
                        <img src={Info} alt="Conditions d'utilisation" className="custom-iconAccount" /> Conditions d'utilisation
                    </Button>
                    <Button
                        type="link"
                        block
                        onClick={handlePrivacyPolicy}
                        style={{ marginBottom: '25px', color: '#678e70' }}
                    >
                        <img src={Shield} alt="Avis sur la confidentialité" className="custom-iconAccount" /> Avis sur la confidentialité
                    </Button>

                    <Button type="default" block onClick={handleDataDeletion} style={{ marginBottom: '30px' }}>
                        Supprimer mon compte
                    </Button>
                    <Button type="primary" danger block onClick={handleLogout} style={{ marginBottom: '10px' }}>
                        Déconnexion
                    </Button>
                </div>
            </div>

            <Modal open={isPrivacyModalVisible} onCancel={closePrivacyModal} footer={null}>
                <AvisConfidentialité />
            </Modal>

            <Modal open={isTermsModalVisible} onCancel={closeTermsModal} footer={null}>
                <ConditionsUtilisation />
            </Modal>

            <Modal
                title="Suppression des données"
                open={isDeleteModalVisible}
                onCancel={closeDeleteModal}
                footer={[
                    <Button key="cancel" onClick={closeDeleteModal}>
                        Annuler
                    </Button>,
                    <Button key="confirm" type="primary" danger onClick={confirmDataDeletion}>
                        J'en suis sûr
                    </Button>,
                ]}
            >
                <p>
                    Êtes-vous sûr de vouloir supprimer toutes vos données ? Les données supprimées ne seront pas récupérables.
                </p>
            </Modal>

            {isSuccessModalVisible && (
                <Modal
                    open={isSuccessModalVisible}
                    onCancel={() => setIsSuccessModalVisible(false)}
                    footer={null}
                    centered
                >
                    <div style={{ textAlign: 'center' }}>
                        <Typography.Title level={4}>{successModalTitle}</Typography.Title>
                        <Typography.Paragraph>{successModalMessage}</Typography.Paragraph>
                        <Button type="primary" onClick={() => setIsSuccessModalVisible(false)}>
                            Continuer
                        </Button>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default Account;
