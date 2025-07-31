// src/pages/Analytics.jsx
import React from 'react';
import { useQuery } from 'react-query';
import { emailsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const { data } = useQuery('emailHistory', () => emailsAPI.getHistory({ limit: 1000 }));

  const chartData = (data?.data?.logs || []).reduce((acc, log) => {
    const day = new Date(log.createdAt).toLocaleDateString();
    const existing = acc.find((i) => i.day === day);
    if (existing) existing[log.status] = (existing[log.status] || 0) + 1;
    else acc.push({ day, [log.status]: 1 });
    return acc;
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="bg-white p-4 rounded shadow">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="sent" fill="#4ade80" />
            <Bar dataKey="failed" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default Analytics;
