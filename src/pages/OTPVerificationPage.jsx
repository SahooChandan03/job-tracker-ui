import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import OTPInput from '../components/OTPInput';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const isSubmittingRef = useRef(false);
  
  // Get email and module from location state
  const email = location.state?.email;
  const module = location.state?.module || 'register'; // 'register', 'login', 'forgetpassword', 'resetpassword'

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    // Start countdown for resend
    setCountdown(30);
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOTPChange = (value) => {
    setOtp(value);
    setError('');
  };

  const handleOTPComplete = async (value) => {
    if (value.length === 6 && !loading) {
      await handleSubmit(value);
    }
  };

  const handleSubmit = async (otpValue = otp) => {
    if (otpValue.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    // Prevent multiple submissions
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(email, otpValue, module);
      
      if (result.success) {
        if (module === 'resetpassword') {
          // For password reset flow, redirect to reset password page
          navigate('/reset-password', { 
            state: { 
              email,
              otp: otpValue
            } 
          });
        } else {
          // For registration/login flow, redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const result = await resendOTP(email, module);
      
      if (result.success) {
        setCountdown(30);
        setOtp('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const getTitle = () => {
    if (module === 'resetpassword') return 'Verify Reset OTP';
    if (module === 'register') return 'Verify Your Email';
    if (module === 'login') return 'Verify Your Login';
    return 'Verify OTP';
  };

  const getSubtitle = () => {
    if (module === 'resetpassword') return 'Enter the 6-digit code sent to your email to reset your password';
    if (module === 'register') return 'We\'ve sent a 6-digit verification code to your email';
    if (module === 'login') return 'Enter the 6-digit verification code sent to your email';
    return 'Enter the 6-digit verification code sent to your email';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <EnvelopeIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {getTitle()}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {getSubtitle()}
          </p>
          <p className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-white">
            {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => { 
          e.preventDefault(); 
          if (!loading && otp.length === 6) {
            handleSubmit(); 
          }
        }}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <OTPInput
              value={otp}
              onChange={handleOTPChange}
              onComplete={handleOTPComplete}
              error={error}
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || resendLoading}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                ) : countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  'Resend OTP'
                )}
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerificationPage; 