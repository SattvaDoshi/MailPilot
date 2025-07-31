import React, { useState } from 'react';

const ContactUpload = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please upload a valid CSV file.');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('No file selected.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload-contacts', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setSuccess('Contacts uploaded successfully!');
                setError('');
                setFile(null);
            } else {
                setError('Failed to upload contacts. Please try again.');
                setSuccess('');
            }
        } catch (error) {
            setError('An error occurred while uploading contacts.');
            setSuccess('');
        }
    };

    return (
        <div className="contact-upload">
            <h2>Upload Contacts</h2>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default ContactUpload;