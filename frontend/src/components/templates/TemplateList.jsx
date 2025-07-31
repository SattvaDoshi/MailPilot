import React, { useState } from 'react';
import { useGet, usePost } from '../../hooks/useApi';
import { templatesAPI } from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import TemplateEditor from './TemplateEditor';
import AITemplateGenerator from './AITemplateGenerator';
import toast from 'react-hot-toast';

const TemplateList = ({ groupId }) => {
  const { data, isLoading } = useGet(['templates', groupId], () =>
    templatesAPI.getAll(groupId)
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const deleteMutation = usePost(['templates', groupId], templatesAPI.delete, {
    onSuccess: () => toast.success('Template deleted'),
  });

  const onEdit = (tpl) => {
    setEditingTemplate(tpl);
    setEditorOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Templates</h3>
        <div className="space-x-2">
          <Button variant="outline" icon={Plus} onClick={() => setAiOpen(true)}>
            AI Generate
          </Button>
          <Button icon={Plus} onClick={() => setEditorOpen(true)}>
            New
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data?.data?.templates?.map((tpl) => (
            <div key={tpl._id} className="p-4 bg-white rounded shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{tpl.name}</p>
                  <p className="text-xs text-gray-500">{tpl.subject}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => onEdit(tpl)} className="text-gray-500">
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(tpl._id)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingTemplate(null);
        }}
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        size="lg"
      >
        <TemplateEditor
          template={editingTemplate}
          groupId={groupId}
          onClose={() => {
            setEditorOpen(false);
            setEditingTemplate(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Generate with AI"
        size="lg"
      >
        <AITemplateGenerator groupId={groupId} onClose={() => setAiOpen(false)} />
      </Modal>
    </>
  );
};

export default TemplateList;
