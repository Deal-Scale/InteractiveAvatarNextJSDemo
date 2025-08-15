import React from 'react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Chat History</h2>
      {/* Chat history items will go here */}
      <div className="mt-auto">
        <h2 className="text-lg font-bold mb-4">Settings</h2>
        {/* Settings options will go here */}
      </div>
    </aside>
  );
};

export default Sidebar;
