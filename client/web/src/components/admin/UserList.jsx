import React from 'react';
import UserCard from './UserCard';


function UserList({
  users,
  isLoading,
  expandedUserId,
  onToggleExpand,
  onDeleteWorkflow,
  onToggleWorkflow,
  onViewWorkflow,
  onEditWorkflow
}) {

  if (isLoading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  if (users.length === 0) {
    return (
      <div className="border border-gray-700 rounded-lg px-6 py-8 text-center">
        <p className="text-gray-400">No users found</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">
        Users ({users.length})
      </h2>

      <div className="border border-gray-700 rounded-lg overflow-hidden">
        {users.map((user, index) => (
          <UserCard
            key={user.id}
            user={user}
            isLast={index === users.length - 1}
            isExpanded={expandedUserId === user.id}
            onToggleExpand={() => onToggleExpand(user.id)}
            onDeleteWorkflow={onDeleteWorkflow}
            onToggleWorkflow={onToggleWorkflow}
            onViewWorkflow={onViewWorkflow}
            onEditWorkflow={onEditWorkflow}
          />
        ))}
      </div>
    </section>
  );
}


export default UserList;
