/**
 * Authentication Service - Handles all API calls to Flask backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Login user with username/email and password
 * @param {Object} credentials - { username OR email, password }
 * @returns {Promise<Object>} - { token, user }
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data; // { message, token, user }
  } catch (error) {
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - { username, email, password }
 * @returns {Promise<Object>} - { token, user }
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data; // { message, token, user }
  } catch (error) {
    throw error;
  }
};

/**
 * Get current authenticated user
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - { user }
 */
export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user info');
    }

    return data; // { user }
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user (clear localStorage)
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get stored token from localStorage
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Store token in localStorage
 * @param {string} token
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Get stored user from localStorage
 * @returns {Object|null}
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Store user in localStorage
 * @param {Object} user
 */
export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};