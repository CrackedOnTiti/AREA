import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

/**
 * Login Page Component
 * Allows users to login with username/email and password
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    identifier: '', // Can be username OR email
    password: '',
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('error');

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier || !formData.identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Ensure we're passing strings
      const usernameOrEmail = String(formData.identifier).trim();
      const userPassword = String(formData.password);

      console.log('Attempting login with:', usernameOrEmail); // Debug log
      
      // Call API
      const response = await loginService(usernameOrEmail, userPassword);

      console.log('Login successful:', response); // Debug log

      // Store token and user in context + localStorage
      login(response.token, response.user);

      // Show success message
      setAlertType('success');
      setAlertMessage('Login successful! Redirecting...');

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-600 mb-2">
              AREA
            </h1>
            <p className="text-gray-600">
              Sign in to your account
            </p>
          </div>

          {/* Alert Message */}
          {alertMessage && (
            <Alert 
              type={alertType} 
              message={alertMessage}
              onClose={() => setAlertMessage(null)}
            />
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Username or Email"
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              error={errors.identifier}
              placeholder="Enter your username or email"
              required
              autoComplete="username"
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />

            {/* Forgot Password Link */}
            <div className="text-right mb-6">
              <Link 
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                tabIndex={loading ? -1 : 0}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                or
              </span>
            </div>
          </div>

          {/* OAuth Buttons (Placeholder for now) */}
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="OAuth2 not yet implemented"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google (Coming Soon)
            </button>

            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="OAuth2 not yet implemented"
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook (Coming Soon)
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                tabIndex={loading ? -1 : 0}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2025 AREA. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;