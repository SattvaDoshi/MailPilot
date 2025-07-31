import React, { useState } from 'react';

const TemplateEditor = ({ template, onSave }) => {
    const [title, setTitle] = useState(template ? template.title : '');
    const [content, setContent] = useState(template ? template.content : '');

    const handleSave = () => {
        const updatedTemplate = {
            title,
            content,
        };
        onSave(updatedTemplate);
    };

    return (
        <div className="template-editor">
            <h2>{template ? 'Edit Template' : 'Create Template'}</h2>
            <div>
                <label htmlFor="template-title">Title</label>
                <input
                    id="template-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Template Title"
                />
            </div>
            <div>
                <label htmlFor="template-content">Content</label>
                <textarea
                    id="template-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Template Content"
                />
            </div>
            <button onClick={handleSave}>Save Template</button>
        </div>
    );
};

export default TemplateEditor;