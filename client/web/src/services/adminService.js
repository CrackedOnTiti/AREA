import { getToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const getAllUsers = async () => {
  const token = getToken();

  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_URL}/api/admin/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch users');
  }

  return response.json();
};
