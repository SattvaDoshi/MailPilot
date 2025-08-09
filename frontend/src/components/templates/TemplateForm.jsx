import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { templatesAPI } from '../../services/templates'
import { groupsAPI } from '../../services/groups'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Template name is required'),
  subject: yup.string().required('Subject is required'),
  content: yup.string().required('Content is required'),
  groupId: yup.string().required('Group is required')
})

const TemplateForm = ({ template, onClose, isEditing = false }) => {
  const queryClient = useQueryClient()

  const { data: groupsData } = useQuery('groups', groupsAPI.getGroups)
  const groups = groupsData?.data?.data || []

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: template?.name || '',
      subject: template?.subject || '',
      content: template?.content || '',
      groupId: template?.group?._id || ''
    }
  })

  const createMutation = useMutation(templatesAPI.createTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries('templates')
      toast.success('Template created successfully')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create template')
    }
  })

  const updateMutation = useMutation(
    (data) => templatesAPI.updateTemplate(template._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('templates')
        toast.success('Template updated successfully')
        onClose()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update template')
      }
    }
  )

  const onSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Template Name
          </label>
          <input
            {...register('name')}
            type="text"
            className="input-field"
            placeholder="Enter template name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Group
          </label>
          <select
            {...register('groupId')}
            className="input-field"
          >
            <option value="">Select a group</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          {errors.groupId && (
            <p className="mt-1 text-sm text-red-600">{errors.groupId.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Subject Line
        </label>
        <input
          {...register('subject')}
          type="text"
          className="input-field"
          placeholder="Enter email subject"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Content
        </label>
        <textarea
          {...register('content')}
          rows={12}
          className="input-field font-mono text-sm"
          placeholder="Enter your email content here. You can use variables like {{name}}, {{email}}, etc."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
        <div className="mt-2 text-sm text-gray-500">
          <p className="font-medium">Available variables:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{'{{name}}'}</span>
            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{'{{email}}'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  )
}

export default TemplateForm
