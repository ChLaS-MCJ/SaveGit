import React from 'react';
import { Typography } from 'antd';
import Info from '../Assets/Images/Icones/information.svg';

const { Text } = Typography;

const ConditionsUtilisation: React.FC = () => (
    <div>
        <h2><img src={Info} alt="Conditions d'utilisation" className="custom-iconAccount" /> Conditions d'Utilisation</h2>

        <h3>1. Objet de l'Application</h3>
        <Text>
            Cette application a pour objectif de fournir des services basés sur votre localisation pour optimiser la gestion de vos déchets
            et de vous fournir des informations en temps réel. L'utilisation de l'application est régie par les présentes conditions d'utilisation,
            que nous vous invitons à lire attentivement.
        </Text>

        <h3>2. Utilisation des Données de Géolocalisation</h3>
        <Text>
            Pour vous offrir une expérience personnalisée, l'application utilise vos données de géolocalisation afin de vous proposer des fonctionnalités
            basées sur votre emplacement actuel. Ces données sont collectées uniquement lorsque l'application est en utilisation active et ne sont pas
            stockées une fois que leur utilisation est terminée. Vous pouvez désactiver la collecte de ces données via les paramètres de votre appareil,
            bien que cela puisse limiter certaines fonctionnalités de l'application.
        </Text>

        <h3>3. Responsabilités de l'Utilisateur</h3>
        <Text>
            En utilisant cette application, vous acceptez de respecter les présentes conditions d'utilisation. Vous vous engagez à utiliser l'application
            de manière responsable et dans le respect des lois et règlements en vigueur. Toute tentative de piratage, de détournement des données,
            ou d'utilisation abusive de l'application est strictement interdite.
        </Text>

        <h3>4. Limitations de Responsabilité</h3>
        <Text>
            Nous nous efforçons de fournir des informations précises et à jour via l'application. Cependant, nous ne pouvons garantir l'exactitude
            ou l'exhaustivité des informations fournies. L'utilisation de l'application se fait à vos risques et périls, et nous déclinons toute responsabilité
            pour les éventuels dommages directs ou indirects découlant de l'utilisation de l'application.
        </Text>

        <h3>5. Modification des Conditions d'Utilisation</h3>
        <Text>
            Nous nous réservons le droit de modifier ou de mettre à jour les présentes conditions d'utilisation à tout moment afin de nous conformer aux lois
            et réglementations ou d'ajuster l'application en fonction de nouvelles fonctionnalités ou services. Les modifications seront publiées directement
            sur l'application, et il vous incombe de consulter régulièrement les conditions pour rester informé des changements éventuels.
        </Text>

        <h3>6. Contact</h3>
        <Text>
            Pour toute question ou demande d'assistance concernant l'application, vous pouvez nous contacter à l'adresse suivante :
        </Text>
        <Text className="textevert">contact@applitwo.com</Text>
    </div>
);

export default ConditionsUtilisation;
