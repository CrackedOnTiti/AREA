import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const Layout = ({ children }) =>
{
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () =>
  {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () =>
  {
    setDrawerOpen(false);
  };

  const handleLogout = () =>
  {
    logout();
    navigate('/login');
  };

  const navigateTo = (path) =>
  {
    navigate(path);
    closeDrawer();
  };

  return (
    <div className="min-h-screen bg-black">

      <div className="w-full px-5 py-4 border-b border-white flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="border-2 border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-colors"
        >
          <div className="text-xl font-bold leading-tight tracking-wider">AR</div>
          <div className="text-xl font-bold leading-tight tracking-wider">EA</div>
        </button>

        <button
          onClick={toggleDrawer}
          className="flex flex-col gap-1 p-2 hover:opacity-70 transition-opacity"
        >
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40"
          onClick={closeDrawer}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-80 bg-black border-l border-white z-50 transform transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 h-full flex flex-col">

          <button
            onClick={() => navigateTo('/dashboard')}
            className="text-white text-lg font-bold text-left mb-5 hover:text-gray-300 transition-colors"
          >
            Dashboard
          </button>

          <div className="border-t border-white my-5" />

          <button
            onClick={() => navigateTo('/workflows')}
            className="text-white text-lg font-bold text-left mb-5 hover:text-gray-300 transition-colors"
          >
            My Workflows
          </button>

          <div className="border-t border-white my-5" />

          <button
            onClick={() => navigateTo('/services')}
            className="text-white text-lg font-bold text-left mb-5 hover:text-gray-300 transition-colors"
          >
            Services
          </button>

          <div className="border-t border-white my-5" />

          <div className="flex-grow" />

          <button
            onClick={handleLogout}
            className="w-full py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>

        </div>
      </div>

      <main>
        {children}
      </main>

    </div>
  );
};


export default Layout;
