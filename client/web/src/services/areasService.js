const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getAreas = async () => {
  try {
    const response = await fetch(`${API_URL}/api/areas`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch workflows');
    }

    return await response.json();
  } catch (error) {
    console.error('Get areas error:', error);
    throw error;
  }
};

export const createArea = async (areaData) => {
  try {
    const response = await fetch(`${API_URL}/api/areas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(areaData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create workflow');
    }

    return await response.json();
  } catch (error) {
    console.error('Create area error:', error);
    throw error;
  }
};

export const deleteArea = async (areaId) => {
  try {
    const response = await fetch(`${API_URL}/api/areas/${areaId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete workflow');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete area error:', error);
    throw error;
  }
};

export const toggleArea = async (areaId) => {
  try {
    const response = await fetch(`${API_URL}/api/areas/${areaId}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle workflow');
    }

    return await response.json();
  } catch (error) {
    console.error('Toggle area error:', error);
    throw error;
  }
};

export const updateArea = async (areaId, data) => {
  try {
    const response = await fetch(`${API_URL}/api/areas/${areaId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update workflow');
    }

    return await response.json();
  } catch (error) {
    console.error('Update area error:', error);
    throw error;
  }
};
