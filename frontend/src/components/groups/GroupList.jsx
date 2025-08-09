import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Users, Edit, Trash2, UserPlus } from 'lucide-react'
import { groupsAPI } from '../../services/groups'
import Modal from '../common/Modal'
import GroupForm from './GroupForm'
import ContactForm from './ContactForm'
import toast from 'react-hot-toast'

const GroupList = () => {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const queryClient = useQueryClient()

  const { data: groupsData, isLoading } = useQuery('groups', groupsAPI.getGroups)
  const groups = groupsData?.data?.data || []

  const deleteGroupMutation = useMutation(groupsAPI.deleteGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries('groups')
      toast.success('Group deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete group')
    }
  })

  const handleEditGroup = (group) => {
    setSelectedGroup(group)
    setIsEditing(true)
    setIsGroupModalOpen(true)
  }

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteGroupMutation.mutate(groupId)
    }
  }

  const handleAddContact = (group) => {
    setSelectedGroup(group)
    setIsContactModalOpen(true)
  }

  const closeModals = () => {
    setIsGroupModalOpen(false)
    setIsContactModalOpen(false)
    setSelectedGroup(null)
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Groups</h2>
          <p className="text-gray-600">Organize your contacts into groups for targeted campaigns</p>
        </div>
        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new contact group.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Group
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                  )}
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {group.contacts?.length || 0} contacts
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddContact(group)}
                    className="p-2 text-gray-400 hover:text-primary-600 rounded-md"
                    title="Add Contact"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2 text-gray-400 hover:text-primary-600 rounded-md"
                    title="Edit Group"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group._id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-md"
                    title="Delete Group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {group.contacts && group.contacts.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {group.contacts.slice(0, 3).map((contact, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-gray-600">
                            {contact.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                    ))}
                    {group.contacts.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{group.contacts.length - 3} more contacts
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Group Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={closeModals}
        title={isEditing ? 'Edit Group' : 'Create New Group'}
        size="lg"
      >
        <GroupForm
          group={selectedGroup}
          onClose={closeModals}
          isEditing={isEditing}
        />
      </Modal>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={closeModals}
        title="Add Contact"
        size="md"
      >
        <ContactForm
          group={selectedGroup}
          onClose={closeModals}
        />
      </Modal>
    </div>
  )
}

export default GroupList
