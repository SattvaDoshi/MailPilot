import React from 'react';

const EmailPreview = ({ subject, body }) => {
    return (
        <div className="email-preview">
            <h2>{subject}</h2>
            <div className="email-body">
                <p>{body}</p>
            </div>
        </div>
    );
};

export default EmailPreview;