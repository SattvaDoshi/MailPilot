import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const GroupForm = ({ onSubmit, initialData }) => {
    const [groupName, setGroupName] = useState(initialData ? initialData.name : '');
    const [description, setDescription] = useState(initialData ? initialData.description : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name: groupName, description });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
            />
            <Input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit">Save Group</Button>
        </form>
    );
};

export default GroupForm;