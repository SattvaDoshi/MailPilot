import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { templatesAPI } from '../../services/templates'
import { groupsAPI } from '../../services/groups'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = yup.object({
  prompt: yup.string().min(10, 'Prompt must be at least 10 characters').required('Prompt is required'),
  groupId: yup.string().required('Group is required'),
  tone: yup.string().required('Tone is required'),
  purpose: yup.string().required('Purpose is required')
})

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' }
]

const purposes = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'invitation', label: 'Invitation' }
]

const AITemplateGenerator = ({ onClose }) => {
  const queryClient = useQueryClient()

  const { data: groupsData } = useQuery('groups', groupsAPI.getGroups)
  const groups = groupsData?.data?.data || []

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const generateMutation = useMutation(templatesAPI.generateAITemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries('templates')
      toast.success('AI template generated successfully!')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate template')
    }
  })

  const onSubmit = (data) => {
    generateMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-medium text-gray-900">AI Template Generator</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tone
          </label>
          <select
            {...register('tone')}
            className="input-field"
          >
            <option value="">Select tone</option>
            {tones.map((tone) => (
              <option key={tone.value} value={tone.value}>
                {tone.label}
              </option>
            ))}
          </select>
          {errors.tone && (
            <p className="mt-1 text-sm text-red-600">{errors.tone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Purpose
          </label>
          <select
            {...register('purpose')}
            className="input-field"
          >
            <option value="">Select purpose</option>
            {purposes.map((purpose) => (
              <option key={purpose.value} value={purpose.value}>
                {purpose.label}
              </option>
            ))}
          </select>
          {errors.purpose && (
            <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description / Prompt
        </label>
        <textarea
          {...register('prompt')}
          rows={4}
          className="input-field"
          placeholder="Describe what you want the email to be about. Be specific about your goals, target audience, and key messages..."
        />
        {errors.prompt && (
          <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Example: "Create a welcome email for new subscribers introducing our company and highlighting our key services"
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex">
          <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">
              AI Tips
            </h4>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Be specific about your goals and target audience</li>
                <li>Mention any key points or offers you want to include</li>
                <li>The AI will automatically include personalization variables</li>
                <li>Templates will follow email best practices to avoid spam</li>
              </ul>
            </div>
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
          disabled={generateMutation.isLoading}
          className="btn-primary flex items-center"
        >
          {generateMutation.isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Template
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default AITemplateGenerator
