
import { PushNotifications } from '@capacitor/push-notifications';

interface BadgeWindow extends Window {
    webkit?: {
        messageHandlers?: {
            badge?: {
                postMessage: (value: number) => void;
            };
        };
    };
    FirebasePlugin?: {
        setBadgeNumber: (number: number) => void;
    };
    cordova?: {
        plugins?: {
            notification?: {
                badge?: {
                    clear: () => void;
                    set: (number: number) => void;
                };
            };
        };
    };
}

declare let window: BadgeWindow;

/**
 * Service pour gérer les badges de l'application
 */
export class BadgeService {
    /**
     * Réinitialise le badge de l'application à 0
     */
    static async clear(): Promise<void> {
        try {
            // 1. Supprimer toutes les notifications délivrées
            await PushNotifications.removeAllDeliveredNotifications();

            // 2. Pour les applications iOS natives (WKWebView)
            if (window.webkit?.messageHandlers?.badge) {
                window.webkit.messageHandlers.badge.postMessage(0);
            }

            // 3. Pour Firebase Messaging
            if (window.FirebasePlugin) {
                window.FirebasePlugin.setBadgeNumber(0);
            }

            // 4. Pour les applications basées sur Cordova/PhoneGap
            if (window.cordova?.plugins?.notification?.badge) {
                window.cordova.plugins.notification.badge.clear();
            }

            console.log('Badge réinitialisé avec succès');
        } catch (error) {
            console.error('Erreur lors de la réinitialisation du badge:', error);
        }
    }

    /**
     * Définit le badge de l'application à une valeur spécifique
     * @param count Nombre à afficher sur le badge
     */
    static async set(count: number): Promise<void> {
        try {
            // 1. Pour les applications iOS natives (WKWebView)
            if (window.webkit?.messageHandlers?.badge) {
                window.webkit.messageHandlers.badge.postMessage(count);
            }

            // 2. Pour Firebase Messaging
            if (window.FirebasePlugin) {
                window.FirebasePlugin.setBadgeNumber(count);
            }

            // 3. Pour les applications basées sur Cordova/PhoneGap
            if (window.cordova?.plugins?.notification?.badge) {
                window.cordova.plugins.notification.badge.set(count);
            }

            console.log(`Badge défini à ${count}`);
        } catch (error) {
            console.error(`Erreur lors de la définition du badge à ${count}:`, error);
        }
    }
}