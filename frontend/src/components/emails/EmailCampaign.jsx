import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

const EmailCampaign = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { createCampaign } = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createCampaign({ subject, body });
        setIsModalOpen(false);
        setSubject('');
        setBody('');
    };

    return (
        <div>
            <h2>Create Email Campaign</h2>
            <Button onClick={() => setIsModalOpen(true)}>New Campaign</Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    <Input
                        type="textarea"
                        placeholder="Email Body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                    <Button type="submit">Send Campaign</Button>
                </form>
            </Modal>
        </div>
    );
};

export default EmailCampaign;