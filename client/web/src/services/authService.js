const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Get the token JWT from localStorage
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Store the token JWT in localStorage
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove the token JWT from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get the user stored in localStorage
 */
export const getStoredUser = () => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Store the user in localStorage
 */
export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove the user from localStorage
 */
export const removeStoredUser = () => {
  localStorage.removeItem('user');
};

/**
 * Register a new user
 */
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    
    // Store the token and user
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setStoredUser(data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Login a user
 * @param {string} usernameOrEmail - Username or email (as a STRING)
 * @param {string} password - Password
 */
export const login = async (usernameOrEmail, password) => {
  try {
    // Make sure usernameOrEmail is a string
    if (typeof usernameOrEmail !== 'string') {
      console.error('usernameOrEmail is not a string:', usernameOrEmail);
      throw new Error('Invalid login credentials format');
    }

    // Determine if the identifier is an email or username
    const isEmail = usernameOrEmail.includes('@');
    const body = isEmail
      ? { email: usernameOrEmail, password }
      : { username: usernameOrEmail, password };

    console.log('Login request body:', body); // Debug log

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store the token and user
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setStoredUser(data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get the current user from the API
 */
export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
    
    // Update the stored user
    if (data.user) {
      setStoredUser(data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    // If the token is invalid, clean localStorage
    removeToken();
    removeStoredUser();
    throw error;
  }
};

/**
 * Logout the user
 */
export const logout = () => {
  removeToken();
  removeStoredUser();
};

/**
 * Login with Google (to be implemented)
 */
export const loginWithGoogle = async () => {
  // TODO: Implement OAuth2 Google
  console.warn('Google OAuth not implemented yet');
  throw new Error('Google OAuth not implemented yet');
};

/**
 * Login with Facebook (to be implemented)
 */
export const loginWithFacebook = async () => {
  // TODO: Implement OAuth2 Facebook
  console.warn('Facebook OAuth not implemented yet');
  throw new Error('Facebook OAuth not implemented yet');
};