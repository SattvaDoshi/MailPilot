import React from 'react';
import EmailCampaign from '../components/emails/EmailCampaign';
import CampaignHistory from '../components/emails/CampaignHistory';

const Campaigns = () => {
    return (
        <div className="campaigns-page">
            <h1>Email Campaigns</h1>
            <EmailCampaign />
            <CampaignHistory />
        </div>
    );
};

export default Campaigns;