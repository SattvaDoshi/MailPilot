// src/components/emails/EmailCampaign.jsx
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { Send, Eye } from 'lucide-react';
import { emailsAPI, groupsAPI, templatesAPI } from '../../services/api';
import toast from 'react-hot-toast';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

const EmailCampaign = () => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const selectedGroupId = watch('groupId');
  const selectedTemplateId = watch('templateId');

  const { data: groups } = useQuery('groups', groupsAPI.getAll);
  const { data: templates } = useQuery(
    ['templates', selectedGroupId], 
    () => templatesAPI.getAll(selectedGroupId),
    { enabled: !!selectedGroupId }
  );

  const { data: smtpConfig } = useQuery('smtpConfig', smtpAPI.getConfig);

  // Set default from address from user's SMTP config
  useEffect(() => {
    if (smtpConfig?.data?.defaultFromAddress) {
      setValue('fromAddress', smtpConfig.data.defaultFromAddress);
    }
  }, [smtpConfig, setValue]);

  const sendMutation = useMutation(emailsAPI.send, {
    onSuccess: (data) => {
      toast.success('Email campaign started successfully!');
      console.log('Campaign results:', data.data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to send emails');
    },
  });

  const previewMutation = useMutation(
    (data) => templatesAPI.preview(selectedTemplateId, data),
    {
      onSuccess: (data) => {
        setPreviewContent(data.data.preview);
        setPreviewModalOpen(true);
      },
      onError: (error) => {
        toast.error('Failed to generate preview');
      },
    }
  );

  const onSubmit = (data) => {
    sendMutation.mutate(data);
  };

  const handlePreview = () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template first');
      return;
    }
    
    previewMutation.mutate({
      sampleData: {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ABC Corp'
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Create Email Campaign
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Contact Group
            </label>
            <select
              {...register('groupId', { required: 'Please select a group' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose a group...</option>
              {groups?.data?.groups?.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name} ({group.contacts?.length || 0} contacts)
                </option>
              ))}
            </select>
            {errors.groupId && (
              <p className="mt-1 text-sm text-red-600">{errors.groupId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Email Template
            </label>
            <select
              {...register('templateId', { required: 'Please select a template' })}
              disabled={!selectedGroupId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            >
              <option value="">Choose a template...</option>
              {templates?.data?.templates?.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
            {errors.templateId && (
              <p className="mt-1 text-sm text-red-600">{errors.templateId.message}</p>
            )}
          </div>

          <div>
            <Input
              label="From Email Address"
              type="email"
              {...register('fromAddress', { 
                required: 'From address is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address'
                }
              })}
              error={errors.fromAddress?.message}
              placeholder="your-email@domain.com"
            />
          </div>

          <div className="flex justify-between space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={!selectedTemplateId}
              icon={Eye}
            >
              Preview Email
            </Button>

            <Button
              type="submit"
              loading={sendMutation.isLoading}
              disabled={!selectedGroupId || !selectedTemplateId}
              icon={Send}
            >
              Send Campaign
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Email Preview"
        size="lg"
      >
        {previewContent && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {previewContent.subject}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content
              </label>
              <div 
                className="p-4 bg-white border rounded-md max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewContent.htmlContent }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmailCampaign;
