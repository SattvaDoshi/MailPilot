// src/pages/Groups.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Users, Edit, Trash2, Upload } from 'lucide-react';
import { groupsAPI } from '../services/api';
import toast from 'react-hot-toast';

import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import GroupForm from '../components/groups/GroupForm';
import ContactUpload from '../components/groups/ContactUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Groups = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery('groups', groupsAPI.getAll);

  const deleteMutation = useMutation(groupsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('groups');
      toast.success('Group deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete group');
    },
  });

  const handleDelete = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteMutation.mutate(groupId);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingGroup(null);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Groups</h1>
          <p className="text-gray-600">Manage your email recipient groups</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="outline"
            icon={Upload}
          >
            Import CSV
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
          >
            New Group
          </Button>
        </div>
      </div>

      {groups?.data?.groups?.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first contact group.
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
              New Group
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups?.data?.groups?.map((group) => (
            <div key={group._id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {group.contacts?.length || 0} contacts
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(group)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(group._id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {group.description && (
                  <p className="mt-3 text-sm text-gray-600">
                    {group.description}
                  </p>
                )}
                
                <div className="mt-4">
                  <div className="text-xs text-gray-500">
                    Created {new Date(group.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Group Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={editingGroup ? 'Edit Group' : 'Create New Group'}
      >
        <GroupForm
          group={editingGroup}
          onSuccess={handleCloseModal}
        />
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Import Contacts from CSV"
      >
        <ContactUpload onSuccess={() => setIsUploadModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Groups;
