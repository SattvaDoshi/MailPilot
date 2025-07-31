// src/components/templates/TemplateEditor.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { templatesAPI } from '../../services/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const TemplateEditor = ({ template, groupId, onClose }) => {
  const isEdit = Boolean(template);
  const qc = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: template || {
      name: '',
      subject: '',
      htmlContent: '<p>Hello {{name}}</p>',
      textContent: '',
    },
  });

  const mutation = useMutation(
    (data) =>
      isEdit
        ? templatesAPI.update(template._id, data)
        : templatesAPI.create({ ...data, groupId }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['templates', groupId]);
        toast.success(`Template ${isEdit ? 'updated' : 'created'}`);
        onClose();
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Error'),
    }
  );

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <Input label="Name" {...register('name', { required: 'Required' })} error={errors.name?.message} />

      <Input label="Subject" {...register('subject', { required: 'Required' })} error={errors.subject?.message} />

      <div>
        <label className="block text-sm font-medium mb-1">HTML Content</label>
        <textarea
          rows={6}
          className="w-full border rounded p-2"
          {...register('htmlContent', { required: 'Required' })}
        />
        {errors.htmlContent && <p className="text-red-600 text-sm">{errors.htmlContent.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Text Content (optional)</label>
        <textarea rows={4} className="w-full border rounded p-2" {...register('textContent')} />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={mutation.isLoading}>{isEdit ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default TemplateEditor;
