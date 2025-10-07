import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import { IonRow, IonCol } from '@ionic/react';
import { Modal, Select, Button, Spin, Divider, message } from 'antd';
import { DisplaySearchProps, CollectResult } from '../Modules/types';

import SuccessModal from '../Components/ModalSuccess';
import ErrorModal from '../Components/ModalError';
import BlacklistErrorModal from '../Components/BlacklistErrorModal';

import SearchService from "../Services/Search.services";
import UserService from '../Services/User.service';

// Import d'images
import Pbdechet from '../Assets/Images/poubelle.png';
import Pbverre from '../Assets/Images/bouteille.png';
import Pbrecycler from '../Assets/Images/recycler.png';
import Pbplante from '../Assets/Images/feuille.png';
import Pbpuanteur from '../Assets/Images/puanteur.png';

import AddCollecteModal from '../Form/AddCollecteModal';

import { useAuth } from '../Context/AuthContext';

// Pour l'indicateur personnalisé du spinner (blanc)
import { LoadingOutlined, InfoCircleOutlined } from '@ant-design/icons';
const whiteIcon = <LoadingOutlined style={{ fontSize: 16, color: 'white' }} spin />;

const categories = [
    { displayName: 'Collectes', dbName: 'Collectes', image: Pbdechet },
    { displayName: 'Ménagers', dbName: 'Ménagers', image: Pbpuanteur },
    { displayName: 'Organique', dbName: 'Organiques', image: Pbplante },
    { displayName: 'Recyclés', dbName: 'Recyclés', image: Pbrecycler },
    { displayName: 'Verres', dbName: 'Verres', image: Pbverre },
];

