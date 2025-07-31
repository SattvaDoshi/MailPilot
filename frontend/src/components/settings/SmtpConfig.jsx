// src/components/settings/SmtpConfig.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { smtpAPI } from '../../services/api';
import toast from 'react-hot-toast';

import Button from '../ui/Button';
import Input from '../ui/Input';

const providerConfigs = {
  gmail: {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    instructions: 'Use your Gmail address and App Password (not your regular password)'
  },
  outlook: {
    name: 'Outlook/Hotmail',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    instructions: 'Use your Outlook address and password'
  },
  yahoo: {
    name: 'Yahoo Mail',
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    instructions: 'Use your Yahoo address and App Password'
  },
  custom: {
    name: 'Custom SMTP',
    host: '',
    port: 587,
    secure: false,
    instructions: 'Enter your custom SMTP server details'
  }
};

const SmtpConfig = () => {
  const [selectedProvider, setSelectedProvider] = useState('gmail');
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      provider: 'gmail',
      ...providerConfigs.gmail
    }
  });

  const { data: currentConfig } = useQuery('smtpConfig', smtpAPI.getConfig);

  const testMutation = useMutation(smtpAPI.test, {
    onSuccess: () => {
      toast.success('SMTP configuration test successful!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'SMTP test failed');
    },
  });

  const saveMutation = useMutation(smtpAPI.configure, {
    onSuccess: () => {
      queryClient.invalidateQueries('smtpConfig');
      toast.success('SMTP configuration saved successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to save SMTP configuration');
    },
  });

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    const config = providerConfigs[provider];
    setValue('provider', provider);
    setValue('host', config.host);
    setValue('port', config.port);
    setValue('secure', config.secure);
  };

  const onSubmit = (data) => {
    saveMutation.mutate(data);
  };

  const handleTest = () => {
    const formData = watch();
    testMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Mail className="h-6 w-6 text-primary-600 mr-3" />
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Email Configuration
            </h2>
            <p className="text-sm text-gray-500">
              Configure your email account to send campaigns
            </p>
          </div>
        </div>

        {currentConfig?.data?.configured && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Email Configured
                </p>
                <p className="text-sm text-green-700">
                  Using: {currentConfig.data.config.user}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Email Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(providerConfigs).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleProviderChange(key)}
                  className={`p-3 text-left border rounded-md transition-colors ${
                    selectedProvider === key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{config.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
              <div className="text-sm text-blue-700">
                <strong>Instructions:</strong><br />
                {providerConfigs[selectedProvider].instructions}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              {...register('host', { required: 'Host is required' })}
              error={errors.host?.message}
              disabled={selectedProvider !== 'custom'}
            />
            <Input
              label="Port"
              type="number"
              {...register('port', { required: 'Port is required' })}
              error={errors.port?.message}
              disabled={selectedProvider !== 'custom'}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            {...register('user', { 
              required: 'Email address is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address'
              }
            })}
            error={errors.user?.message}
            placeholder="your-email@domain.com"
          />

          <Input
            label="Password / App Password"
            type="password"
            {...register('pass', { required: 'Password is required' })}
            error={errors.pass?.message}
            placeholder="Your email password or app password"
          />

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              loading={testMutation.isLoading}
            >
              Test Configuration
            </Button>
            
            <Button
              type="submit"
              loading={saveMutation.isLoading}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmtpConfig;
