import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Button, List, Modal, Divider } from 'antd';

import bacIcon1 from '../../Assets/Images/pbverre.png';
import bacIcon2 from '../../Assets/Images/pbrecycler.png';
import bacIcon3 from '../../Assets/Images/Pbdechet.png';

import GoogleSign from '../../Components/GoogleSign';

import SuccessModal from '../../Components/ModalSuccess';

import AuthService from '../../Services/Auth.services';
import { useAuth } from '../../Context/AuthContext';

import { InfoCircleOutlined } from '@ant-design/icons';
const { Text } = Typography;

const Accueil: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [successModalTitle, setSuccessModalTitle] = useState('');
    const [successModalMessage, setSuccessModalMessage] = useState('');

    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);


    const { refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        "Les jours de sorties (y compris fériés)",
        "Les différentes catégories de bacs",
        "Vos changements d'adresse, définitifs ou villégiatures.",
    ];

    useEffect(() => {
        if (location.state?.modalInfo) {
            const { title, message } = location.state.modalInfo;
            loggout();
            setSuccessModalTitle(title);
            setSuccessModalMessage(message);
            setIsSuccessModalVisible(true);
        }
    }, [location.state]);

    const loggout = async () => {
        await AuthService.logout(refreshUser);
    }

    const handleContinue = () => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            setTimeout(() => {
                navigate('/auth/search', { replace: true });
            }, 100);
        } else {
            setIsModalVisible(true);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const closeSuccessModal = () => {
        setIsSuccessModalVisible(false);
    };

    return (
        <section className="accueil-main">
            <h2>
                Une notification envoyée sur votre Smartphone, le jour où vous devez
                <span className="bacs-text"> sortir vos bacs</span>
                <span className="icon-container">
                    <img src={bacIcon1} alt="Bac bleu" className="bac-icon" />
                    <img src={bacIcon2} alt="Bac jaune" className="bac-icon" />
                    <img src={bacIcon3} alt="Bac vert" className="bac-icon" />
                </span>
            </h2>
            <span className="ligneverte"></span>
            <Text className="accueil-text">Plus de tracas, plus d'oublis, tout est prévu !</Text>
            <List
                dataSource={items}
                renderItem={(item) => <List.Item>{item}</List.Item>}
                className="accueil-list"
            />

            <p className="consultexte">
                Pour consulter la notice explicative, appuyez sur l'icône d'information.

                <InfoCircleOutlined
                    style={{ marginLeft: '8px', marginTop: '8px', color: "#6c9274", cursor: 'pointer', fontSize: '20px' }}
                    onClick={() => setIsInfoModalVisible(true)}
                />
            </p>

            <Button type="primary" shape="round" className="accueil-button" onClick={handleContinue}>
                Continuer
            </Button>

            <Modal
                title="Connexion"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
                className="custom-modal"
            >
                <GoogleSign />

            </Modal>
            <SuccessModal
                visible={isSuccessModalVisible}
                onClose={closeSuccessModal}
                title={successModalTitle}
                message={successModalMessage}
                buttonText="Continuer"
            />

            {/* Modal d'information pour l'icône Info */}
            <Modal
                title={<span style={{ color: '#77a682' }}>Fonctionnement de l'Application</span>}
                open={isInfoModalVisible}
                onCancel={() => setIsInfoModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsInfoModalVisible(false)}>
                        Fermer
                    </Button>
                ]}
            >
                <div>
                    <p>
                        Important : Vous devez enregistrer votre adresse au moyen de la géolocalisation <strong style={{ fontWeight: 'bold', color: '#77a682' }}>en vous positionnant au portail de votre habitation</strong>. Si vous avez refusé la géolocalisation, vous devez saisir votre adresse dans la barre de recherche. L’application vous proposera automatiquement différents types de collectes disponibles dans votre zone. Si ce n’est pas le cas, <strong style={{ fontWeight: 'bold', color: '#77a682' }}>merci de les ajouter, ce qui profitera à tous les habitants de votre rue</strong>.
                    </p>

                    <Divider />

                    <p>
                        <strong style={{ fontWeight: 'bold', color: '#77a682' }}>Indicateurs de chargement</strong>
                    </p>
                    <p>
                        Patience, en cas de ralentissement, un indicateur de chargement apparaîtra pendant que les données sont intégrées par l’application.
                    </p>

                    <Divider />

                    <p>
                        <strong style={{ fontWeight: 'bold', color: '#77a682' }}>Informations sur les collectes</strong>
                    </p>
                    <p>Dans la section des collectes, vous pouvez visualiser :</p>
                    <ul>
                        <li>- Le nom de la collecte</li>
                        <li>- Le jour</li>
                        <li>- La fréquence de passage</li>
                    </ul>
                    <p>
                        Vous pouvez également signaler un problème concernant une collecte, ou, si vous en êtes le créateur, la supprimer directement depuis l'interface.
                    </p>

                    <Divider />

                    <p>
                        <strong style={{ fontWeight: 'bold', color: '#77a682' }}>Notifications</strong>
                    </p>
                    <p>
                        Une fois connecté et après avoir renseigné votre adresse, vous recevrez plusieurs notifications importantes :
                    </p>
                    <ul>
                        <li>
                            <strong style={{ fontWeight: 'bold', color: '#77a682' }}>La veille au soir (19h)</strong> : un rappel pour sortir vos bacs.
                        </li>
                        <li>
                            <strong style={{ fontWeight: 'bold', color: '#77a682' }}>Le jour de la collecte (7h)</strong> : un rappel le matin.
                        </li>
                        <li>
                            <strong style={{ fontWeight: 'bold', color: '#77a682' }}>Le soir de la collecte (20h)</strong> : un rappel pour rentrer votre poubelle.
                        </li>
                    </ul>
                    <p>
                        Vous avez la possibilité de désactiver <strong style={{ fontWeight: 'bold', color: '#77a682' }}>la notification pour rentrer vos poubelles</strong>
                        (celle de 20h) à l'aide de l'icône de cloche sur la page ou depuis votre compte utilisateur.
                    </p>
                </div>
            </Modal>
        </section>
    );
};

export default Accueil;