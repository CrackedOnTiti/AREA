import React from 'react';


function UserSearchBar({ searchText, onSearchChange }) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search users by name or email..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
      />
    </div>
  );
}


export default UserSearchBar;
