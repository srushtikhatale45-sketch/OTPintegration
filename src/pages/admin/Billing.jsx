import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

const AdminBilling = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const loadSummary = async () => {
    try {
      const res = await api.get('/admin/billing-summary');
      if (res.data.success) {
        setSummary(res.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading billing summary:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds for real-time updates
  useEffect(() => {
    loadSummary();
    intervalRef.current = setInterval(loadSummary, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Billing Overview</h1>
            <p className="text-gray-500">Track revenue and usage charges (updates every 5 sec)</p>
          </div>
          <div className="flex gap-3 items-center">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadSummary}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-green-500">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">₹{summary?.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
            <p className="text-gray-500 text-sm">User Credits Added</p>
            <p className="text-3xl font-bold text-blue-600">₹{summary?.userCredits?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-purple-500">
            <p className="text-gray-500 text-sm">Net Revenue</p>
            <p className="text-3xl font-bold text-purple-600">₹{summary?.netRevenue?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue by Channel</h2>
          {summary?.channelRevenue?.length > 0 ? (
            <div className="space-y-3">
              {summary.channelRevenue.map((ch, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {ch.channel === 'email' ? '✉️' : ch.channel === 'sms' ? '📱' : '💬'}
                    </span>
                    <span className="capitalize font-medium">{ch.channel}</span>
                  </div>
                  <span className="font-bold text-green-600">₹{parseFloat(ch.total).toFixed(4)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No revenue data available</p>
          )}
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Pricing Information (per OTP)</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-gray-600">SMS:</span> <span className="font-bold">₹1.00</span></div>
            <div><span className="text-gray-600">WhatsApp:</span> <span className="font-bold">₹0.50</span></div>
            <div><span className="text-gray-600">Email:</span> <span className="font-bold">₹0.25</span></div>
          </div>
          <p className="text-xs text-blue-600 mt-2">* Amount deducted instantly when OTP/campaign is sent</p>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;