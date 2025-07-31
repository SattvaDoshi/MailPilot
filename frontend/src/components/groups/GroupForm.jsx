// src/components/groups/GroupForm.jsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { groupsAPI } from '../../services/api';
import toast from 'react-hot-toast';

import Button from '../ui/Button';
import Input from '../ui/Input';

const GroupForm = ({ group, onSuccess }) => {
  const queryClient = useQueryClient();
  const isEditing = !!group;

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
      contacts: group?.contacts || [{ email: '', name: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts'
  });

  const createMutation = useMutation(groupsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('groups');
      toast.success('Group created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create group');
    },
  });

  const updateMutation = useMutation(
    (data) => groupsAPI.update(group._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups');
        toast.success('Group updated successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update group');
      },
    }
  );

  const onSubmit = (data) => {
    // Filter out empty contacts
    const validContacts = data.contacts.filter(contact => contact.email);
    
    const groupData = {
      ...data,
      contacts: validContacts
    };

    if (isEditing) {
      updateMutation.mutate(groupData);
    } else {
      createMutation.mutate(groupData);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          label="Group Name"
          {...register('name', { required: 'Group name is required' })}
          error={errors.name?.message}
          placeholder="e.g., Marketing Team, Newsletter Subscribers"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Brief description of this group..."
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Contacts
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ email: '', name: '' })}
            icon={Plus}
          >
            Add Contact
          </Button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-3 items-start">
              <div className="flex-1">
                <Input
                  {...register(`contacts.${index}.name`)}
                  placeholder="Contact Name"
                  size="sm"
                />
              </div>
              <div className="flex-1">
                <Input
                  {...register(`contacts.${index}.email`, {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="Email Address"
                  size="sm"
                  error={errors.contacts?.[index]?.email?.message}
                />
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {isEditing ? 'Update Group' : 'Create Group'}
        </Button>
      </div>
    </form>
  );
};

export default GroupForm;
