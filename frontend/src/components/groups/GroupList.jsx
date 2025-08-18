import React, { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Users, Edit, Trash2, UserPlus, UserMinus, Eye, AlertCircle } from 'lucide-react'
import { groupsAPI } from '../../services/groups'
import Modal from '../common/Modal'
import GroupForm from './GroupForm'
import ContactForm from './ContactForm'
import toast from 'react-hot-toast'

const GroupList = () => {
  const [modals, setModals] = useState({
    isGroupModalOpen: false,
    isContactModalOpen: false,
    isViewContactsModalOpen: false,
  })
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const queryClient = useQueryClient()

  // Queries
  const { 
    data: groupsResponse, 
    isLoading, 
    error,
    refetch
  } = useQuery('groups', groupsAPI.getGroups, {
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const groups = useMemo(() => {
    return groupsResponse?.data?.data || []
  }, [groupsResponse])

  // Mutations
  const deleteGroupMutation = useMutation(groupsAPI.deleteGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries('groups')
      toast.success('Group deleted successfully')
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete group'
      toast.error(message)
      console.error('Delete group error:', error)
    }
  })

  const removeContactMutation = useMutation(
    ({ groupId, contactId }) => groupsAPI.removeContact(groupId, contactId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups')
        updateSelectedGroup()
        toast.success('Contact removed successfully')
      },
      onError: (error) => {
        const message = error?.response?.data?.message || 'Failed to remove contact'
        toast.error(message)
        console.error('Remove contact error:', error)
      }
    }
  )

  const addContactMutation = useMutation(
    ({ groupId, contactData }) => groupsAPI.addContact(groupId, contactData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups')
        updateSelectedGroup()
        closeModal('isContactModalOpen')
        toast.success('Contact added successfully')
      },
      onError: (error) => {
        const message = error?.response?.data?.message || 'Failed to add contact'
        toast.error(message)
        console.error('Add contact error:', error)
      }
    }
  )

  // Helper functions
  const updateSelectedGroup = useCallback(() => {
    if (selectedGroup) {
      const updatedGroups = queryClient.getQueryData('groups')
      if (updatedGroups?.data?.data) {
        const updatedGroup = updatedGroups.data.data.find(g => g._id === selectedGroup._id)
        if (updatedGroup) {
          setSelectedGroup(updatedGroup)
        }
      }
    }
  }, [selectedGroup, queryClient])

  const openModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }))
  }, [])

  const closeModal = useCallback((modalName) => {
    if (modalName) {
      setModals(prev => ({ ...prev, [modalName]: false }))
    } else {
      setModals({
        isGroupModalOpen: false,
        isContactModalOpen: false,
        isViewContactsModalOpen: false,
      })
    }
  }, [])

  const resetModalState = useCallback(() => {
    closeModal()
    setSelectedGroup(null)
    setIsEditing(false)
  }, [closeModal])

  // Event handlers
  const handleEditGroup = useCallback((group) => {
    if (!group?._id) return
    setSelectedGroup(group)
    setIsEditing(true)
    openModal('isGroupModalOpen')
  }, [openModal])

  const handleDeleteGroup = useCallback((groupId) => {
    if (!groupId) return
    
    const confirmMessage = 'Are you sure you want to delete this group? This action cannot be undone.'
    if (window.confirm(confirmMessage)) {
      deleteGroupMutation.mutate(groupId)
    }
  }, [deleteGroupMutation])

  const handleAddContact = useCallback((group) => {
    if (!group?._id) return
    setSelectedGroup(group)
    openModal('isContactModalOpen')
  }, [openModal])

  const handleViewContacts = useCallback((group) => {
    if (!group?._id) return
    setSelectedGroup(group)
    openModal('isViewContactsModalOpen')
  }, [openModal])

  const handleRemoveContact = useCallback((groupId, contactId, contactName) => {
    if (!groupId || !contactId) return
    
    const confirmMessage = `Are you sure you want to remove "${contactName}" from this group?`
    if (window.confirm(confirmMessage)) {
      removeContactMutation.mutate({ groupId, contactId })
    }
  }, [removeContactMutation])

  const handleCreateGroup = useCallback(() => {
    setSelectedGroup(null)
    setIsEditing(false)
    openModal('isGroupModalOpen')
  }, [openModal])

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Groups</h2>
            <p className="text-gray-600">Organize your contacts into groups for targeted campaigns</p>
          </div>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load groups</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error?.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
          <div className="mt-6">
            <button onClick={refetch} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Groups</h2>
            <p className="text-gray-600">Organize your contacts into groups for targeted campaigns</p>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
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
          onClick={handleCreateGroup}
          className="btn-primary flex items-center"
          disabled={deleteGroupMutation.isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <EmptyState onCreateGroup={handleCreateGroup} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onEdit={handleEditGroup}
              onDelete={handleDeleteGroup}
              onAddContact={handleAddContact}
              onViewContacts={handleViewContacts}
              isDeleting={deleteGroupMutation.isLoading}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={modals.isGroupModalOpen}
        onClose={resetModalState}
        title={isEditing ? 'Edit Group' : 'Create New Group'}
        size="lg"
      >
        <GroupForm
          group={selectedGroup}
          onClose={resetModalState}
          isEditing={isEditing}
        />
      </Modal>

      <Modal
        isOpen={modals.isContactModalOpen}
        onClose={resetModalState}
        title="Add Contact"
        size="md"
      >
        <ContactForm
          group={selectedGroup}
          onClose={resetModalState}
        />
      </Modal>

      <Modal
        isOpen={modals.isViewContactsModalOpen}
        onClose={resetModalState}
        title={`Contacts in ${selectedGroup?.name || 'Group'}`}
        size="lg"
      >
        {selectedGroup && (
          <ContactListModal 
            group={selectedGroup} 
            onRemoveContact={handleRemoveContact}
            onAddContact={() => {
              closeModal('isViewContactsModalOpen')
              handleAddContact(selectedGroup)
            }}
            isRemoving={removeContactMutation.isLoading}
          />
        )}
      </Modal>
    </div>
  )
}

