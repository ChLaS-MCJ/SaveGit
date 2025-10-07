import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from 'antd';
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';
import AuthService from '../../Services/Auth.services';
import PubService from '../../Services/Pub.service';
import UserService from '../../Services/User.service';
import { NotificationData, NotificationDataPayload, RawCollection } from '../../Modules/types';

// Import des images
import Pbdechet from '../../Assets/Images/poubelle.png';
import Pbverre from '../../Assets/Images/bouteille.png';
import Pbrecycler from '../../Assets/Images/recycler.png';
import Pbplante from '../../Assets/Images/feuille.png';
import Pbpuanteur from '../../Assets/Images/puanteur.png';
import DefaultPubImage from '../../Assets/Images/default-pub.png';

const categories = [
    { displayName: 'Collectes', dbName: 'Collectes', image: Pbdechet },
    { displayName: 'Ménagers', dbName: 'Ménagers', image: Pbpuanteur },
    { displayName: 'Organique', dbName: 'Organiques', image: Pbplante },
    { displayName: 'Recyclés', dbName: 'Recyclés', image: Pbrecycler },
    { displayName: 'Verres', dbName: 'Verres', image: Pbverre },
];

interface User {
    notificationsEnabled: boolean;
    idgoogle?: string;
    email?: string;
}

type TimeSlot = {
    id: string;
    hour: number;
    type: string;
    duration: number;
};

// 🔥 ENUM pour l'état des modales - plus fiable qu'un boolean
enum ModalState {
    NONE = 'none',
    PUB_SHOWING = 'pub_showing',
    COLLECT_SHOWING = 'collect_showing',
    COMPLETED = 'completed'
}

const getTimeSlots = (user: User): TimeSlot[] => {
    const baseSlots = [
        { id: 'matin', hour: 7, type: 'sortir', duration: 715 },
        { id: 'soir', hour: 19, type: 'sortir', duration: 55 },
    ];

    if (user.notificationsEnabled) {
        baseSlots.push({ id: 'rentrer', hour: 20, type: 'rentrer', duration: 235 });
    }

    return baseSlots;
};

const STORAGE_KEYS = {
    PREFIX: 'notification_slot_',
    EMPTY_RESULT: 'empty_result_slot_',
    LAST_CLEANUP_DATE: 'last_cleanup_date',
    CURRENT_SLOT: 'current_active_slot' // 🔥 NOUVEAU: Pour tracker le créneau actuel
};

