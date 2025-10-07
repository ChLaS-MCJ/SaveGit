import React, { useEffect } from 'react';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import AuthService from '../../Services/Auth.services';

interface NotificationInitializerProps {
    userId: string | null;
}

const NotificationInitializer: React.FC<NotificationInitializerProps> = ({ userId }) => {
    useEffect(() => {
        const initializePushNotifications = async () => {
            const permStatus = await PushNotifications.requestPermissions();
            if (permStatus.receive === 'granted') {
                PushNotifications.register();
            } else {
                console.error('Permission not granted for push notifications');
            }

            PushNotifications.addListener('registration', (token: Token) => {
                if (token && token.value && userId) {
                    AuthService.updateFCMToken(userId, token.value)
                        .then(() => console.log('FCM Token mis à jour dans le backend'))
                        .catch(error => console.error('Erreur lors de la mise à jour du FCM Token:', error));
                }
            });
        };

        if (userId) {
            initializePushNotifications();
        } else {
            console.log('No token found in user data.');
        }
    }, [userId]);

    return null;
};

export default NotificationInitializer;