// Sub-components
const EmptyState = ({ onCreateGroup }) => (
  <div className="text-center py-12">
    <Users className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
    <p className="mt-1 text-sm text-gray-500">Get started by creating a new contact group.</p>
    <div className="mt-6">
      <button onClick={onCreateGroup} className="btn-primary">
        <Plus className="w-4 h-4 mr-2" />
        New Group
      </button>
    </div>
  </div>
)

const GroupCard = ({ 
  group, 
  onEdit, 
  onDelete, 
  onAddContact, 
  onViewContacts,
  isDeleting 
}) => {
  const contactCount = group.contacts?.length || 0

  return (
    <div className="card hover:shadow-md transition-shadow h-fit">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description}</p>
          )}
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            {contactCount} {contactCount === 1 ? 'contact' : 'contacts'}
          </div>
        </div>
        <div className="flex space-x-1 ml-2">
          <ActionButton
            onClick={() => onViewContacts(group)}
            icon={Eye}
            title="View Contacts"
            disabled={isDeleting}
          />
          <ActionButton
            onClick={() => onAddContact(group)}
            icon={UserPlus}
            title="Add Contact"
            disabled={isDeleting}
          />
          <ActionButton
            onClick={() => onEdit(group)}
            icon={Edit}
            title="Edit Group"
            disabled={isDeleting}
          />
          <ActionButton
            onClick={() => onDelete(group._id)}
            icon={Trash2}
            title="Delete Group"
            className="hover:text-red-600"
            disabled={isDeleting}
          />
        </div>
      </div>
      
      {contactCount > 0 && (
        <ContactPreview contacts={group.contacts} maxVisible={2} />
      )}
    </div>
  )
}

const ActionButton = ({ onClick, icon: Icon, title, className = "hover:text-primary-600", disabled }) => (
  <button
    onClick={onClick}
    className={`p-2 text-gray-400 rounded-md transition-colors ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    title={title}
    disabled={disabled}
  >
    <Icon className="w-4 h-4" />
  </button>
)

const ContactPreview = ({ contacts, maxVisible = 2 }) => {
  const displayContacts = contacts.slice(0, maxVisible)
  const remainingCount = contacts.length - maxVisible

  return (
    <div className="mt-4 border-t pt-4">
      <div className="space-y-2 max-h-20 overflow-hidden">
        {displayContacts.map((contact, index) => (
          <div key={contact._id || `preview-${index}`} className="flex items-center text-sm">
            <ContactAvatar name={contact.name} />
            <div className="flex-1 min-w-0 ml-2">
              <div className="font-medium text-gray-900 truncate">{contact.name || 'Unnamed Contact'}</div>
              <div className="text-gray-500 truncate text-xs">{contact.email || 'No email'}</div>
            </div>
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100 mt-2">
          +{remainingCount} more {remainingCount === 1 ? 'contact' : 'contacts'}
        </div>
      )}
    </div>
  )
}

const ContactAvatar = ({ name }) => {
  const initials = name ? name.charAt(0).toUpperCase() : '?'
  
  return (
    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-medium text-gray-600">{initials}</span>
    </div>
  )
}

const ContactListModal = ({ group, onRemoveContact, onAddContact, isRemoving }) => {
  const contacts = group.contacts || []

  if (contacts.length === 0) {
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
          Total contacts: {contacts.length}
        </p>
        <button onClick={onAddContact} className="btn-secondary text-sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Contact
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <ContactListItem
              key={contact._id || `contact-${index}`}
              contact={contact}
              groupId={group._id}
              onRemove={onRemoveContact}
              isRemoving={isRemoving}
              fallbackId={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const ContactListItem = ({ contact, groupId, onRemove, isRemoving, fallbackId }) => {
  const contactId = contact._id || fallbackId
  const contactName = contact.name || 'Unnamed Contact'
  const contactEmail = contact.email || 'No email'
  const customFieldsCount = contact.customFields ? Object.keys(contact.customFields).length : 0

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center min-w-0 flex-1">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <span className="text-sm font-medium text-primary-700">
            {contactName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 truncate">{contactName}</div>
          <div className="text-sm text-gray-500 truncate">{contactEmail}</div>
          {customFieldsCount > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {customFieldsCount} custom {customFieldsCount === 1 ? 'field' : 'fields'}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(groupId, contactId, contactName)}
        disabled={isRemoving}
        className="p-2 text-gray-400 hover:text-red-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        title="Remove Contact"
      >
        <UserMinus className="w-4 h-4" />
      </button>
    </div>
  )
}

export default GroupList