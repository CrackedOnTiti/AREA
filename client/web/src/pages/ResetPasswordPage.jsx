import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // 'request' or 'success'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('error');

  const handleSubmit = async (e) => {
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
      // TODO: Implement actual API call when backend supports password reset
      // const response = await fetch('http://localhost:8080/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // For now, simulate success after delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAlertType('success');
      setAlertMessage('Password reset instructions sent to your email');
      setStep('success');

    } catch (error) {
      console.error('Reset password error:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'Failed to send reset email. Please try again.');
    } finally {
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
            {step === 'request' ? 'Reset your password' : 'Check your email'}
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

        {step === 'request' ? (
          <form onSubmit={handleSubmit} noValidate>
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
        ) : (
          <div className="text-center">
            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <p className="text-gray-300 text-sm">
                We've sent password reset instructions to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Please check your email and follow the link to reset your password.
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
