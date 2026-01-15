import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Alert from '../components/Alert';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  
  // Change password form
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  const handleDisconnectService = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to disconnect ${serviceName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/connections/${serviceId}/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect service');
      }

      setAlertType('success');
      setAlertMessage(`Successfully disconnected from ${serviceName}`);
      fetchConnections(); // Refresh list
    } catch (error) {
      console.error('Error disconnecting service:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'Failed to disconnect service');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setAlertType('error');
      setAlertMessage('All password fields are required');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setAlertType('error');
      setAlertMessage('New password must be at least 8 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlertType('error');
      setAlertMessage('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      // TODO: Implement actual API call when backend supports password change
      // const token = localStorage.getItem('token');
      // const response = await fetch('http://localhost:8080/api/auth/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     current_password: passwordForm.currentPassword,
      //     new_password: passwordForm.newPassword
      //   })
      // });

      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAlertType('success');
      setAlertMessage('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);

    } catch (error) {
      console.error('Error changing password:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('This will permanently delete all your data, workflows, and service connections. Are you absolutely sure?')) {
      return;
    }

    try {
      // TODO: Implement actual API call when backend supports account deletion
      // const token = localStorage.getItem('token');
      // const response = await fetch('http://localhost:8080/api/auth/delete-account', {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      // For now, just logout
      logout();
      navigate('/login');

    } catch (error) {
      console.error('Error deleting account:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'Failed to delete account');
    }
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Password</h2>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  {showChangePassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showChangePassword && (
                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                      disabled={passwordLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                      disabled={passwordLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                      disabled={passwordLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
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
                      onClick={() => handleDisconnectService(service.service_id, service.display_name)}
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
              Once you delete your account, there is no going back. This will permanently delete all your workflows and data.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
