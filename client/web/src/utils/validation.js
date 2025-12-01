/**
 * Validation utilities for form inputs
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username) => {
  // Username: 3-20 characters, alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validatePassword = (password) => {
  // Password must be:
  // - At least 8 characters
  // - Max 128 characters
  // - Contains lowercase, uppercase, and special character
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' };
  }
  
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  
  if (!hasLower || !hasUpper || !hasSpecial) {
    return { 
      valid: false, 
      error: 'Password must contain lowercase, uppercase, and special character' 
    };
  }
  
  return { valid: true, error: null };
};