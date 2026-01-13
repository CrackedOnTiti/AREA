import { useState, useEffect } from 'react';
import { getAreas } from '../services/areasService';


export const useWorkflows = () =>
{
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() =>
  {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () =>
  {
    try
    {
      setLoading(true);
      setError(null);

      const data = await getAreas();
      setWorkflows(data.areas || []);
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

  return { workflows, loading, error, refetch: fetchWorkflows };
};