const DisplaySearch: React.FC<DisplaySearchProps> = ({ selectedOption, fullUserInfo }) => {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<string>('Collectes');
    const [collectes, setCollectes] = useState<CollectResult[]>([]);
    const [selectedCollecte, setSelectedCollecte] = useState<CollectResult | null>(null);
    const [reportText, setReportText] = useState('');
    const [authkeytel, setauthkeytel] = useState('');

    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    // Modal de succès pour la suppression
    const [isDeleteSuccessModalVisible, setIsDeleteSuccessModalVisible] = useState(false);
    const [selectedReportOption, setSelectedReportOption] = useState<string | null>(null);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [isAddCollectModalVisible, setIsAddCollectModalVisible] = useState(false);
    const [isBlacklistErrorModalVisible, setIsBlacklistErrorModalVisible] = useState(false);

    // Loader global et spécifique
    const [isLoading, setIsLoading] = useState(false);
    const [isAddLoading, setIsAddLoading] = useState(false);
    const [isReportLoading, setIsReportLoading] = useState(false);
    // Identifiant de la collecte en cours de signalement
    const [reportingCollectionId, setReportingCollectionId] = useState<string | null>(null);

    // États pour le modal de succès du signalement
    const [successTitle, setSuccessTitle] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // État pour la modal d'information (icône Info)
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

    // Fonction pour vérifier si l'adresse est valide
    const isAddressValid = () => {
        return !!(
            selectedOption.codeInsee &&
            selectedOption.codeRivoli &&
            selectedOption.street &&
            selectedOption.city &&
            selectedOption.postalcode
        );
    };

    useEffect(() => {
        if (selectedOption.codeInsee && selectedOption.codeRivoli) {
            fetchCollectes();
        }
        const authkeytel = fullUserInfo.user.authKeytel;
        setauthkeytel(authkeytel);
    }, [selectedOption]);

    const fetchCollectes = async () => {
        try {
            setSelectedCategory("Collectes");
            setIsLoading(true);
            const normalizedSelectedRivoli = normalizeCodeRivoli(selectedOption.codeRivoli);
            const response = await SearchService.getCollectByAdresse(
                selectedOption.codeInsee,
                normalizedSelectedRivoli
            );
            setCollectes(response.collectes);
        } catch (error) {
            console.error("Erreur lors de la récupération des collectes :", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
    };

    const formatMonth = (dateString: string) => {
        const months = [
            "janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre"
        ];
        if (!dateString) return "";
        const [, month] = dateString.split("-");
        return months[parseInt(month, 10) - 1];
    };

    const handleDeleteCollecte = async () => {
        if (!selectedCollecte) return;
        if (!window.confirm("Voulez-vous vraiment supprimer cette collecte ?")) return;
        try {
            await SearchService.deleteCollecte(selectedCollecte.id);
            await fetchCollectes();
            setIsReportModalVisible(false);
            setSelectedCollecte(null);
            // Affichage du modal de succès pour la suppression
            setIsDeleteSuccessModalVisible(true);
        } catch (error) {
            console.error("Erreur lors de la suppression de la collecte :", error);
            setIsErrorModalVisible(true);
        }
    };

    const openReportModal = async (collecte: CollectResult) => {
        setReportingCollectionId(collecte.id);
        setSelectedCollecte(collecte);
        setIsReportLoading(true);

        try {
            if (!user) {
                console.error("Aucun utilisateur connecté");
                setIsErrorModalVisible(true);
                return;
            }

            const userData = await UserService.fetchFullUserInfo(user.idgoogle);
            if (userData && userData.user.isBlocked) {
                setIsBlacklistErrorModalVisible(true);
                return;
            }

            const isCreator = collecte.authkeytelcollecte === fullUserInfo.user.authKeytel;

            if (collecte.report && !isCreator) {
                setSuccessTitle("Signalement");
                setSuccessMessage("Une signalisation a déjà été effectuée pour cette collecte. Nous nous engageons à régulariser cette collecte dans les plus brefs délais.");
                setIsSuccessModalVisible(true);
            } else {
                setIsReportModalVisible(true);
            }
        } catch (error) {
            console.error("Erreur lors de l'ouverture du modal de signalement :", error);
            setIsErrorModalVisible(true);
        } finally {
            setIsReportLoading(false);
            setReportingCollectionId(null);
        }
    };

    const handleReportModalCancel = () => {
        setIsReportModalVisible(false);
        setSelectedCollecte(null);
    };

    const handleReportSubmit = async () => {
        if (selectedCollecte && selectedReportOption) {
            const reportData = {
                collecteId: selectedCollecte.id,
                reportText,
                selectedReportOption,
                authkeytel,
            };
            try {
                await SearchService.sendReport(reportData);
                setIsReportModalVisible(false);
                setSelectedCollecte(null);
                setSuccessTitle("Signalement");
                setSuccessMessage("Merci, cette collecte est déjà en cours de régularisation. Nous nous efforçons de régler cela dans les plus brefs délais.");
                setIsSuccessModalVisible(true);
                await fetchCollectes();
            } catch (error) {
                console.error("Erreur lors de l'envoi du signalement :", error);
            }
        }
    };

    // Normalisation de codeRivoli pour comparaison
    const normalizeCodeRivoli = (code: string) => {
        const parts = code.split("_");
        return parts.length === 3 ? parts[1] : code;
    };

    const handleAddCollectClick = async () => {
        setIsAddLoading(true);
        try {
            if (!user) {
                console.error("Aucun utilisateur connecté");
                return;
            }
            const userData = await UserService.fetchFullUserInfo(user.idgoogle);
            if (userData && userData.user.isBlocked) {
                setIsBlacklistErrorModalVisible(true);
                return;
            }
            // On retire la vérification de la géolocalisation et on ouvre directement la modal
            setIsAddCollectModalVisible(true);
        } catch (error) {
            console.error("Erreur lors de la vérification de l'utilisateur :", error);
        } finally {
            setIsAddLoading(false);
        }
    };

    const renderCollectes = useCallback(() => {
        let filteredResults = [];
        if (selectedCategory === 'Collectes') {
            filteredResults = collectes;
        } else {
            const selectedCategoryInfo = categories.find(category => category.displayName === selectedCategory);
            const dbCategory = selectedCategoryInfo ? selectedCategoryInfo.dbName : selectedCategory;
            filteredResults = collectes.filter((result) => result.categorie === dbCategory);
        }

        // Fonction pour gérer le clic sur le bouton
        const handleButtonClick = () => {
            if (!isAddressValid()) {
                // Affiche le message même si le bouton est désactivé visuellement
                message.warning({
                    content: "Veuillez sélectionner une adresse valide pour ajouter une collecte",
                    style: {
                        marginTop: '20px'
                    },
                    duration: 3
                });
                return;
            }

            // Si l'adresse est valide, continuer avec la fonction normale
            handleAddCollectClick();
        };

        // Style pour le bouton désactivé avec typage correct
        const buttonStyle: CSSProperties = isAddressValid()
            ? {}
            : {
                opacity: 0.6,
                background: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                pointerEvents: 'auto',
                cursor: 'not-allowed'
            };

        return (
            <>
                {filteredResults.map((result) => {
                    let displayName = '';
                    let icon = '';
                    if (selectedCategory === 'Collectes') {
                        const actualCategory = categories.find(cat => cat.dbName === result.categorie);
                        displayName = actualCategory ? actualCategory.displayName : result.categorie;
                        icon = actualCategory ? actualCategory.image : '';
                    } else {
                        const selectedCategoryInfo = categories.find(category => category.displayName === selectedCategory);
                        displayName = selectedCategoryInfo ? selectedCategoryInfo.displayName : selectedCategory;
                        icon = selectedCategoryInfo ? selectedCategoryInfo.image : '';
                    }

                    return (
                        <div key={result.id} className="collect-item">
                            <div className="collect-info">
                                <div className="collect-header">
                                    <p className="collect-category">{displayName}</p>
                                    <div className="collect-options-btn">
                                        {reportingCollectionId === result.id && isReportLoading ? (
                                            <Spin indicator={whiteIcon} size="small" />
                                        ) : (
                                            <button onClick={() => openReportModal(result)}>⋮</button>
                                        )}
                                    </div>
                                </div>

                                <div className="collect-details">
                                    <div className="collect-attributes">

                                        {(() => {
                                            const isSpecialFrequency = result.frequence === "Journalier" || result.frequence === "Apport volontaire";

                                            // Cas des fréquences spéciales sans jour à afficher
                                            if (isSpecialFrequency) {
                                                return (
                                                    <>
                                                        <p className="collect-frequency">{result.frequence}</p>
                                                    </>
                                                );
                                            }

                                            const jourParts = result.jour && result.jour.includes('_') ? result.jour.split('_') : null;

                                            if (jourParts && jourParts.length === 2) {
                                                const occurrenceRaw = jourParts[0];
                                                const jourLabel = jourParts[1];
                                                const occurrenceText = occurrenceRaw === 'last' ? 'Dernier' : `${occurrenceRaw}ème`;

                                                return (
                                                    <>
                                                        <p className="collect-day occurrence-badge">{occurrenceText}</p>
                                                        <p className="collect-day">{jourLabel}</p>
                                                        {result.frequence && (
                                                            <p className="collect-frequency">{result.frequence}</p>
                                                        )}
                                                    </>
                                                );
                                            }

                                            // Cas classique avec un jour simple et fréquence
                                            return (
                                                <>
                                                    {result.jour && result.jour !== "undefined" && (
                                                        <p className="collect-day">{result.jour}</p>
                                                    )}

                                                    {result.frequence && (
                                                        <p className="collect-frequency">{result.frequence}</p>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {result.categorie === 'Organiques' && (
                                        <div className="collect-attributes">
                                            <p className="textpmonth">De</p>
                                            <p className="collect-day">{formatMonth(result.startMonth)}</p>
                                            <p className="textpmonth">à</p>
                                            <p className="collect-day">{formatMonth(result.endMonth)}</p>
                                        </div>
                                    )}
                                </div>

                                <img
                                    src={icon}
                                    alt={result.categorie}
                                    className={`collect-icon ${result.categorie === 'Organiques' ? 'collect-icon-organique' : ''}`}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* Bloc affichant toujours le bouton d'ajout */}
                <div className="blockajoutecollecte">
                    <p className="gestionplante">
                        {isAddressValid()
                            ? "Vous pouvez ajouter une collecte. Cliquez sur \"Ajouter une collecte\" pour en ajouter une."
                            : "Veuillez sélectionner une adresse valide pour ajouter des collectes."}
                    </p>
                    <Button
                        type="primary"
                        shape="round"
                        className="Add-buttoncollecte"
                        onClick={handleButtonClick}  // Utiliser notre gestionnaire personnalisé
                        loading={isAddLoading}
                        style={buttonStyle} // Appliquer le style personnalisé
                    // Retirer l'attribut disabled pour permettre le clic
                    >
                        Ajouter une collecte
                    </Button>
                </div>
            </>
        );
    }, [collectes, selectedCategory, isAddLoading, isReportLoading, reportingCollectionId, selectedOption]);

    const isFormValid = selectedReportOption && reportText.trim() !== '';

    return (
        <>
            <IonRow className='padd10'>
                <IonCol>
                    <div className="category-container">
                        <div className="category-header" style={{ display: 'flex', alignItems: 'center' }}>
                            <h2 style={{ margin: 0 }}>Catégorie de déchets</h2>
                            <span className="notification-iconinfo">
                                <InfoCircleOutlined
                                    style={{ marginLeft: '1px', cursor: 'pointer', fontSize: '24px' }}
                                    onClick={() => setIsInfoModalVisible(true)}
                                />
                            </span>

                        </div>
                        <div className='allcate'>
                            {categories.map(category => (
                                <div
                                    key={category.displayName}
                                    className={`category-item ${selectedCategory === category.displayName ? 'selected' : ''} ${collectes.some(collecte => collecte.categorie === category.dbName) ? 'has-collecte' : ''}`}
                                    onClick={() => handleCategoryClick(category.displayName)}
                                >
                                    <img src={category.image} alt={category.displayName} className="category-icon" />
                                    <p>{category.displayName}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </IonCol>
            </IonRow>

            <div className="collect-results">
                {renderCollectes()}
            </div>

            <Modal
                title={
                    <>
                        {selectedCollecte && user && selectedCollecte.authkeytelcollecte === fullUserInfo.user.authKeytel && (
                            <div style={{ marginTop: '16px', paddingTop: '16px' }}>
                                <p style={{ fontWeight: 'bold' }}>Supprimer la collecte</p>
                                <p style={{ fontSize: '12px', color: '#888' }}>
                                    En cliquant sur ce bouton, vous supprimerez définitivement cette collecte.
                                </p>
                                <Button danger onClick={handleDeleteCollecte} style={{ marginTop: '16px' }}>
                                    Supprimer la collecte
                                </Button>
                                <Divider />
                            </div>
                        )}
                        <div>Signalement</div>
                    </>
                }
                open={isReportModalVisible}
                onOk={handleReportSubmit}
                onCancel={handleReportModalCancel}
                cancelText="Annuler"
                okText="Valider"
                okButtonProps={{ disabled: isLoading || !isFormValid }}
                className="modalsignalement"
            >
                {isLoading ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100px',
                        }}
                    >
                        <Spin tip="Chargement en cours..." size="large" />
                    </div>
                ) : (
                    <>
                        {selectedCollecte && selectedCollecte.report ? (
                            <p className="texteareainfo">
                                Une signalisation a déjà été effectuée pour cette collecte. Nous nous engageons à régulariser cette collecte dans les plus brefs délais.
                            </p>
                        ) : (
                            <>
                                <p className="texteinfosignalement">
                                    Merci de bien vouloir décrire les raisons du signalement de cette collecte.
                                </p>
                                <Select
                                    style={{ width: '100%', marginBottom: '1.5rem' }}
                                    placeholder="Sélectionnez une option"
                                    value={selectedReportOption}
                                    onChange={(value) => setSelectedReportOption(value)}
                                >
                                    <Select.Option value="report">Signaler cette collecte</Select.Option>
                                    <Select.Option value="edit">Modifier les informations de cette collecte</Select.Option>
                                    <Select.Option value="change-frequency">Changer la fréquence de cette collecte</Select.Option>
                                    <Select.Option value="request-support">Demander de l'assistance pour cette collecte</Select.Option>
                                </Select>
                                <textarea
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid #BFD5CB',
                                    }}
                                    rows={4}
                                    placeholder="Décrivez le problème ici..."
                                    value={reportText}
                                    onChange={(e) => setReportText(e.target.value)}
                                />
                            </>
                        )}
                    </>
                )}
            </Modal>

            {/* Modal de succès pour le signalement */}
            <SuccessModal
                visible={isSuccessModalVisible}
                onClose={() => setIsSuccessModalVisible(false)}
                title={successTitle}
                message={successMessage}
                buttonText="Continuer"
            />

            {/* Modal de succès pour la suppression */}
            <SuccessModal
                visible={isDeleteSuccessModalVisible}
                onClose={() => setIsDeleteSuccessModalVisible(false)}
                title="Suppression"
                message="La collecte a été supprimée avec succès."
                buttonText="Continuer"
            />

            <ErrorModal
                visible={isErrorModalVisible}
                onClose={() => setIsErrorModalVisible(false)}
                title="Erreur de Géolocalisation"
                message="Vous devez être géolocalisé à l'adresse sélectionnée pour signaler cette collecte."
                buttonText="Continuer"
                isLoading={isLoading}
            />

            <AddCollecteModal
                visible={isAddCollectModalVisible}
                onCancel={() => setIsAddCollectModalVisible(false)}
                onOk={async () => {
                    setIsAddCollectModalVisible(false);
                    await fetchCollectes();
                }}
                collectesExistantes={collectes}
                selectedOption={selectedOption}
                authkeytel={authkeytel}
                isLoading={isLoading}
            />

            <BlacklistErrorModal
                visible={isBlacklistErrorModalVisible}
                onClose={() => setIsBlacklistErrorModalVisible(false)}
                title="Accès Refusé"
                message="Vous ne pouvez pas ajouter de collecte car vous avez été blacklisté. Contactez le support pour plus d'informations."
                buttonText="Continuer"
            />

            {/* Modal d'information pour l'icône Info */}
            <Modal
                title="Fonctionnement de l'Application"
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
                        Important : Vous devez enregistrer votre adresse au moyen de la géolocalisation <strong style={{ fontWeight: 'bold', color: '#77a682' }}>en vous positionnant au portail de votre habitation</strong>. Si vous avez refusé la géolocalisation, vous devez saisir votre adresse dans la barre de recherche. L'application vous proposera automatiquement différents types de collectes disponibles dans votre zone. Si ce n'est pas le cas, <strong style={{ fontWeight: 'bold', color: '#77a682' }}>merci de les ajouter, ce qui profitera à tous les habitants de votre rue</strong>.
                    </p>

                    <Divider />

                    <p>
                        <strong style={{ fontWeight: 'bold', color: '#77a682' }}>Indicateurs de chargement</strong>
                    </p>
                    <p>
                        Patience, en cas de ralentissement, un indicateur de chargement apparaîtra pendant que les données sont intégrées par l'application.
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
        </>
    );
};

export default DisplaySearch;