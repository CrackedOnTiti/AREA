import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import googleIcon from '../assets/google-icon.png';
import facebookIcon from '../assets/facebook-icon.png';

const LoginPage = () =>
{
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('error');

  const handleChange = (e) =>
  {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name])
    {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () =>
  {
    const newErrors = {};

    if (!formData.identifier.trim())
    {
      newErrors.identifier = 'Username or email is required';
    }

    if (!formData.password)
    {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    setAlertMessage(null);

    if (!validateForm())
    {
      return;
    }

    setLoading(true);

    try
    {
      const response = await loginService(formData.identifier, formData.password);

      login(response.token, response.user);

      setAlertType('success');
      setAlertMessage('Login successful! Redirecting...');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
    catch (error)
    {
      console.error('Login error:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'Invalid credentials. Please try again.');
    }
    finally
    {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-block border-2 border-white p-3 mb-4">
            <div className="text-white text-3xl font-bold leading-tight">
              AR
            </div>
            <div className="text-white text-3xl font-bold leading-tight">
              EA
            </div>
          </div>

          <p className="text-gray-400">
            Sign in to your account
          </p>
        </div>

        {alertMessage && (
          <div className="mb-6">
            <Alert
              type={alertType}
              message={alertMessage}
              onClose={() => setAlertMessage(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Username or Email
            </label>

            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your username or email"
              className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
              autoComplete="username"
              disabled={loading}
            />

            {errors.identifier && (
              <p className="mt-2 text-sm text-red-400">{errors.identifier}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
              autoComplete="current-password"
              disabled={loading}
            />

            {errors.password && (
              <p className="mt-2 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <div className="text-right mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>

          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-gray-400">or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:8080/api/connections/google'}
            className="w-full px-6 py-3 bg-black border border-white text-white rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center justify-center gap-3"
          >
            <img src={googleIcon} alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:8080/api/connections/facebook'}
            className="w-full px-6 py-3 bg-black border border-white text-white rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center justify-center gap-3"
          >
            <img src={facebookIcon} alt="Facebook" className="w-5 h-5" />
            Continue with Facebook
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-white hover:underline font-medium"
              tabIndex={loading ? -1 : 0}
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="text-center mt-12 text-sm text-gray-600">
          <p>© 2025 AREA. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;