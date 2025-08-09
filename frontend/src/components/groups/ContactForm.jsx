import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from 'react-query'
import { groupsAPI } from '../../services/groups'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required')
})

const ContactForm = ({ group, onClose }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const addContactMutation = useMutation(
    (contactData) => groupsAPI.addContact(group._id, contactData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups')
        toast.success('Contact added successfully')
        onClose()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add contact')
      }
    }
  )

  const onSubmit = (data) => {
    addContactMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contact Name
        </label>
        <input
          {...register('name')}
          type="text"
          className="input-field"
          placeholder="Enter contact name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          className="input-field"
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm text-gray-600">
          Adding to: <span className="font-medium">{group?.name}</span>
        </p>
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
          disabled={addContactMutation.isLoading}
          className="btn-primary"
        >
          {addContactMutation.isLoading ? 'Adding...' : 'Add Contact'}
        </button>
      </div>
    </form>
  )
}

export default ContactForm
