
import React from 'react';
import { Modal, Button, Typography } from 'antd';
import ErrorModallogo from "../Assets/Images/traverser.png";

const { Text, Title } = Typography;

interface BlacklistErrorModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    buttonText?: string;
}

const BlacklistErrorModal: React.FC<BlacklistErrorModalProps> = ({
    visible,
    onClose,
    title = "Error",
    message = "Vous n'est pas géolocalisé à cette adresse , vous ne pouvez par conséquent signaler cette collecte.",
    buttonText = "Continuer",
}) => {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            className="success-modal"
        >
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <img className='imagesuccess' src={ErrorModallogo}></img>
                <Title level={3} style={{ marginTop: '16px' }}>{title}</Title>
                <Text>{message}</Text>
                <div style={{ marginTop: '24px' }}>
                    <Button className='btnsuccess' type="primary" onClick={() => {
                        onClose();
                    }}>
                        {buttonText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default BlacklistErrorModal;
