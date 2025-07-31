// src/components/templates/AITemplateGenerator.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { templatesAPI } from '../../services/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const AITemplateGenerator = ({ groupId, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const qc = useQueryClient();

  const mutation = useMutation(templatesAPI.generateAI, {
    onSuccess: () => {
      qc.invalidateQueries(['templates', groupId]);
      toast.success('AI template generated');
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Generation failed'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate({ ...d, groupId }))} className="space-y-4">
      <Input
        label="Prompt"
        {...register('prompt', { required: 'Required' })}
        error={errors.prompt?.message}
        placeholder="Describe the purpose of the email"
      />
      <Input
        label="Purpose"
        {...register('purpose', { required: 'Required' })}
        error={errors.purpose?.message}
        placeholder="e.g., Welcome email"
      />

      <div className="flex justify-end">
        <Button loading={mutation.isLoading}>Generate</Button>
      </div>
    </form>
  );
};

export default AITemplateGenerator;
