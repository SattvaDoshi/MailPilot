import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useQuery, useMutation } from 'react-query'
import { Send, Eye } from 'lucide-react'
import { emailsAPI } from '../../services/emails'
import { groupsAPI } from '../../services/groups'
import { templatesAPI } from '../../services/templates'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'

const schema = yup.object({
  groupId: yup.string().required('Group is required'),
  subject: yup.string().required('Subject is required'),
  content: yup.string().required('Content is required')
})

const EmailComposer = ({ onEmailSent }) => {
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  const { data: groupsData } = useQuery('groups', groupsAPI.getGroups)
  const { data: templatesData } = useQuery(
    ['templates', selectedGroupId],
    () => templatesAPI.getTemplates(selectedGroupId),
    { enabled: !!selectedGroupId }
  )

  const groups = groupsData?.data?.data || []
  const templates = templatesData?.data?.data || []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const watchedContent = watch('content', '')
  const watchedSubject = watch('subject', '')

  const sendEmailMutation = useMutation(emailsAPI.sendEmails, {
    onSuccess: (data) => {
      toast.success('Email campaign started successfully!')
      onEmailSent?.(data.data.data)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send emails')
    }
  })

  const handleGroupChange = (groupId) => {
    setSelectedGroupId(groupId)
    setValue('groupId', groupId)
    setSelectedTemplateId('')
    setValue('templateId', '')
  }

  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId)
    const template = templates.find(t => t._id === templateId)
    if (template) {
      setValue('subject', template.subject)
      setValue('content', template.content)
    }
  }

  const onSubmit = (data) => {
    const emailData = {
      ...data,
      templateId: selectedTemplateId || undefined
    }
    sendEmailMutation.mutate(emailData)
  }

  const selectedGroup = groups.find(g => g._id === selectedGroupId)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Compose Email Campaign</h2>
        <p className="text-gray-600">Create and send personalized emails to your contact groups</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Group Selection */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Recipients</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Group
            </label>
            <select
              {...register('groupId')}
              value={selectedGroupId}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="input-field"
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name} ({group.contacts?.length || 0} contacts)
                </option>
              ))}
            </select>
            {errors.groupId && (
              <p className="mt-1 text-sm text-red-600">{errors.groupId.message}</p>
            )}
          </div>

          {selectedGroup && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900">
                Selected Group: {selectedGroup.name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {selectedGroup.contacts?.length || 0} recipients
              </p>
              {selectedGroup.description && (
                <p className="text-sm text-gray-500 mt-1">{selectedGroup.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Template Selection */}
        {selectedGroupId && templates.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Use Template (Optional)</h3>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a template or write custom content</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Email Content */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Content</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content
              </label>
              <textarea
                {...register('content')}
                rows={12}
                className="input-field font-mono text-sm"
                placeholder="Write your email content here. Use {{name}}, {{email}}, etc. for personalization."
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
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="btn-secondary flex items-center"
              disabled={!watchedContent || !watchedSubject}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>

            <button
              type="submit"
              disabled={sendEmailMutation.isLoading || !selectedGroupId}
              className="btn-primary flex items-center"
            >
              {sendEmailMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Campaign
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Email Preview"
        size="lg"
      >
        <div className="border rounded-lg p-4">
          <div className="border-b pb-3 mb-4">
            <h4 className="font-medium text-gray-900">Subject:</h4>
            <p className="text-gray-700">{watchedSubject}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Content:</h4>
            <div 
              className="prose max-w-none text-sm text-gray-700 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: watchedContent.replace(/\n/g, '<br>') }}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setPreviewOpen(false)}
            className="btn-secondary"
          >
            Close Preview
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default EmailComposer