const NotificationHandler: React.FC = () => {
    const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
    const [showPubModal, setShowPubModal] = useState<boolean>(false);
    const [showCollectModal, setShowCollectModal] = useState<boolean>(false);
    const [pubViewIncremented, setPubViewIncremented] = useState<boolean>(false);
    const [pubImageError, setPubImageError] = useState<boolean>(false);
    const [userData, setUserData] = useState<User | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    // 🔥 ÉTAT SIMPLE pour contrôler les modales
    const [modalState, setModalState] = useState<ModalState>(ModalState.NONE);

    const appStateListener = useRef<PluginListenerHandle | null>(null);
    const isCheckingNotification = useRef<boolean>(false);
    const isInitialized = useRef<boolean>(false);

    const loadUserData = useCallback(async (): Promise<User | null> => {
        try {
            const stored = localStorage.getItem("userData");
            if (!stored) {
                const defaultUser: User = { notificationsEnabled: true };
                setUserData(defaultUser);
                return defaultUser;
            }

            const userData = JSON.parse(stored);

            if (userData.idgoogle || userData.email) {
                if (userData.notificationsEnabled !== undefined) {
                    const userObj: User = {
                        notificationsEnabled: userData.notificationsEnabled,
                        idgoogle: userData.idgoogle,
                        email: userData.email
                    };

                    setUserData(userObj);
                    return userObj;
                }

                if (userData.idgoogle) {
                    try {
                        const fullUserInfo = await UserService.fetchFullUserInfo(userData.idgoogle);
                        if (fullUserInfo) {
                            const updatedUserData = {
                                ...userData,
                                notificationsEnabled: fullUserInfo.notificationsEnabled ?? true
                            };
                            localStorage.setItem("userData", JSON.stringify(updatedUserData));

                            const userObj: User = {
                                notificationsEnabled: updatedUserData.notificationsEnabled,
                                idgoogle: userData.idgoogle,
                                email: userData.email
                            };

                            setUserData(userObj);
                            return userObj;
                        }
                    } catch (apiError) {
                        // Fallback en cas d'erreur API
                    }
                }
            }
        } catch (error) {
            // Ignore les erreurs
        }

        const defaultUser: User = { notificationsEnabled: true };
        setUserData(defaultUser);
        return defaultUser;
    }, []);

    const getCurrentTimeSlot = useCallback((slotsToUse?: TimeSlot[]): TimeSlot | null => {
        const slots = slotsToUse || timeSlots;
        if (slots.length === 0) return null;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        for (const slot of slots) {
            const slotStart = slot.hour * 60;
            const slotEnd = slotStart + slot.duration;
            const currentTime = currentHour * 60 + currentMinutes;

            if (currentTime >= slotStart && currentTime < slotEnd) {
                return slot;
            }
        }

        return null;
    }, [timeSlots]);

    const cleanOldData = useCallback(() => {
        const today = new Date().toDateString();
        const lastCleanup = localStorage.getItem(STORAGE_KEYS.LAST_CLEANUP_DATE);

        // 🔥 Nettoyage quotidien normal
        if (lastCleanup !== today) {
            timeSlots.forEach(slot => {
                localStorage.removeItem(STORAGE_KEYS.PREFIX + slot.id);
                localStorage.removeItem(STORAGE_KEYS.EMPTY_RESULT + slot.id);
            });
            localStorage.setItem(STORAGE_KEYS.LAST_CLEANUP_DATE, today);
            // 🔥 CORRECTION: Ne pas faire return ici, continuer le nettoyage des créneaux expirés
        }

        // 🔥 Nettoyage des créneaux expirés (s'exécute toujours maintenant)
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinutes;

        timeSlots.forEach(slot => {
            const slotStart = slot.hour * 60;
            const slotEnd = slotStart + slot.duration;

            // 🔥 Si on est APRÈS la fin du créneau, nettoyer ses données
            if (currentTime >= slotEnd) {
                localStorage.removeItem(STORAGE_KEYS.PREFIX + slot.id);
                localStorage.removeItem(STORAGE_KEYS.EMPTY_RESULT + slot.id);
            }
        });
    }, [timeSlots]);

    const getStoredDataForSlot = (slotId: string): NotificationData | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.PREFIX + slotId);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            // Ignore silencieusement les erreurs
        }
        return null;
    };

    const hasEmptyResultForSlot = (slotId: string): boolean => {
        return localStorage.getItem(STORAGE_KEYS.EMPTY_RESULT + slotId) === 'true';
    };

    const fetchFromAPI = async (type: string): Promise<NotificationDataPayload | null> => {
        try {
            const userData = JSON.parse(localStorage.getItem("userData") || '{}');

            if (!userData.idgoogle) {
                return null;
            }

            const token = await AuthService.getToken();
            if (!token) {
                return null;
            }

            const response = await axios.get(
                `https://mcjdevsubb.fr/api/notification/check-collections/${userData.idgoogle}?type=${type}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000
                }
            );

            if (response.data?.success && response.data?.notificationData) {
                return response.data.notificationData;
            }

            return null;

        } catch (error) {
            return null;
        }
    };

    const processAndStoreData = async (data: NotificationDataPayload, slotId: string): Promise<NotificationData | null> => {
        try {
            let collections: RawCollection[] = [];
            let pubs: { id: number; pub_image: string; pub_link: string | null; } | null = null;
            let company: { id: number; company_name: string; } | null = null;
            let isHoliday = false;

            if (typeof data.collections === 'string') {
                collections = JSON.parse(data.collections);
            } else if (Array.isArray(data.collections)) {
                collections = data.collections as RawCollection[];
            }

            if (data.pubs) {
                if (typeof data.pubs === 'string' && data.pubs !== 'null') {
                    pubs = JSON.parse(data.pubs);
                } else if (typeof data.pubs === 'object') {
                    pubs = data.pubs as { id: number; pub_image: string; pub_link: string | null; };
                }
            }

            if (data.company) {
                if (typeof data.company === 'string' && data.company !== 'null') {
                    company = JSON.parse(data.company);
                } else if (typeof data.company === 'object') {
                    company = data.company as { id: number; company_name: string; };
                }
            }

            if (typeof data.isHoliday === 'string') {
                isHoliday = data.isHoliday === 'true';
            } else if (typeof data.isHoliday === 'boolean') {
                isHoliday = data.isHoliday;
            }

            if (!collections || collections.length === 0) {
                localStorage.setItem(STORAGE_KEYS.EMPTY_RESULT + slotId, 'true');
                return null;
            }

            const notifData: NotificationData = {
                collections,
                pubs,
                company,
                notificationType: data.notificationType || 'sortir',
                isHoliday
            };

            localStorage.setItem(STORAGE_KEYS.PREFIX + slotId, JSON.stringify(notifData));

            return notifData;

        } catch (error) {
            return null;
        }
    };

    // 🔥 FONCTION PROPRE: Utilise l'état React pour contrôler
    const showModals = (data: NotificationData) => {
        // 🔥 UN SEUL POINT DE CONTRÔLE
        if (modalState !== ModalState.NONE) {
            return;
        }

        setNotificationData(data);

        if (data.pubs && Object.keys(data.pubs).length > 0) {
            setModalState(ModalState.PUB_SHOWING);
            setShowPubModal(true);
            setPubViewIncremented(false);
        } else if (data.collections.length > 0) {
            setModalState(ModalState.COLLECT_SHOWING);
            setShowCollectModal(true);
        }
    };

    const checkAndShowNotifications = useCallback(async (_userParam?: User, timeSlotsParam?: TimeSlot[]) => {
        const currentTimeSlots = timeSlotsParam || timeSlots;

        if (isCheckingNotification.current) {
            return;
        }

        isCheckingNotification.current = true;

        try {
            // 🔥 TOUJOURS nettoyer les données expirées en premier
            cleanOldData();

            const currentSlot = getCurrentTimeSlot(currentTimeSlots);
            if (!currentSlot) {
                return;
            }

            // 🔥 NOUVEAU: Vérifier si on change de créneau
            const lastActiveSlot = localStorage.getItem(STORAGE_KEYS.CURRENT_SLOT);
            const isNewSlot = lastActiveSlot !== currentSlot.id;

            // 🔥 SEULEMENT si on change de créneau, nettoyer les autres
            if (isNewSlot) {
                currentTimeSlots.forEach(slot => {
                    if (slot.id !== currentSlot.id) {
                        localStorage.removeItem(STORAGE_KEYS.PREFIX + slot.id);
                        localStorage.removeItem(STORAGE_KEYS.EMPTY_RESULT + slot.id);
                    }
                });

                // 🔥 SPÉCIAL: Pour le créneau "matin", nettoyer seulement si nouveau
                if (currentSlot.id === 'matin' && isNewSlot) {
                    localStorage.removeItem(STORAGE_KEYS.PREFIX + currentSlot.id);
                    localStorage.removeItem(STORAGE_KEYS.EMPTY_RESULT + currentSlot.id);
                }

                // 🔥 Marquer le nouveau créneau comme actuel
                localStorage.setItem(STORAGE_KEYS.CURRENT_SLOT, currentSlot.id);
            }

            let data = getStoredDataForSlot(currentSlot.id);

            if (data) {
                showModals(data);
                return;
            }

            if (hasEmptyResultForSlot(currentSlot.id)) {
                return;
            }

            const apiData = await fetchFromAPI(currentSlot.type);
            if (apiData) {
                data = await processAndStoreData(apiData, currentSlot.id);
                if (data) {
                    showModals(data);
                }
            }

        } finally {
            isCheckingNotification.current = false;
        }
    }, [timeSlots, cleanOldData, getCurrentTimeSlot, modalState]);

    // 🔥 SOLUTION: UN SEUL LISTENER au lieu de 3
    const handleAppFocus = useCallback(() => {
        if (!isInitialized.current) {
            return;
        }

        // 🔥 NOUVEAU: Ne reset que si aucune modal n'est ouverte
        if (modalState === ModalState.NONE) {
            setShowPubModal(false);
            setShowCollectModal(false);
            setNotificationData(null);
            setPubViewIncremented(false);
        }

        // 🔥 CORRECTION: Ne pas forcer le reset du modalState ici
        // Il sera géré par showModals() qui vérifie déjà l'état

        const stored = localStorage.getItem("userData");
        if (stored) {
            try {
                const userData = JSON.parse(stored);
                if (userData.idgoogle || userData.email) {
                    const userObj = {
                        notificationsEnabled: userData.notificationsEnabled ?? true,
                        idgoogle: userData.idgoogle,
                        email: userData.email
                    };

                    const slots = getTimeSlots(userObj);
                    checkAndShowNotifications(userObj, slots);
                }
            } catch (error) {
                // Ignore les erreurs
            }
        }
    }, [checkAndShowNotifications, modalState]);

    // 🔥 SETUP SIMPLIFIÉ: Un seul listener prioritaire
    const setupAppStateListeners = useCallback(() => {
        if (Capacitor.isNativePlatform()) {
            // 🔥 PRIORITÉ 1: App state (mobile)
            App.addListener('appStateChange', ({ isActive }) => {
                if (isActive) {
                    handleAppFocus();
                }
            }).then((listener) => {
                appStateListener.current = listener;
            });
        } else {
            // 🔥 PRIORITÉ 2: Visibility (web) - seulement si pas mobile
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    handleAppFocus();
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [handleAppFocus]);

    useEffect(() => {
        const initializeData = async () => {
            if (isInitialized.current) return;

            try {
                const user = await loadUserData();
                if (!user) {
                    isInitialized.current = true;
                    return;
                }

                const slots = getTimeSlots(user);
                setTimeSlots(slots);

                const cleanupListeners = setupAppStateListeners();

                setTimeout(async () => {
                    await checkAndShowNotifications(user, slots);
                    isInitialized.current = true;
                }, 300);

                return cleanupListeners;

            } catch (error) {
                isInitialized.current = true;
            }
        };

        let cleanupListeners: (() => void) | undefined;

        initializeData().then((cleanup) => {
            cleanupListeners = cleanup;
        });

        return () => {
            if (appStateListener.current) {
                appStateListener.current.remove();
            }
            if (cleanupListeners) {
                cleanupListeners();
            }
        };
    }, [loadUserData, setupAppStateListeners, checkAndShowNotifications]);

    useEffect(() => {
        if (userData) {
            const slots = getTimeSlots(userData);
            setTimeSlots(slots);

            // 🔥 NOUVEAU: Nettoyer le créneau 'rentrer' si notifications désactivées
            if (!userData.notificationsEnabled) {
                localStorage.removeItem(STORAGE_KEYS.PREFIX + 'rentrer');
                localStorage.removeItem(STORAGE_KEYS.EMPTY_RESULT + 'rentrer');

                // 🔥 Si on était dans le créneau 'rentrer', reset le slot actuel
                const currentActiveSlot = localStorage.getItem(STORAGE_KEYS.CURRENT_SLOT);
                if (currentActiveSlot === 'rentrer') {
                    localStorage.removeItem(STORAGE_KEYS.CURRENT_SLOT);
                }
            }
        }
    }, [userData]);

    useEffect(() => {
        if (showPubModal && notificationData?.pubs && !pubViewIncremented) {
            const incrementView = async () => {
                try {
                    const pubId = notificationData.pubs!.id;
                    const codeInsee = notificationData.collections?.[0]?.insee || '';

                    await PubService.incrementViewCount(pubId, codeInsee);
                    setPubViewIncremented(true);
                } catch (error) {
                    // Ignore silencieusement les erreurs
                }
            };

            incrementView();
        }
    }, [showPubModal, notificationData, pubViewIncremented]);

    const handlePubClick = async () => {
        if (!notificationData?.pubs?.id) return;

        try {
            const pubId = notificationData.pubs.id;
            const codeInsee = notificationData.collections?.[0]?.insee || '';

            await PubService.incrementClickCount(pubId, codeInsee);
        } catch (error) {
            // Ignore silencieusement les erreurs
        }
    };

    // 🔥 GESTION PROPRE: Transition d'état
    const closePubModal = useCallback(() => {
        setShowPubModal(false);

        if (notificationData?.collections && notificationData.collections.length > 0) {
            // 🔥 Transition vers modal collecte
            setModalState(ModalState.COLLECT_SHOWING);
            setTimeout(() => {
                setShowCollectModal(true);
            }, 50);
        } else {
            // 🔥 Fin du cycle
            setModalState(ModalState.COMPLETED);
            setNotificationData(null);
            // Reset après délai pour permettre nouveaux cycles
            setTimeout(() => {
                setModalState(ModalState.NONE);
            }, 1000);
        }
    }, [notificationData]);

    const closeCollectModal = useCallback(() => {
        setShowCollectModal(false);
        setNotificationData(null);
        setModalState(ModalState.COMPLETED);

        // Reset après délai pour permettre nouveaux cycles
        setTimeout(() => {
            setModalState(ModalState.NONE);
        }, 1000);
    }, []);

    const renderPubModal = () => {
        if (!notificationData?.pubs) return null;

        return (
            <div style={{ textAlign: 'center' }}>
                <a
                    onClick={handlePubClick}
                    href={notificationData.pubs.pub_link || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        src={pubImageError ? DefaultPubImage : notificationData.pubs.pub_image}
                        alt="Publicité"
                        style={{ maxWidth: '100%', cursor: 'pointer', marginBottom: '20px' }}
                        onError={() => setPubImageError(true)}
                    />
                </a>
                <p>* Cliquez sur l'image pour visiter le site.</p>
                <p>* Fermez pour voir vos collectes.</p>
            </div>
        );
    };

    const formatMonth = (dateString: string) => {
        if (!dateString) return "";
        const months = [
            "janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre"
        ];
        try {
            const [, month] = dateString.split("-");
            const monthIndex = parseInt(month, 10) - 1;
            return months[monthIndex] || "";
        } catch {
            return "";
        }
    };

    const renderCollectModal = () => {
        if (!notificationData?.collections || notificationData.collections.length === 0) {
            return <p>Aucune collecte à afficher.</p>;
        }

        return (
            <div>
                {notificationData.collections.map((collecte) => {
                    if (!collecte?.id) return null;

                    const category = categories.find(c => c.dbName === collecte.categorie);
                    let occurrenceText = null;
                    let jourLabel = null;

                    const isSpecial = ["journalier", "Journalier", "Apport volontaire"].includes(collecte.frequence);

                    if (!isSpecial && collecte.jour?.includes('_')) {
                        const [occurrence, day] = collecte.jour.split('_');
                        jourLabel = day;
                        occurrenceText = occurrence === 'last' ? 'Dernier' : `${occurrence}ème`;
                    }

                    return (
                        <div key={collecte.id} className="collect-itemModal">
                            <div className="collect-infoModal">
                                <div className="collect-headerModal">
                                    <p className="collect-categoryModal">
                                        {category?.displayName || 'Inconnu'}
                                    </p>
                                </div>

                                <div className="collect-details">
                                    <div className="collect-attributesModal">
                                        {isSpecial ? (
                                            <p className="collect-frequencyModal">{collecte.frequence}</p>
                                        ) : (
                                            <>
                                                {occurrenceText && (
                                                    <p className="collect-occurrenceModal">{occurrenceText}</p>
                                                )}
                                                {jourLabel && (
                                                    <p className="collect-dayModal">{jourLabel}</p>
                                                )}
                                                {collecte.frequence && (
                                                    <p className="collect-frequencyModal">{collecte.frequence}</p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {collecte.categorie === 'Organiques' && (
                                        <div className="collect-attributesModal">
                                            <p className="textpmonthModal">De</p>
                                            <p className="collect-dayModal">{formatMonth(collecte.startMonth || '')}</p>
                                            <p className="textpmonthModal">à</p>
                                            <p className="collect-dayModal">{formatMonth(collecte.endMonth || '')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <img
                                src={category?.image || ''}
                                alt={collecte.categorie}
                                className={`collect-icon ${collecte.categorie === 'Organiques' ? 'collect-icon-organique' : ''}`}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <Modal
                className="custom-collect-modal-notif"
                style={{ zIndex: 1050 }}
                open={showPubModal && !!notificationData}
                onCancel={closePubModal}
                footer={null}
                centered
                title={notificationData?.notificationType === 'sortir' ? 'Sors ta poubelle !' : 'Rentre ta poubelle !'}
                destroyOnClose={true}
                maskClosable={true}
                closable={true}
                forceRender={false}
            >
                {renderPubModal()}
            </Modal>

            <Modal
                className="custom-collect-modal-notif"
                style={{ zIndex: 1060 }}
                open={showCollectModal && !!notificationData && !showPubModal}
                onCancel={closeCollectModal}
                footer={null}
                centered
                title="À vos poubelles !"
                destroyOnClose={true}
                maskClosable={true}
                closable={true}
                forceRender={false}
            >
                {renderCollectModal()}
            </Modal>
        </>
    );
};

export default NotificationHandler;