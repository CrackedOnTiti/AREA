import React from 'react';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/ui/PageHeader';
import ServiceCard from '../components/features/ServiceCard';
import { useServices } from '../hooks/useServices';
import { connectService } from '../services/servicesService';


const OAUTH_SERVICES = ['gmail', 'facebook', 'github', 'spotify'];


const ServicesPage = () =>
{
  const { services, connections, loading, error } = useServices();

  const isConnected = (serviceName) =>
  {
    return connections.some(conn =>
      conn.service_name.toLowerCase() === serviceName.toLowerCase()
    );
  };

  const requiresOAuth = (serviceName) =>
  {
    return OAUTH_SERVICES.includes(serviceName.toLowerCase());
  };

  const handleConnect = (serviceName) =>
  {
    connectService(serviceName);
  };

  return (
    <Layout>

      <div className="max-w-7xl mx-auto px-4 py-12">

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

        {!loading && !error && services.length === 0 && (
          <div className="text-center text-gray-400 text-xl">
            No services available
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isConnected={isConnected(service.name)}
                requiresOAuth={requiresOAuth(service.name)}
                onConnect={handleConnect}
              />
            ))}
          </div>
        )}

      </div>

    </Layout>
  );
};


export default ServicesPage;
