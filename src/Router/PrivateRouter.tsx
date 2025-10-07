import React from 'react';
import { useRoutes } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import MainLayout2 from '../Layout/MainLayout2';
import Search from '../Pages/Private/Search';
import Account from '../Components/Account'

const PrivateRouter: React.FC = () => {
    return (
        <IonRouterOutlet>
            {useRoutes([
                {
                    path: '/',
                    element: <MainLayout2 />,
                    children: [
                        { path: 'search', element: <Search /> },
                        { path: 'account', element: <Account /> },
                    ],
                },
            ])}
        </IonRouterOutlet>
    );
};

export default PrivateRouter;
