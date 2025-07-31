import React from 'react';
import TemplateList from '../components/templates/TemplateList';
import TemplateEditor from '../components/templates/TemplateEditor';

const Templates = () => {
    return (
        <div>
            <h1>Email Templates</h1>
            <TemplateList />
            <TemplateEditor />
        </div>
    );
};

export default Templates;