const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Récupère le token JWT depuis localStorage
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Stocke le token JWT dans localStorage
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Supprime le token JWT de localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Récupère l'utilisateur stocké dans localStorage
 */
export const getStoredUser = () => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Stocke l'utilisateur dans localStorage
 */
export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Supprime l'utilisateur de localStorage
 */
export const removeStoredUser = () => {
  localStorage.removeItem('user');
};

/**
 * Inscription d'un nouvel utilisateur
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
    
    // Stocker le token et l'utilisateur
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
 * Connexion d'un utilisateur
 */
export const login = async (usernameOrEmail, password) => {
  try {
    const body = usernameOrEmail.includes('@')
      ? { email: usernameOrEmail, password }
      : { username: usernameOrEmail, password };

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
    
    // Stocker le token et l'utilisateur
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
 * Récupère l'utilisateur actuel depuis l'API
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
    
    // Mettre à jour l'utilisateur stocké
    if (data.user) {
      setStoredUser(data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    // Si le token est invalide, nettoyer le localStorage
    removeToken();
    removeStoredUser();
    throw error;
  }
};

/**
 * Déconnexion de l'utilisateur
 */
export const logout = () => {
  removeToken();
  removeStoredUser();
};

/**
 * Connexion avec Google (à implémenter)
 */
export const loginWithGoogle = async () => {
  // TODO: Implémenter OAuth2 Google
  console.warn('Google OAuth not implemented yet');
  throw new Error('Google OAuth not implemented yet');
};

/**
 * Connexion avec Facebook (à implémenter)
 */
export const loginWithFacebook = async () => {
  // TODO: Implémenter OAuth2 Facebook
  console.warn('Facebook OAuth not implemented yet');
  throw new Error('Facebook OAuth not implemented yet');
};