const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getServices = async () => {
  try {
    const response = await fetch(`${API_URL}/api/services`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch services');
    }

    return await response.json();
  } catch (error) {
    console.error('Get services error:', error);
    throw error;
  }
};

export const getUserConnections = async () => {
  try {
    const response = await fetch(`${API_URL}/api/connections`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch connections');
    }

    return await response.json();
  } catch (error) {
    console.error('Get connections error:', error);
    throw error;
  }
};

export const connectService = (serviceName) =>
{
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found for OAuth connection');
    return;
  }
  
  // Redirect to the OAuth endpoint with token as query parameter
  window.location.href = `${API_URL}/api/connections/${serviceName.toLowerCase()}?token=${encodeURIComponent(token)}`;
};

export const disconnectService = async (serviceName) => {
  const name = serviceName.toLowerCase();
  const endpoint = (name === 'drive' || name === 'google') ? 'gmail' : name;

  try {
    const response = await fetch(`${API_URL}/api/connections/${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to disconnect service');
    }

    return await response.json();
  } catch (error) {
    console.error('Disconnect service error:', error);
    throw error;
  }
};
