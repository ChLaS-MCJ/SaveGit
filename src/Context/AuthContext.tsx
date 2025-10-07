import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserData } from '../Modules/types';
import UserService from '../Services/User.service';

interface AuthContextProps {
    user: UserData | null;
    isAuthenticated: boolean;
    loading: boolean;
    notificationsEnabled: boolean;
    refreshUser: () => void;
    updateNotifications: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    isAuthenticated: false,
    loading: true,
    notificationsEnabled: false,
    refreshUser: () => { },
    updateNotifications: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);


    const updateNotifications = async (enabled: boolean) => {
        if (!user?.idgoogle) {
            throw new Error('User ID non disponible');
        }

        try {

            await UserService.updateNotificationSettings(user.idgoogle, enabled);


            const stored = localStorage.getItem("userData");
            if (stored) {
                const userData = JSON.parse(stored);
                userData.notificationsEnabled = enabled;
                localStorage.setItem("userData", JSON.stringify(userData));
            }


            setNotificationsEnabled(enabled);

        } catch (error) {
            console.error('Erreur lors de la mise à jour des notifications:', error);
            throw error;
        }
    };

    const checkUserData = () => {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                setNotificationsEnabled(parsedUser.notificationsEnabled || false);
            } catch {
                console.warn('Données utilisateur corrompues, suppression de localStorage.');
                localStorage.removeItem('userData');
                setUser(null);
                setNotificationsEnabled(false);
            }
        } else {
            setUser(null);
            setNotificationsEnabled(false);
        }
        setLoading(false);
    };

    // Méthode pour rafraîchir les données utilisateur
    const refreshUser = () => {
        setLoading(true);
        checkUserData();
    };

    useEffect(() => {
        checkUserData();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                notificationsEnabled,
                refreshUser,
                updateNotifications,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);