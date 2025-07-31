// src/components/groups/ContactUpload.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import { useMutation, useQueryClient } from 'react-query';
import { groupsAPI } from '../../services/api';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const ContactUpload = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const qc = useQueryClient();

  const mutation = useMutation(groupsAPI.create, {
    onSuccess: () => {
      qc.invalidateQueries('groups');
      toast.success('Contacts imported!');
      onSuccess();
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Upload failed'),
  });

  const handleSubmit = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: ({ data }) => {
        const contacts = data
          .filter((c) => c.email)
          .map((c) => ({ email: c.email.trim(), name: c.name || '' }));
        if (!contacts.length) return toast.error('No valid contacts found');

        mutation.mutate({ name: file.name.replace('.csv', ''), contacts });
      },
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleSubmit} loading={mutation.isLoading}>
        Import
      </Button>
    </div>
  );
};

export default ContactUpload;
