import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';

import PublicRouter from './Router/AppRouter';
import PrivateRouter from './Router/PrivateRouter';
import AuthGuard from './Guard/AuthGuard';

import NotificationHandler from './Components/Notification/NotificationHandler';
import { BadgeService } from './Utils/BadgeService';

/**
 * Composant principal de l'application
 * Gère le routage et les gardes d'authentification
 */
const App: React.FC = () => {
  // Effet qui s'exécute au démarrage de l'application
  useEffect(() => {
    let listenerCleanup: { remove: () => Promise<void> } | null = null;

    const setupApp = async () => {
      try {
        // Réinitialiser le badge au démarrage de l'application
        await BadgeService.clear();
        console.log('Badge réinitialisé au démarrage de l\'application');

        // Écouter les changements d'état de l'application
        // Notez que nous attendons que la promesse se résolve avec await
        const appStateListener = await CapApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            // Lorsque l'application devient active/visible
            BadgeService.clear().catch(error => {
              console.error('Erreur lors de la réinitialisation du badge:', error);
            });
          }
        });

        // Conserver la référence pour le nettoyage
        listenerCleanup = appStateListener;
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      }
    };

    setupApp();

    // Nettoyage
    return () => {
      if (listenerCleanup) {
        listenerCleanup.remove().catch(error => {
          console.error('Erreur lors de la suppression du listener d\'état:', error);
        });
      }
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Gestionnaire de notifications */}
      <NotificationHandler />

      {/* Routes de l'application */}
      <Routes>
        <Route path="/*" element={<PublicRouter />} />
        <Route
          path="/auth/*"
          element={
            <AuthGuard>
              <PrivateRouter />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;