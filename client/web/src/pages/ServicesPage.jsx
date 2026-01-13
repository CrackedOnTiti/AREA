// client/web/src/pages/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [servicesRes, connectionsRes] = await Promise.all([
        fetch('http://localhost:8080/api/services', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8080/api/connections', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const servicesData = await servicesRes.json();
      const connectionsData = await connectionsRes.json();

      setServices(servicesData.services || []);
      setConnections(connectionsData.connections || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load services' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (serviceName) => {
    const token = localStorage.getItem('token');
    
    if (serviceName === 'gmail') {
      window.location.href = `http://localhost:8080/api/connections/gmail?token=${token}`;
    } else {
      setAlert({ type: 'info', message: `${serviceName} connection coming soon!` });
    }
  };

  const handleDisconnect = async (serviceName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/connections/${serviceName}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setAlert({ type: 'success', message: `${serviceName} disconnected successfully` });
        loadData();
      } else {
        throw new Error('Disconnect failed');
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to disconnect service' });
    }
  };

  const isConnected = (serviceName) => {
    return connections.some(c => c.service_name === serviceName && c.is_connected);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Services</h1>

        {alert && (
          <div className="mb-6">
            <Alert {...alert} onClose={() => setAlert(null)} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => {
            const connected = isConnected(service.name);
            
            return (
              <div key={service.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{service.display_name}</h2>
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                  </div>
                  {connected && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Connected
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Actions: {service.actions?.length || 0}
                    </p>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {service.actions?.slice(0, 2).map(action => (
                        <li key={action.id}>{action.display_name}</li>
                      ))}
                      {service.actions?.length > 2 && (
                        <li className="text-blue-600">+{service.actions.length - 2} more...</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Reactions: {service.reactions?.length || 0}
                    </p>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {service.reactions?.slice(0, 2).map(reaction => (
                        <li key={reaction.id}>{reaction.display_name}</li>
                      ))}
                      {service.reactions?.length > 2 && (
                        <li className="text-blue-600">+{service.reactions.length - 2} more...</li>
                      )}
                    </ul>
                  </div>
                </div>

                {service.requires_oauth && (
                  <button
                    onClick={() => connected ? handleDisconnect(service.name) : handleConnect(service.name)}
                    className={`w-full py-2 px-4 rounded-lg font-medium ${
                      connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {connected ? 'Disconnect' : 'Connect'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;