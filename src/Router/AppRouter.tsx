import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import MainLayout from '../Layout/MainLayout';
import Accueil from '../Pages/Public/Accueil';

const AppRouter: React.FC = () => {
    return (
        <IonRouterOutlet>
            {useRoutes([
                {
                    path: '/',
                    element: <MainLayout />,
                    children: [
                        { path: 'accueil', element: <Accueil /> },
                        { path: '/', element: <Navigate to="/accueil" /> },
                    ],
                },
            ])}
        </IonRouterOutlet>
    );
};

export default AppRouter;
