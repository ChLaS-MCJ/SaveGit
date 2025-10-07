import React from 'react';
import { IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';

const PolitiqueConfidentialite: React.FC = () => {
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
                            <IonCardTitle className="ion-text-center titletop">Politique de Confidentialité</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <h2>Introduction</h2>
                            <p>Bienvenue sur notre application. Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations personnelles.</p>

                            <h2>Collecte de Données</h2>
                            <p>Nous collectons différents types de données personnelles pour fournir et améliorer nos services. Les types de données que nous collectons peuvent inclure :</p>
                            <ul>
                                <li>Informations d'identification personnelle (adresse email)</li>
                                <li>Données de localisation (latitude et longitude)</li>
                                <li>Informations d'utilisation (comment vous utilisez notre application) à des fins d'amélioration.</li>
                            </ul>

                            <h2>Utilisation des Données</h2>
                            <p>Nous utilisons les données collectées pour diverses finalités :</p>
                            <ul>
                                <li>Fournir et maintenir notre service</li>
                                <li>Notifier les utilisateurs des changements de notre service</li>
                                <li>Fournir un support client</li>
                                <li>Analyser l'utilisation de notre service pour l'améliorer</li>
                            </ul>

                            <h2>Partage des Données</h2>
                            <p>Nous ne partageons pas vos informations personnelles avec des tiers sauf dans les cas suivants :</p>
                            <ul>
                                <li>Avec votre consentement explicite</li>
                                <li>Pour se conformer à une obligation légale</li>
                                <li>Pour protéger et défendre nos droits ou notre propriété</li>
                            </ul>

                            <h2>Sécurité des Données</h2>
                            <p>La sécurité de vos données est importante pour nous. Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre l'accès non autorisé, la modification, la divulgation ou la destruction.</p>

                            <h2>Vos Droits</h2>
                            <p>Vous avez le droit d'accéder à vos données personnelles stockées, de les corriger ou de les supprimer. Vous pouvez également retirer votre consentement à tout moment. Pour exercer ces droits, veuillez nous contacter à service.client@quandpb.com.</p>

                            <h2>Modifications de cette Politique</h2>
                            <p>Nous pouvons mettre à jour notre politique de confidentialité de temps en temps. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page. Nous vous conseillons de consulter cette politique périodiquement pour prendre connaissance de tout changement.</p>

                            <h2>Contactez-nous</h2>
                            <p>Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à :</p>
                            <ul>
                                <li>Email : service.client@quandpb.com</li>
                                <li>Adresse : ?????????????</li>
                            </ul>
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

export default PolitiqueConfidentialite;
