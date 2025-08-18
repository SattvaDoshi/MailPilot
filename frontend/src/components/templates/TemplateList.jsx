import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, FileText, Edit, Trash2, Sparkles } from 'lucide-react'
import { templatesAPI } from '../../services/templates'
import { groupsAPI } from '../../services/groups'
import Modal from '../common/Modal'
import TemplateForm from './TemplateForm'
import AITemplateGenerator from './AITemplateGenerator'
import toast from 'react-hot-toast'

const TemplateList = () => {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const queryClient = useQueryClient()

  const { data: templatesData, isLoading } = useQuery(
    ['templates', selectedGroupId],
    () => templatesAPI.getTemplates(selectedGroupId)
  )
  
  const { data: groupsData } = useQuery('groups', groupsAPI.getGroups)
  
  const templates = templatesData?.data?.data || []
  const groups = groupsData?.data?.data || []

  const deleteTemplateMutation = useMutation(templatesAPI.deleteTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries('templates')
      toast.success('Template deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete template')
    }
  })

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template)
    setIsEditing(true)
    setIsTemplateModalOpen(true)
  }

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(templateId)
    }
  }

  const closeModals = () => {
    setIsTemplateModalOpen(false)
    setIsAIModalOpen(false)
    setSelectedTemplate(null)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
<section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 lg:p-8 border border-blue-100 shadow-sm">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Create and manage reusable email templates for your campaigns
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center justify-center px-4 py-2 bg-white text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-purple-50 transition-all duration-200 font-medium text-sm sm:text-base"
                aria-label="Generate template with AI"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Generate with AI</span>
                <span className="hidden sm:inline">AI Generate</span>
              </button>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm sm:text-base shadow-sm"
                aria-label="Create new template"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Create Template</span>
                <span className="hidden sm:inline">New Template</span>
              </button>
            </div>
          </div>
        </section>
      {/* Group Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by Group:</label>
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="input-field w-auto min-w-[200px]"
        >
          <option value="">All Groups</option>
          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new template or generating one with AI.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="btn-secondary flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </button>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                    {template.isAiGenerated && (
                      <Sparkles className="w-4 h-4 ml-2 text-purple-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    Group: {template.group?.name}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 text-gray-400 hover:text-primary-600 rounded-md"
                    title="Edit Template"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template._id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-md"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <div className="text-sm text-gray-600">
                  <div 
                    className="line-clamp-3" 
                    dangerouslySetInnerHTML={{ 
                      __html: template.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                    }}
                  />
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  Created: {new Date(template.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={closeModals}
        title={isEditing ? 'Edit Template' : 'Create New Template'}
        size="xl"
      >
        <TemplateForm
          template={selectedTemplate}
          onClose={closeModals}
          isEditing={isEditing}
        />
      </Modal>

      {/* AI Generator Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={closeModals}
        title="Generate Template with AI"
        size="lg"
      >
        <AITemplateGenerator onClose={closeModals} />
      </Modal>
    </div>
  )
}

export default TemplateList
