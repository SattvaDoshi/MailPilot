import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Users, Edit, Trash2, UserPlus, UserMinus, Eye } from 'lucide-react'
import { groupsAPI } from '../../services/groups'
import Modal from '../common/Modal'
import GroupForm from './GroupForm'
import ContactForm from './ContactForm'
import toast from 'react-hot-toast'

const GroupList = () => {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isViewContactsModalOpen, setIsViewContactsModalOpen] = useState(false)
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

  const removeContactMutation = useMutation(
    ({ groupId, contactId }) => groupsAPI.removeContact(groupId, contactId),
    {
      onSuccess: () => {
        // Invalidate and refetch groups data
        queryClient.invalidateQueries('groups')
        
        // Also update the selectedGroup state to reflect changes immediately in the modal
        if (selectedGroup) {
          const updatedGroups = queryClient.getQueryData('groups')
          if (updatedGroups?.data?.data) {
            const updatedGroup = updatedGroups.data.data.find(g => g._id === selectedGroup._id)
            if (updatedGroup) {
              setSelectedGroup(updatedGroup)
            }
          }
        }
        
        toast.success('Contact removed successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove contact')
      }
    }
  )

  // Add contact mutation to update UI after adding
  const addContactMutation = useMutation(
    ({ groupId, contactData }) => groupsAPI.addContact(groupId, contactData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups')
        
        // Update selectedGroup if modal is open
        if (selectedGroup) {
          const updatedGroups = queryClient.getQueryData('groups')
          if (updatedGroups?.data?.data) {
            const updatedGroup = updatedGroups.data.data.find(g => g._id === selectedGroup._id)
            if (updatedGroup) {
              setSelectedGroup(updatedGroup)
            }
          }
        }
        
        setIsContactModalOpen(false)
        toast.success('Contact added successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add contact')
      }
    }
  )

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

  const handleViewContacts = (group) => {
    setSelectedGroup(group)
    setIsViewContactsModalOpen(true)
  }

  const handleRemoveContact = (groupId, contactId, contactName) => {
    if (window.confirm(`Are you sure you want to remove ${contactName} from this group?`)) {
      removeContactMutation.mutate({ groupId, contactId })
    }
  }

  const closeModals = () => {
    setIsGroupModalOpen(false)
    setIsContactModalOpen(false)
    setIsViewContactsModalOpen(false)
    setSelectedGroup(null)
    setIsEditing(false)
  }

  // Update selectedGroup when groups data changes
  React.useEffect(() => {
    if (selectedGroup && groups.length > 0) {
      const updatedGroup = groups.find(g => g._id === selectedGroup._id)
      if (updatedGroup) {
        setSelectedGroup(updatedGroup)
      }
    }
  }, [groups, selectedGroup])

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
                    onClick={() => handleViewContacts(group)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-md"
                    title="View Contacts"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
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
                      <div key={contact._id || index} className="flex items-center text-sm">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-gray-600">
                            {contact.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                    ))}
                    {group.contacts.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
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

      {/* View Contacts Modal */}
      <Modal
        isOpen={isViewContactsModalOpen}
        onClose={closeModals}
        title={`Contacts in ${selectedGroup?.name || 'Group'}`}
        size="lg"
      >
        {selectedGroup && (
          <ContactListModal 
            group={selectedGroup} 
            onRemoveContact={handleRemoveContact}
            onAddContact={() => {
              setIsViewContactsModalOpen(false)
              handleAddContact(selectedGroup)
            }}
            isRemoving={removeContactMutation.isLoading}
          />
        )}
      </Modal>
    </div>
  )
}

// Updated ContactListModal with proper key handling
const ContactListModal = ({ group, onRemoveContact, onAddContact, isRemoving }) => {
  if (!group.contacts || group.contacts.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
        <p className="mt-1 text-sm text-gray-500">This group doesn't have any contacts yet.</p>
        <div className="mt-4">
          <button onClick={onAddContact} className="btn-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            Add First Contact
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Total contacts: {group.contacts.length}
        </p>
        <button onClick={onAddContact} className="btn-secondary text-sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Contact
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {group.contacts.map((contact, index) => (
            <div key={contact._id || `${contact.email}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-primary-700">
                    {contact.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{contact.name}</div>
                  <div className="text-sm text-gray-500">{contact.email}</div>
                  {contact.customFields && Object.keys(contact.customFields).length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      Custom fields: {Object.keys(contact.customFields).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemoveContact(group._id, contact._id || index, contact.name)}
                disabled={isRemoving}
                className="p-2 text-gray-400 hover:text-red-600 rounded-md disabled:opacity-50 transition-colors"
                title="Remove Contact"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GroupList
