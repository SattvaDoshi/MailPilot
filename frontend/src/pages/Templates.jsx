// src/pages/Templates.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import TemplateList from '../components/templates/TemplateList';

const Templates = () => {
  const [params] = useSearchParams();
  const groupId = params.get('groupId');
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Templates</h1>
      <TemplateList groupId={groupId} />
    </div>
  );
};
export default Templates;
