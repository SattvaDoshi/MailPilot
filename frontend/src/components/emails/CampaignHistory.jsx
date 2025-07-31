import React, { useEffect, useState } from 'react';
import { fetchCampaignHistory } from '../../services/api';

const CampaignHistory = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getCampaignHistory = async () => {
            try {
                const data = await fetchCampaignHistory();
                setCampaigns(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getCampaignHistory();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Campaign History</h2>
            <ul>
                {campaigns.map((campaign) => (
                    <li key={campaign.id}>
                        <h3>{campaign.title}</h3>
                        <p>Status: {campaign.status}</p>
                        <p>Sent on: {new Date(campaign.sentDate).toLocaleDateString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CampaignHistory;