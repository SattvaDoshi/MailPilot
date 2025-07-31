import React from 'react';
import GroupList from '../components/groups/GroupList';
import GroupForm from '../components/groups/GroupForm';
import ContactUpload from '../components/groups/ContactUpload';

const Groups = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Groups</h1>
            <GroupForm />
            <ContactUpload />
            <GroupList />
        </div>
    );
};

export default Groups;