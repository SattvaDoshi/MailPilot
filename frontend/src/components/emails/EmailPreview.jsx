// src/components/emails/EmailPreview.jsx
import React from 'react';

const EmailPreview = ({ preview }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium">Subject</label>
      <div className="bg-gray-50 p-2 rounded">{preview.subject}</div>
    </div>
    <div>
      <label className="block text-sm font-medium">Body</label>
      <div
        className="border p-4 rounded max-h-96 overflow-auto bg-white"
        dangerouslySetInnerHTML={{ __html: preview.htmlContent }}
      />
    </div>
  </div>
);

export default EmailPreview;
