// Représente les détails d'une adresse, utilisés pour stocker les informations
// d'un emplacement spécifique sélectionné par l'utilisateur.
// types.ts
export interface AddressDetails {
    codeInsee: string;
    codeRivoli: string;
    city: string;
    street: string;
    postalcode: string;
}

export interface UserData {
    idgoogle: string;
    email: string;
    token: string;
    authKeytel: string;
    address: AddressDetails;
    imageUrl: string;
    familyName: string;
    givenName: string;
    position: {
        latitude: number;
        longitude: number;
    };
}

export interface GoogleUser {
    idToken: string;
    id: string;
    email: string;
    name: string;
    imageUrl: string;
    authentication: {
        accessToken: string;
        idToken: string;
    };
}

// Définit les propriétés d'une adresse retournée par l'API d'adresses.
// Contient des informations spécifiques à un lieu géographique.
export interface AddressProperties {
    name: any;
    label: string;
    id: string;
    postcode: string;
    citycode: string;
    city: string;
    type: string;
    street?: string;
}

// Représente une caractéristique géographique d'une adresse avec sa géométrie
// et ses propriétés détaillées.
export interface AddressFeature {
    type: string;
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    properties: AddressProperties;
}

// Structure de réponse de l'API d'adresses, contenant une liste de caractéristiques d'adresses.
export interface AddressResponse {
    type: string;
    features: AddressFeature[];
}

// Représente le token utilisateur et ses données d'authentification,
// utilisé pour gérer l'état de connexion de l'utilisateur.
export interface UserToken {
    token: boolean;
    data: {
        email: string;
    };
    user: {
        _id: string;
        idgoogle: string;
        email: string;
        codeInsee: string;
        codeRivoli: string;
        city: string;
        street: string;
        postalcode: string;
    };
}

// Propriétés du composant AddCollecteModal, utilisé pour ajouter une collecte.
// Inclut les propriétés pour contrôler l'affichage et gérer les sélections.
export interface AddCollecteModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: () => void;
    selectedOption: {
        codeInsee: string;
        codeRivoli?: string;
    };
    authkeytel: string;
    isLoading: boolean;
}

// Représente les valeurs d'une collecte, envoyées à l'API pour l'ajout d'une collecte.
// Inclut les détails de la collecte comme la catégorie, la fréquence, et les dates.
export interface CollectResult {
    authkeytelcollecte: string;
    report: string;
    startMonth: string;
    endMonth: string;
    id: string;
    dayformensuel: string;
    categorie: string;
    frequence: string;
    jour?: string;
    startmonth?: string;
    endmonth?: string;
    jourmensuel?: number;
    type: string;
    code_insee: string;
    code_rivoli?: string;
}


export interface FullUserData {
    notificationsEnabled: undefined;
    user: {
        photoURL: string;
        displayName: string;
        fcmToken: string;
        idgoogle: string;
        email: string;
        authKeytel: string;
        token: string;
        codeInsee: string;
        codeRivoli: string;
        city: string;
        street: string;
        postalcode: string;
        notificationsEnabled: boolean;
        isBlocked: boolean;
        createdAt: string;
        updatedAt: string;
        _id: string;
        __v: number;
    };
}

export interface DisplaySearchProps {
    selectedOption: AddressDetails;
    fullUserInfo: FullUserData;
}

export interface NotificationManagerProps {
    userId: string | null;
}

export interface NotificationDataPayload {
    user?: string;
    pubs?: string;
    collections?: string;
    notificationType?: string;
    company?: string;
    isHoliday?: boolean;
    _timestamp?: Date;
}

export interface NotificationData {
    pubs: {
        id: number;
        pub_image: string;
        pub_link: string | null;
    } | null;
    collections: Array<{
        id: number;
        categorie: string;
        insee: string;
        rivoli: string;
        jour: string;
        dayformensuel?: string;
        frequence: string;
        startMonth?: string;
        endMonth?: string;
    }>;
    notificationType?: string;
    company: {
        id: number;
        company_name: string;
    } | null;
    isHoliday?: boolean;
}

export interface RawCollection {
    id: number;
    categorie: string;
    insee: string;
    rivoli: string;
    jour: string;
    frequence: string;
    startMonth?: string;
    endMonth?: string;
    dayformensuel?: string;
}


import { PluginListenerHandle } from '@capacitor/core';
import '@capacitor/push-notifications';

declare module '@capacitor/push-notifications' {
    interface PushNotificationsPlugin {
        addListener(
            eventName: 'registrationError',
            listenerFunc: (error: RegistrationError) => void
        ): Promise<PluginListenerHandle>;
    }

    // Interface pour les erreurs d'enregistrement
    interface RegistrationError {
        message?: string;
        code?: string;
        [key: string]: unknown;
    }
}

export interface NotificationPayload {
    data?: Record<string, unknown>;
    id?: string;
    title?: string;
    body?: string;
    badge?: number;
    sound?: string;
    [key: string]: unknown;
}

export type LogData = Record<string, unknown> | string | number | boolean | null;