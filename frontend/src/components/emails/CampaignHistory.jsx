// src/components/emails/CampaignHistory.jsx
import React, { useState } from 'react';
import { usePaginatedGet } from '../../hooks/useApi';
import { emailsAPI } from '../../services/api';
import { Loader2 } from 'lucide-react';

const CampaignHistory = () => {
  const [page, setPage] = useState(1);

  const { data, isFetching } = usePaginatedGet(
    'emailHistory',
    emailsAPI.getHistory,
    { page, limit: 20 },
    { keepPreviousData: true }
  );

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Campaign History</h3>

      <table className="min-w-full bg-white rounded shadow text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-4 py-2">Recipient</th>
            <th className="px-4 py-2">Subject</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.logs?.map((log) => (
            <tr key={log._id} className="border-t">
              <td className="px-4 py-2">{log.recipientEmail}</td>
              <td className="px-4 py-2">{log.subject}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded ${
                    log.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {log.status}
                </span>
              </td>
              <td className="px-4 py-2">{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {data?.data?.pagination?.pages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} / {data.data.pagination.pages}
          </span>
          <button
            disabled={page === data.data.pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isFetching && <Loader2 className="h-5 w-5 animate-spin mt-2 mx-auto" />}
    </div>
  );
};

export default CampaignHistory;
