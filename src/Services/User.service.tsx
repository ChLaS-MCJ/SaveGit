import Axios from './Caller.service';
import { AddressDetails, FullUserData, UserData } from '../Modules/types';

interface NotificationUpdateResponse {
    message: string;
    user: {
        notificationsEnabled: boolean;
    };
}

interface UserIdData {
    id: string;
}

interface ApiResponse {
    user?: UserData;
    message: string;
}

const sendUserDataToAPI = async (data: UserData): Promise<ApiResponse> => {
    try {
        const response = await Axios.post<ApiResponse>(`/mango/users/save-user`, data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'envoi des données à l\'API', error);
        throw error;
    }
};

const fetchFullUserInfo = async (userId: string): Promise<FullUserData | null> => {
    try {
        const data: UserIdData = { id: userId };
        // On appelle l'endpoint POST /api/mango/users/info
        const response = await Axios.post<FullUserData>(`/mango/users/info`, data, {});
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur complètes:', error);
        return null;
    }
};

const updateNotificationSettings = async (userId: string, notificationsEnabled: boolean): Promise<NotificationUpdateResponse> => {
    try {
        const response = await Axios.patch<NotificationUpdateResponse>(`/mango/users/${userId}/notifications`, { notificationsEnabled });
        return response.data;
    } catch (error) {
        console.error('Error updating notification settings:', error);
        throw error;
    }
};

const updateUserLocation = async (objectStockUserGeoLoc: AddressDetails, userId: string) => {
    try {
        const response = await Axios.patch(`/mango/users/${userId}/updateUserLocation`, objectStockUserGeoLoc);
        return response.data;
    } catch (error) {
        console.error('Error updating user location:', error);
        throw error;
    }
};


const deleteUserData = async (userId: string) => {
    try {
        const response = await Axios.delete(`/mango/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error updating user location:', error);
        throw error;
    }
};


export const UserService = {
    sendUserDataToAPI,
    updateNotificationSettings,
    updateUserLocation,
    fetchFullUserInfo,
    deleteUserData,
};

export default UserService;
