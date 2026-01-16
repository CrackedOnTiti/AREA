import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) =>
{
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isAdmin = user?.id === 1;

  const toggleMenu = () =>
  {
    setMenuOpen(!menuOpen);
  };

  const navigateTo = (path) =>
  {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = () =>
  {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <nav className="bg-black border-b border-white p-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="group flex items-center space-x-4"
        >
          <div className="border-2 border-white p-2 bg-black group-hover:bg-white transition-colors">
            <div className="text-white group-hover:text-black text-xl font-bold leading-tight transition-colors">
              AR
            </div>
            <div className="text-white group-hover:text-black text-xl font-bold leading-tight transition-colors">
              EA
            </div>
          </div>
          <span className="text-xl font-bold group-hover:text-gray-300 transition-colors">AREA</span>
        </button>

        <button
          onClick={toggleMenu}
          className="text-white text-2xl focus:outline-none"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {/* Sliding Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-black border-l border-white z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
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

          <button
            onClick={() => navigateTo('/profile')}
            className="text-white text-lg font-bold text-left mb-5 hover:text-gray-300 transition-colors"
          >
            Profile
          </button>

          {isAdmin && (
            <>
              <div className="border-t border-white my-5" />

              <button
                onClick={() => navigateTo('/admin')}
                className="text-yellow-500 text-lg font-bold text-left mb-5 hover:text-yellow-400 transition-colors"
              >
                Admin
              </button>
            </>
          )}

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
