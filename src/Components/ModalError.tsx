import React from 'react';
import { Modal, Button, Typography, Spin } from 'antd';
import ErrorModallogo from "../Assets/Images/traverser.png";

const { Text, Title } = Typography;

interface ModalErrorProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    buttonText?: string;
    isLoading?: boolean;
}

const ModalError: React.FC<ModalErrorProps> = ({
    visible,
    onClose,
    title = "Error",
    message = "Vous n'êtes pas géolocalisé à cette adresse, vous ne pouvez par conséquent signaler cette collecte.",
    buttonText = "Continuer",
    isLoading
}) => {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            className="success-modal"
        >
            <div style={{ textAlign: 'center', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                {isLoading ? (
                    <Spin tip="Chargement en cours..." size="large" />
                ) : (
                    <>
                        <img className='imagesuccess' src={ErrorModallogo} alt="Error Logo" />
                        <Title level={3} style={{ marginTop: '16px' }}>{title}</Title>
                        <Text>{message}</Text>
                        <div style={{ marginTop: '24px' }}>
                            <Button
                                className='btnsuccess'
                                type="primary"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                {buttonText}
                            </Button>
                        </div>
                    </>
                )}
            </div>

        </Modal>
    );
};

export default ModalError;
