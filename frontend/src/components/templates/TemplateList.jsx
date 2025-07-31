import React, { useEffect, useState } from 'react';
import { fetchTemplates } from '../../services/api';
import TemplateItem from './TemplateItem';

const TemplateList = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const data = await fetchTemplates();
                setTemplates(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, []);

    if (loading) {
        return <div>Loading templates...</div>;
    }

    if (error) {
        return <div>Error loading templates: {error}</div>;
    }

    return (
        <div>
            <h2>Email Templates</h2>
            <ul>
                {templates.map(template => (
                    <TemplateItem key={template.id} template={template} />
                ))}
            </ul>
        </div>
    );
};

export default TemplateList;