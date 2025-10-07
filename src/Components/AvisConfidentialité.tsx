import React from 'react';
import { Typography } from 'antd';
import Shield from '../Assets/Images/Icones/secure-shield-shield.svg';

const { Text } = Typography;

const AvisConfidentialité: React.FC = () => (
    <div>
        <h2><img src={Shield} alt="Avis sur la confidentialité" className="custom-iconAccount" /> Avis de Confidentialité</h2>
        <Text>
            Nous attachons une grande importance à la confidentialité et à la sécurité de vos données personnelles. Conformément au
            Règlement Général sur la Protection des Données (RGPD), nous nous engageons à protéger vos informations et à garantir
            leur utilisation de manière transparente et sécurisée.
        </Text>

        <h3>Collecte et Utilisation des Données Personnelles</h3>
        <Text>
            Nous collectons uniquement les données personnelles nécessaires pour fournir nos services, comme vos informations de
            contact, vos préférences de compte, et toute autre donnée que vous choisissez de partager avec nous. Ces données sont
            collectées avec votre consentement et sont utilisées uniquement pour les finalités pour lesquelles elles ont été fournies.
        </Text>
        <Text>
            En particulier, notre application utilise des données de géolocalisation afin de vous proposer des fonctionnalités basées sur votre emplacement.
            Ces données de localisation sont traitées uniquement dans le cadre de l’utilisation de l’application et ne sont pas
            conservées au-delà de la durée nécessaire à la prestation de nos services.
        </Text>

        <h3>Conservation des Données</h3>
        <Text>
            Vos données personnelles sont conservées pendant la durée nécessaire à la réalisation des objectifs pour lesquels elles
            ont été collectées, sauf si une période de conservation plus longue est exigée ou permise par la loi. Nous nous engageons
            à supprimer ou anonymiser vos informations lorsque ces objectifs sont atteints.
        </Text>

        <h3>Droits des Utilisateurs</h3>
        <Text>
            Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
        </Text>
        <ul>
            <li>Le droit d'accès à vos données.</li>
            <li>Le droit de rectification de vos informations en cas d'inexactitude.</li>
            <li>Le droit à l'effacement de vos données.</li>
            <li>Le droit de restreindre ou de vous opposer au traitement de vos données.</li>
            <li>Le droit à la portabilité de vos données.</li>
        </ul>

        <Text>
            Pour exercer ces droits, vous pouvez nous contacter via les coordonnées fournies ci-dessous. Nous nous engageons à répondre
            à votre demande dans un délai raisonnable et dans les limites imposées par la loi.
        </Text>

        <h3>Contact</h3>
        <Text>
            Pour toute question ou demande relative à vos données personnelles, veuillez nous contacter à l'adresse suivante
        </Text>
        <Text className='textevert'>
            contact@applitwo.com
        </Text>
    </div>
);

export default AvisConfidentialité;
