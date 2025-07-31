import React, { useState } from 'react';

const AITemplateGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedTemplate, setGeneratedTemplate] = useState('');

    const handleGenerateTemplate = async () => {
        // Call to AI service to generate template based on prompt
        try {
            const response = await fetch('/api/generate-template', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });
            const data = await response.json();
            setGeneratedTemplate(data.template);
        } catch (error) {
            console.error('Error generating template:', error);
        }
    };

    return (
        <div className="ait-template-generator">
            <h2>AI Template Generator</h2>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                rows="4"
                className="w-full p-2 border rounded"
            />
            <button onClick={handleGenerateTemplate} className="mt-2 p-2 bg-blue-500 text-white rounded">
                Generate Template
            </button>
            {generatedTemplate && (
                <div className="mt-4">
                    <h3>Generated Template:</h3>
                    <div className="border p-2 rounded">{generatedTemplate}</div>
                </div>
            )}
        </div>
    );
};

export default AITemplateGenerator;