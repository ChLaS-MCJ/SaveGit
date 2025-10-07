import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import { UserService } from '../Services/User.service';
import { Device } from '@capacitor/device';
import { UserData } from '../Modules/types';
import { useAuth } from '../Context/AuthContext';

// Interface pour les résultats d'authentification Google
interface GoogleAuthResult {
  id?: string;
  email?: string;
  familyName?: string;
  givenName?: string;
  imageUrl?: string;
  authentication?: {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
  };
  serverAuthCode?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        await GoogleAuth.initialize({
          clientId: "927215357855-c492jdr8kkfgadp4uft0ijgae28lmh8t.apps.googleusercontent.com",
          scopes: ['profile', 'email'],
          grantOfflineAccess: false
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur d\'initialisation');
      }
    };

    initGoogleAuth();
  }, []);

  const getDeviceInfo = async (): Promise<string> => {
    try {
      const { identifier } = await Device.getId();
      return identifier;
    } catch (error) {
      return 'unknown-device-id';
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Déconnexion avant la tentative de connexion
      try {
        await GoogleAuth.signOut();
      } catch (signOutError) {
        // Ignorer les erreurs de déconnexion
      }

      // Connexion
      const result = await GoogleAuth.signIn() as GoogleAuthResult;
      await processAuthResult(result);

    } catch (error) {
      if (error instanceof Error) {
        if ('code' in error && error.code === '12501') {
          setErrorMessage("Connexion annulée. Veuillez réessayer et accepter les permissions.");
        } else {
          setErrorMessage(error.message || "Erreur inconnue");
        }
      } else {
        setErrorMessage("Une erreur s'est produite lors de la connexion");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour traiter le résultat d'authentification
  const processAuthResult = async (result: GoogleAuthResult) => {
    if (!result) {
      setErrorMessage('Échec de l\'authentification: résultat vide');
      return;
    }

    // Récupération de l'ID de l'appareil
    const deviceId = await getDeviceInfo();

    // Création des données utilisateur
    const userData: UserData = {
      idgoogle: result.id || '',
      email: result.email || '',
      token: result.authentication?.accessToken || '',
      authKeytel: deviceId,
      address: {
        codeInsee: '00000',
        codeRivoli: '00000',
        city: '',
        street: '',
        postalcode: '',
      },
      imageUrl: result.imageUrl || '',
      familyName: result.familyName || '',
      givenName: result.givenName || '',
      position: { latitude: 0, longitude: 0 },
    };

    try {
      // Stocker dans localStorage
      localStorage.setItem('userData', JSON.stringify(userData));

      // Rafraîchir le contexte utilisateur
      refreshUser();

      // Appel à l'API
      const apiResponse = await UserService.sendUserDataToAPI(userData);

      if (apiResponse && apiResponse.user) {
        navigate('/auth/search', { replace: true });
      } else {
        setErrorMessage('Erreur lors de la validation des données. Veuillez réessayer.');
      }
    } catch (apiError) {
      setErrorMessage('Erreur lors du traitement des données. Veuillez réessayer.');
    }
  };

  return (
    <>
      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Spin spinning={isLoading}>
        <button
          onClick={signIn}
          type="button"
          className="login-with-google-btn"
          disabled={isLoading}>
          Connexion avec Google
        </button>
      </Spin>
    </>
  );
};

export default Login;