import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Chargement...</div>;
    }

    // Vérifie si l'utilisateur arrive via une notification
    const searchParams = new URLSearchParams(window.location.search);
    const fromNotification = searchParams.get('fromNotification') === 'true';

    // Permet d'accéder si l'utilisateur arrive via une notification
    if (fromNotification) {
        return <>{children}</>;
    }

    // Redirige si l'utilisateur n'est pas authentifié
    return isAuthenticated ? <>{children}</> : <Navigate to="/accueil" replace />;
};

export default AuthGuard;
