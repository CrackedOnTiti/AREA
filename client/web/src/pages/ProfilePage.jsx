import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Alert from '../components/Alert';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/connections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }

      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setAlertType('error');
      setAlertMessage('Failed to load service connections');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectService = async (serviceName, displayName) => {
    if (!window.confirm(`Are you sure you want to disconnect ${displayName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Use service-specific disconnect endpoint (e.g., /api/connections/gmail)
      const response = await fetch(`http://localhost:8080/api/connections/${serviceName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to disconnect service');
      }

      setAlertType('success');
      setAlertMessage(`Successfully disconnected from ${displayName}`);
      fetchConnections(); // Refresh list
    } catch (error) {
      console.error('Error disconnecting service:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'Failed to disconnect service');
    }
  };

  const handleChangePassword = () => {
    // Redirect to password reset page (uses existing backend endpoints)
    navigate('/reset-password');
  };

  const handleDeleteAccount = () => {
    setAlertType('error');
    setAlertMessage('Account deletion is not yet available. Please contact support to delete your account.');
  };

  const connectedServices = connections.filter(c => c.is_connected);

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-gray-400">Manage your account settings and connected services</p>
          </div>

          {alertMessage && (
            <div className="mb-6">
              <Alert
                type={alertType}
                message={alertMessage}
                onClose={() => setAlertMessage(null)}
              />
            </div>
          )}

          {/* User Information Card */}
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Username</label>
                <p className="text-white font-medium">{user?.username || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white font-medium">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Account Type</label>
                <p className="text-white font-medium">
                  {user?.oauth_provider ? `OAuth (${user.oauth_provider})` : 'Email/Password'}
                </p>
              </div>
            </div>
          </div>

          {/* Change Password Section (only for non-OAuth users) */}
          {!user?.oauth_provider && (
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Password</h2>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Change Password
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Click "Change Password" to receive a password reset link via email
              </p>
            </div>
          )}

          {/* Connected Services Section */}
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Connected Services</h2>
            
            {loading ? (
              <p className="text-gray-400">Loading services...</p>
            ) : connectedServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No services connected yet</p>
                <button
                  onClick={() => navigate('/services')}
                  className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Connect Services
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {connectedServices.map((service) => (
                  <div
                    key={service.service_id}
                    className="flex items-center justify-between p-4 bg-black border border-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-white">{service.display_name}</h3>
                      <p className="text-sm text-gray-400">
                        Connected on {new Date(service.connected_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDisconnectService(service.service_name, service.display_name)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Disconnect
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-red-900/20 rounded-lg border border-red-700 p-6">
            <h2 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h2>
            <p className="text-gray-300 mb-4">
              Account deletion is not currently available. Please contact support if you need to delete your account.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled
              className="px-6 py-2 bg-red-600 text-white rounded-lg opacity-50 cursor-not-allowed font-medium"
            >
              Delete Account (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;