// src/pages/Settings.jsx
import React from 'react';
import SmtpConfig from '../components/settings/SmtpConfig';
import PlanSelector from '../components/subscription/PlanSelector';

const Settings = () => (
  <div className="space-y-12">
    <SmtpConfig />
    <PlanSelector />
  </div>
);
export default Settings;
