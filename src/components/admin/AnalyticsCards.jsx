import React from 'react';

const AnalyticsCards = ({ stats, channelStats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-5">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { title: 'Total Users', value: stats.totalUsers || 0, icon: '👥', color: 'bg-blue-500' },
    { title: 'Total OTP Requests', value: stats.totalOTPRequests || 0, icon: '📱', color: 'bg-green-500' },
    { title: 'Successful Verifications', value: stats.successfulVerifications || 0, icon: '✅', color: 'bg-purple-500' },
    { title: 'Failed Attempts', value: stats.failedAttempts || 0, icon: '❌', color: 'bg-red-500' },
    { title: 'Total Revenue', value: `$${parseFloat(stats.revenue || 0).toFixed(2)}`, icon: '💰', color: 'bg-yellow-500' }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-5 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {channelStats && channelStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {channelStats.map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-5 border-l-4 border-l-green-500">
              <p className="text-gray-500 text-sm capitalize">{stat.channel} Requests</p>
              <p className="text-2xl font-bold mt-1">{stat.count}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AnalyticsCards;