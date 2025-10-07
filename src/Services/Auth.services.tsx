
import Axios from './Caller.service';

const getToken = async (): Promise<string | null> => {
    try {
        // Vérifie si les données utilisateur sont stockées dans le localStorage
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            return userData.token || null; // Retourne le token stocké
        }
        console.warn('Aucun utilisateur connecté ou token introuvable.');
        return null;
    } catch (error) {
        console.error('Erreur lors de la récupération du token :', error);
        return null;
    }
};

// Déconnecter l'utilisateur
const logout = async (refreshUser: () => void): Promise<void> => {
    try {
        localStorage.removeItem('userData');
        refreshUser();
        console.log('Utilisateur déconnecté avec succès.');
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
};

const updateFCMToken = async (userId: string, fcmToken: string) => {
    try {

        const response = await Axios.post(`mango/users/update-fcm-token`, { userId, fcmToken });
        return response.data;
    } catch (error) {
        console.error('Error updating FCM token', error);
        throw error;
    }
};

export const AuthService = {
    getToken,
    logout,
    updateFCMToken,
};

export default AuthService;
