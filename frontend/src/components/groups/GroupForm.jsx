import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from 'react-query'
import { groupsAPI } from '../../services/groups'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Group name is required'),
  description: yup.string()
})

const GroupForm = ({ group, onClose, isEditing = false }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: group?.name || '',
      description: group?.description || ''
    }
  })

  const createMutation = useMutation(groupsAPI.createGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries('groups')
      toast.success('Group created successfully')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create group')
    }
  })

  const updateMutation = useMutation(
    (data) => groupsAPI.updateGroup(group._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups')
        toast.success('Group updated successfully')
        onClose()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update group')
      }
    }
  )

  const onSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate({ ...data, contacts: [] })
    }
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Group Name
        </label>
        <input
          {...register('name')}
          type="text"
          className="input-field"
          placeholder="Enter group name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="input-field"
          placeholder="Describe this group..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
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
          {isLoading ? 'Saving...' : isEditing ? 'Update Group' : 'Create Group'}
        </button>
      </div>
    </form>
  )
}

export default GroupForm
