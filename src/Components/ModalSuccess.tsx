import React from 'react';
import { Modal, Button, Typography } from 'antd';
import SuccessModallogo from "../Assets/Images/verifier.png";

const { Text, Title } = Typography;

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    buttonText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    visible,
    onClose,
    title = "Succès",
    message = "Merci pour votre participation",
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
                <img className='imagesuccess' src={SuccessModallogo}></img>
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

export default SuccessModal;
