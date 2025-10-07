import type { CapacitorConfig } from '@capacitor/cli';
// import { Capacitor } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.applitwosortapoubelle.app',
  appName: 'SorsTaPoubelle',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    hostname: "sorstapoubelle",
    androidScheme: "https",
    iosScheme: 'https',
    allowNavigation: [
      "https://mcjdevsubb.fr/",
    ]
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "927215357855-c492jdr8kkfgadp4uft0ijgae28lmh8t.apps.googleusercontent.com",
      forceCodeForRefreshToken: false
    },
    PushNotifications: {
      // Affichage des notifications même quand l'app est au premier plan
      presentationOptions: ["badge", "sound", "alert"],

      // 🚀 NOUVEAU : Configuration pour iOS
      // Permet de recevoir les notifications même en arrière-plan
      ios: {
        // Active les notifications silencieuses (background)
        backgroundMode: true,
        // Force l'affichage même si l'app est active
        foregroundPresentation: ["badge", "sound", "alert"]
      },

      // 🚀 NOUVEAU : Configuration pour Android
      android: {
        // Canal de notification important pour Android 8+
        notificationChannelId: "poubelle_notifications",
        notificationChannelName: "Notifications Poubelles",
        notificationChannelDescription: "Notifications pour sortir et rentrer les poubelles",
        // Priorité haute pour garantir la réception
        notificationChannelImportance: "high",
        // Icône de notification (doit être dans android/app/src/main/res/drawable/)
        icon: "ic_notification",
        // Son par défaut
        sound: "default"
      }
    },

    // 🔥 NOUVEAU : Configuration App pour gérer les états d'app
    App: {
      // Permet à l'app de se réveiller en arrière-plan
      launchInBackground: true,
      // Active la gestion des deep links
      androidDeepLinks: [
        {
          hostname: "sorstapoubelle",
          scheme: "https",
          pathPrefix: "/notification"
        }
      ]
    },

    // 🔥 NOUVEAU : Configuration pour les badges (iOS)
    Badge: {
      // Permet la gestion des badges sur l'icône
      persist: true,
      autoClear: false
    },

    // 🔥 NOUVEAU : Configuration Local Notifications (fallback)
    LocalNotifications: {
      // Configuration pour les notifications locales de fallback
      smallIcon: "ic_notification",
      iconColor: "#FF0000",
      sound: "default"
    }
  },

  // 🚀 NOUVEAU : Configuration iOS spécifique
  ios: {
    // Schéma personnalisé pour les deep links
    scheme: "sorstapoubelle",
  },

  // 🚀 NOUVEAU : Configuration Android spécifique
  android: {
    // Autorise le contenu mixte HTTPS/HTTP
    allowMixedContent: true,
    // Active la capture d'input pour les notifications
    captureInput: true,
  }
};

export default config;
