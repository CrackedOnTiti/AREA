import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/ui/PageHeader';
import ConnectedServiceItem from '../components/features/ConnectedServiceItem';
import ServiceCategory from '../components/features/ServiceCategory';
import { useServices } from '../hooks/useServices';
import { connectService, disconnectService } from '../services/servicesService';
import { OAUTH_SERVICES, SERVICE_CATEGORIES } from '../utils/constants';


const ServicesPage = () =>
{
  const { services, connections, loading, error, refetch } = useServices();
  const [connectingService, setConnectingService] = useState(null);
  const [disconnectingService, setDisconnectingService] = useState(null);

  const isConnected = (serviceName) =>
  {
    if (!serviceName) return false;

    const name = serviceName.toLowerCase();

    // Gmail and Drive share the same OAuth token - if one is disconnected, both are
    if (name === 'drive' || name === 'gmail') {
      const gmailConn = connections.find(c => c.service_name?.toLowerCase() === 'gmail');
      const driveConn = connections.find(c => c.service_name?.toLowerCase() === 'drive');
      return (gmailConn?.is_connected && driveConn?.is_connected) || false;
    }

    const connection = connections.find(conn =>
      conn.service_name && conn.service_name.toLowerCase() === name
    );
    return connection ? connection.is_connected : false;
  };

  const requiresOAuth = (serviceName) =>
  {
    return OAUTH_SERVICES.includes(serviceName.toLowerCase());
  };

  const handleConnect = (serviceName) =>
  {
    setConnectingService(serviceName);
    connectService(serviceName);
  };

  const handleDisconnect = async (serviceName) =>
  {
    setDisconnectingService(serviceName);
    try
    {
      await disconnectService(serviceName);
      await refetch();
    }
    catch (err)
    {
      console.error('Failed to disconnect:', err);
    }
    finally
    {
      setDisconnectingService(null);
    }
  };

  const connectedServices = services.filter(s => isConnected(s.name));
  const availableServices = services.filter(s => !isConnected(s.name) && requiresOAuth(s.name));

  const getServicesForCategory = (categoryServices) =>
  {
    return availableServices.filter(s =>
      categoryServices.includes(s.name.toLowerCase())
    );
  };

  return (
    <Layout>

      <div className="max-w-4xl mx-auto px-4 py-12">

        <PageHeader
          title="Services"
          subtitle="Connect your accounts to create workflows"
        />

        {loading && (
          <div className="text-center text-white text-xl">
            Loading services...
          </div>
        )}

        {error && (
          <div className="bg-black border border-red-500 text-red-400 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-10">

            <ConnectedServicesSection
              services={connectedServices}
              disconnectingService={disconnectingService}
              onDisconnect={handleDisconnect}
            />

            <AvailableServicesSection
              categories={SERVICE_CATEGORIES}
              getServicesForCategory={getServicesForCategory}
              connectingService={connectingService}
              onConnect={handleConnect}
            />

          </div>
        )}

      </div>

    </Layout>
  );
};


const ConnectedServicesSection = ({ services, disconnectingService, onDisconnect }) =>
{
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">
        Your Connected Services
      </h2>

      {services.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No services connected yet. Connect a service below to start creating workflows.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((service) => (
            <ConnectedServiceItem
              key={service.id || service.name}
              service={service}
              isDisconnecting={disconnectingService === service.name}
              onDisconnect={onDisconnect}
            />
          ))}
        </div>
      )}
    </section>
  );
};


const AvailableServicesSection = ({ categories, getServicesForCategory, connectingService, onConnect }) =>
{
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">
        Available Services
      </h2>

      <div className="space-y-3">
        {categories.map((category) => (
          <ServiceCategory
            key={category.key}
            title={category.title}
            services={getServicesForCategory(category.services)}
            isConnecting={connectingService}
            onConnect={onConnect}
          />
        ))}
      </div>
    </section>
  );
};


export default ServicesPage;
