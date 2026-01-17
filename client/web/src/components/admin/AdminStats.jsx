import React from 'react';


function AdminStats({ totalUsers, totalWorkflows, activeWorkflows, isLoading }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">

      <StatCard
        label="Total Users"
        value={isLoading ? '-' : totalUsers}
      />

      <StatCard
        label="Total Workflows"
        value={isLoading ? '-' : totalWorkflows}
      />

      <StatCard
        label="Active Workflows"
        value={isLoading ? '-' : activeWorkflows}
      />

    </div>
  );
}


function StatCard({ label, value }) {
  return (
    <div className="bg-black border border-gray-700 rounded-lg px-4 py-3 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}


export default AdminStats;
