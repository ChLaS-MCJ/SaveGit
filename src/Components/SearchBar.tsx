import React, { useState, useEffect, useRef } from 'react';
import { Select, Modal, Spin, message, Button } from 'antd';
import axios from 'axios';
import { Geolocation } from '@capacitor/geolocation';
import { AddressDetails, AddressFeature, AddressResponse } from '../Modules/types';
import { EnvironmentOutlined } from '@ant-design/icons';

const { Option } = Select;

// Styles inline pour éviter de modifier le CSS global
const selectStyles = {
    selectContainer: {
        flex: 1,
        position: 'relative' as const
    },
    select: {
        width: '100%',
        fontSize: '16px'
    },
    selectItem: {
        maxWidth: '100%',
        whiteSpace: 'normal' as const,
        lineHeight: 1.4,
        overflow: 'visible' as const,
        textOverflow: 'clip' as const
    },
    option: {
        whiteSpace: 'normal' as const,
        wordWrap: 'break-word' as const,
        padding: '8px 12px',
        lineHeight: 1.4
    },
    button: {
        height: '36px',
        width: '36px',
        backgroundColor: '#77a682',
        borderColor: '#77a682',
        color: 'white',
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        borderRadius: '6px',
        marginLeft: '10px',
        padding: 0,
        fontSize: '16px'
    }
};

interface SearchBarProps {
    handleSelect: (address: AddressDetails, saveAddress: boolean) => void;
    defaultAddress?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ handleSelect, defaultAddress = '' }) => {
    const [searchQuery, setSearchQuery] = useState<string>(defaultAddress);
    const [searchResults, setSearchResults] = useState<AddressFeature[]>([]);
    const [isSaveModalVisible, setIsSaveModalVisible] = useState<boolean>(false);
    const [isGeolocationLoading, setIsGeolocationLoading] = useState<boolean>(false);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [selectedAddressDetails, setSelectedAddressDetails] = useState<AddressDetails | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectRef = useRef<any>(null);

    useEffect(() => {
        if (defaultAddress) {
            setSearchQuery(defaultAddress);
        }
    }, [defaultAddress]);

    // Ajoutez ce style pour personnaliser le spinner
    useEffect(() => {
        // Créer un élément style
        const styleElement = document.createElement('style');
        styleElement.innerHTML = `
            /* Styles ciblant uniquement notre instance Select */
            .custom-address-select .ant-select-selection-item,
            .custom-address-select .ant-select-selection-placeholder {
                max-width: 100% !important;
                overflow: visible !important;
                white-space: normal !important;
                text-overflow: clip !important;
                line-height: 1.4 !important;
            }
            
            .custom-address-select .ant-select-selection-search {
                width: 100% !important;
                padding-right: 0 !important;
            }

            /* Style pour le spinner blanc */
            .white-spinner .ant-spin-dot-item {
                background-color: #ffffff !important;
            }
        `;

        // Ajouter l'élément au head
        document.head.appendChild(styleElement);

        // Nettoyer lors du démontage du composant
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        const prefixes = ["bis", "ter", "quater", "a", "b", "c", "d"];

        let cleanedQuery = query.replace(/^\d+\s*/, "");
        const words = cleanedQuery.split(" ");
        if (words.length > 1 && prefixes.includes(words[0].toLowerCase())) {
            words.shift();
        }
        cleanedQuery = words.join(" ");
        try {
            const response = await axios.get<AddressResponse>(`https://api-adresse.data.gouv.fr/search/?q=${cleanedQuery}`);
            setSearchResults(response.data.features);
        } catch (error) {
            console.error('Erreur lors de la récupération des résultats de recherche:', error);
        }
    };

    const handleSelectChange = (value: string) => {
        const selectedResult = searchResults.find((result) => result.properties.label === value);

        if (selectedResult) {
            const { city, postcode, name, id } = selectedResult.properties;
            const [codeInsee, codeRivoli] = id.split('_');

            setSearchQuery(`${name}, ${postcode} ${city}`);
            setSelectedAddress(`${name}, ${postcode} ${city}`);

            const addressDetails: AddressDetails = {
                codeInsee,
                codeRivoli: codeRivoli || '',
                city: city || '',
                street: name || '',
                postalcode: postcode || '',
            };

            setSelectedAddressDetails(addressDetails);

            // Afficher la modale de sauvegarde
            setIsSaveModalVisible(true);
        }
    };

    // Gestion de la sauvegarde d'adresse
    const handleSaveAddressOk = () => {
        if (selectedAddressDetails) {
            // D'abord fermer notre modale
            setIsSaveModalVisible(false);

            // Appeler le callback parent
            setTimeout(() => {
                handleSelect(selectedAddressDetails, true);
            }, 100);
        }
    };

    const handleSaveAddressCancel = () => {
        if (selectedAddressDetails) {
            // D'abord fermer notre modale
            setIsSaveModalVisible(false);

            // Appeler le callback parent
            handleSelect(selectedAddressDetails, false);
        }
    };

    // Gestionnaire pour le bouton de géolocalisation
    const handleGeolocationClick = async (e: React.MouseEvent) => {
        // Empêcher la propagation de l'événement
        e.stopPropagation();
        e.preventDefault();
        await getUserLocation();
    };

    const getUserLocation = async () => {
        setIsGeolocationLoading(true);
        try {
            const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
            const { latitude, longitude } = position.coords;

            // Utiliser les coordonnées pour obtenir l'adresse
            await getAddressFromCoordinates(latitude, longitude);
        } catch (error) {
            console.error('Erreur lors de la géolocalisation:', error);
            message.error('Impossible d\'obtenir votre position. Veuillez vérifier vos paramètres de localisation.');
            setIsGeolocationLoading(false);
        }
    };

    const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
        try {
            const response = await axios.get<AddressResponse>(`https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`);

            if (response.data.features && response.data.features.length > 0) {
                const feature = response.data.features[0];
                const { city, postcode, name, id } = feature.properties;
                const [codeInsee, codeRivoli] = id.split('_');

                const formattedAddress = `${name}, ${postcode} ${city}`;
                setSearchQuery(formattedAddress);

                const addressDetails: AddressDetails = {
                    codeInsee,
                    codeRivoli: codeRivoli || '',
                    city: city || '',
                    street: name || '',
                    postalcode: postcode || '',
                };

                // Stocker les détails de l'adresse
                setSelectedAddress(formattedAddress);
                setSelectedAddressDetails(addressDetails);

                // Terminer le chargement
                setIsGeolocationLoading(false);

                // Afficher la modale de sauvegarde
                setIsSaveModalVisible(true);
            } else {
                message.warning('Aucune adresse trouvée à votre position.');
                setIsGeolocationLoading(false);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche d\'adresse:', error);
            message.error('Impossible de déterminer votre adresse. Veuillez la saisir manuellement.');
            setIsGeolocationLoading(false);
        }
    };

    return (
        <div className="search-bar-container padd10" style={{ width: '100%' }}>
            {/* Conteneur principal avec la barre de recherche */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%'
            }}>
                {/* Conteneur de la barre de recherche incluant le bouton */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flex: 1,
                    borderRadius: '8px',
                    background: 'white',
                    padding: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Barre de recherche */}
                    <div style={{ ...selectStyles.selectContainer, marginRight: '8px' }}>
                        <Select
                            ref={selectRef}
                            showSearch
                            value={searchQuery || undefined}
                            placeholder={defaultAddress || "Recherchez votre adresse"}
                            style={selectStyles.select}
                            className="custom-address-select"
                            onSearch={handleSearch}
                            onSelect={handleSelectChange}
                            filterOption={false}
                            notFoundContent="Aucun résultat trouvé"
                            disabled={isGeolocationLoading}
                            bordered={false}
                            suffixIcon={null} // Supprimer l'icône de flèche
                            listItemHeight={44} // Hauteur plus grande pour les éléments du dropdown
                            listHeight={300} // Hauteur maximale du dropdown
                            dropdownAlign={{ offset: [0, 5] }}
                            getPopupContainer={(trigger) => trigger.parentNode}
                            dropdownStyle={{
                                maxWidth: '100%',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                overflow: 'hidden'
                            }}
                            optionLabelProp="value"
                            // Ce qui suit est important pour Ant Design v4
                            dropdownMatchSelectWidth={false}
                        >
                            {searchResults.map((result) => (
                                <Option
                                    key={result.properties.label}
                                    value={result.properties.label}
                                    style={selectStyles.option}
                                >
                                    {result.properties.label}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Bouton de géolocalisation à l'intérieur du même container blanc */}
                    <div style={{ position: 'relative' as const }}>
                        <Button
                            icon={<EnvironmentOutlined />}
                            onClick={handleGeolocationClick}
                            disabled={isGeolocationLoading}
                            style={{
                                ...selectStyles.button,
                                marginLeft: 0 // Supprimer la marge de gauche
                            }}
                        />
                        {isGeolocationLoading && (
                            <div style={{
                                position: 'absolute' as const,
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex' as const,
                                alignItems: 'center' as const,
                                justifyContent: 'center' as const,
                                backgroundColor: 'rgba(119, 166, 130, 0.7)',
                                borderRadius: '6px'
                            }}>
                                <Spin size="small" className="white-spinner" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal pour confirmer l'enregistrement de l'adresse */}
            <Modal
                title="Sauvegarder votre adresse"
                open={isSaveModalVisible}
                onOk={handleSaveAddressOk}
                onCancel={handleSaveAddressCancel}
                okText="Oui"
                cancelText="Non"
                className="custom-modal"
                destroyOnClose={true}
                maskClosable={false}
            >
                <p>
                    Voulez-vous enregistrer <strong>{selectedAddress}</strong> pour les futures notifications de sortie ?
                </p>
            </Modal>
        </div>
    );
};

export default SearchBar;