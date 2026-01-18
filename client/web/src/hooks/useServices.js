import { useState, useEffect } from 'react';
import { getServices, getUserConnections } from '../services/servicesService';


export const useServices = () =>
{
  const [services, setServices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() =>
  {
    fetchData();
  }, []);

  const fetchData = async () =>
  {
    try
    {
      setLoading(true);
      setError(null);

      const [servicesData, connectionsData] = await Promise.all([
        getServices(),
        getUserConnections()
      ]);

      setServices(servicesData.services || []);
      setConnections(connectionsData.connections || []);
    }
    catch (err)
    {
      setError(err.message);
    }
    finally
    {
      setLoading(false);
    }
  };

  return { services, connections, loading, error, refetch: fetchData };
};
