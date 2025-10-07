import React from 'react';
import { IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';

const ConditionsGenerales: React.FC = () => {
    const navigate = useNavigate();

    const goToAccueil = () => {
        navigate('/accueil');
    };

    return (
        <IonGrid className='container-condition'>
            <IonRow>
                <IonCol size="12">
                    <IonCard className='condition-card'>
                        <IonCardHeader>
                            <IonCardTitle className="ion-text-center titletop">Conditions Générales</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <h2>Introduction</h2>
                            <p>Bienvenue sur notre application. Ces conditions générales définissent les règles et règlements pour l'utilisation de notre application.</p>

                            <h2>Acceptation des Conditions</h2>
                            <p>En accédant à cette application, nous supposons que vous acceptez ces conditions générales. Ne continuez pas à utiliser l'application si vous n'acceptez pas toutes les conditions générales énoncées sur cette page.</p>

                            <h2>Utilisation de l'Application</h2>
                            <p>Vous devez avoir au moins 10 ans pour utiliser cette application. En utilisant cette application, vous garantissez que vous avez au moins 10 ans.</p>
                            <p>L'utilisation de l'application à des fins illégales ou non autorisées est interdite. Les utilisateurs s'engagent à respecter toutes les lois locales concernant la conduite en ligne et le contenu acceptable.</p>

                            <h2>Propriété Intellectuelle</h2>
                            <p>Sauf indication contraire, nous ou nos concédants possédons les droits de propriété intellectuelle de l'application et du matériel sur l'application. Tous ces droits de propriété intellectuelle sont réservés.</p>

                            <h2>Paiements et Remboursements</h2>
                            <p>Tous les paiements effectués via l'application sont soumis à notre politique de remboursement. Veuillez consulter notre politique de remboursement pour plus de détails.</p>

                            <h2>Limitation de Responsabilité</h2>
                            <p>Nous ne serons pas responsables de tout dommage direct, indirect ou consécutif découlant de l'utilisation ou de l'incapacité à utiliser l'application.</p>

                            <h2>Résolution des Litiges</h2>
                            <p>Tous les litiges découlant de ou en relation avec ces conditions générales seront soumis à la compétence exclusive des tribunaux de PAU 64000.</p>
                        </IonCardContent>
                    </IonCard>
                    <div className="link-container ion-text-center">
                        <button onClick={goToAccueil} className="more-link">Accueil</button>
                    </div>
                </IonCol>
            </IonRow>
        </IonGrid>
    );
};

export default ConditionsGenerales;
