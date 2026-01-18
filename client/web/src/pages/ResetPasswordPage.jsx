import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [step, setStep] = useState(token ? 'reset' : 'request');
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('error');

  // Request Password Reset (Step 1)
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!email.trim()) {
      setAlertType('error');
      setAlertMessage('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAlertType('error');
      setAlertMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setAlertType('success');
      setAlertMessage(data.message || 'Password reset instructions sent to your email');
      setStep('success');

    } catch (error) {
      console.error('Reset password error:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password with Token (Step 2)
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setAlertType('error');
      setAlertMessage('Please fill in all fields');
      return;
    }

    if (formData.newPassword.length < 8) {
      setAlertType('error');
      setAlertMessage('Password must be at least 8 characters');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(formData.newPassword)) {
      setAlertType('error');
      setAlertMessage('Password must contain uppercase, lowercase, and special character');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setAlertType('error');
      setAlertMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          password: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setAlertType('success');
      setAlertMessage(data.message || 'Password successfully reset');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Reset password error:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            {step === 'request' && 'Reset your password'}
            {step === 'success' && 'Check your email'}
            {step === 'reset' && 'Create new password'}
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

        {/* Step 1: Request Reset Email */}
        {step === 'request' && (
          <form onSubmit={handleRequestSubmit} noValidate>
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* Step 2: Success - Email Sent */}
        {step === 'success' && (
          <div className="text-center">
            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <p className="text-gray-300 text-sm">
                We've sent password reset instructions to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Please check your email and follow the link to reset your password.
              </p>
              <p className="text-gray-500 text-xs mt-3">
                The link will expire in 1 hour.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Step 3: Reset Password with Token */}
        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} noValidate>
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                autoComplete="new-password"
                disabled={loading}
              />

              <p className="mt-2 text-xs text-gray-500">
                Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 special character
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-white hover:underline font-medium"
              tabIndex={loading ? -1 : 0}
            >
              Sign in
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

export default ResetPasswordPage;