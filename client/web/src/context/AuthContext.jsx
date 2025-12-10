import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, getStoredUser, setToken, setStoredUser, logout as logoutService } from '../services/authService';

// Create Context
const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Manages global authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const storedToken = getToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUser(storedUser);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login function
   * @param {string} tokenValue
   * @param {Object} userData
   */
  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setStoredUser(userData);
    setTokenState(tokenValue);
    setUser(userData);
  };

  /**
   * Logout function
   */
  const logout = () => {
    logoutService();
    setTokenState(null);
    setUser(null);
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};