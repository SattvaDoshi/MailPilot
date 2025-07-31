import React, { useEffect, useState } from 'react';
import { fetchGroups } from '../../services/api';
import GroupItem from './GroupItem';

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadGroups = async () => {
            try {
                const data = await fetchGroups();
                setGroups(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadGroups();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>User Groups</h2>
            <ul>
                {groups.map(group => (
                    <GroupItem key={group.id} group={group} />
                ))}
            </ul>
        </div>
    );
};

export default GroupList;