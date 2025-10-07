import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IonGrid, IonRow, IonCol } from '@ionic/react';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    const goToAccueil = () => {
        navigate('/accueil');
    };

    return (
        <IonGrid className='containernotfound'>
            <IonRow className='notfound' justify-content-center>
                <IonCol size="12" className="ion-text-center">
                    <h1 className='titlenotfound'>404 Error Page</h1>
                </IonCol>
                <IonCol size="12" className="ion-text-center">
                    <section className="error-container">
                        <span className="four"><span className="screen-reader-text">4</span></span>
                        <span className="zero"><span className="screen-reader-text">0</span></span>
                        <span className="four"><span className="screen-reader-text">4</span></span>
                    </section>
                </IonCol>
                <IonCol size="12" className="ion-text-center">
                    <div className="link-container">
                        <button onClick={goToAccueil} className="more-link">Accueil</button>
                    </div>
                </IonCol>
            </IonRow>
        </IonGrid >
    );
};

export default NotFoundPage;
