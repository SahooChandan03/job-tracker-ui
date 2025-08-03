import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token) {
      if (userData) {
        // Restore full user data from localStorage
        setUser({ ...JSON.parse(userData), token });
      } else {
        // Fallback to just token if no user data
        setUser({ token });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Login always requires OTP verification
      return { 
        success: false, 
        requiresOTP: true,
        message: response.data.message || 'Please verify your OTP to continue',
        attemptsRemaining: response.data.attempts_remaining
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (email, password, first_name, last_name) => {
    try {
      const response = await authAPI.register({ email, password, first_name, last_name });
      
      // Registration always requires OTP verification
      return { 
        success: false, 
        requiresOTP: true,
        message: response.data.message || 'Please verify your OTP to continue',
        attemptsRemaining: response.data.attempts_remaining
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const verifyOTP = async (email, otp, module = 'register') => {
    try {
      const response = await authAPI.verifyOTP({ email, code: otp, module });
      
      if (response.data.access_token) {
        // Store token and user data
        const { access_token, user: userData } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser({ ...userData, token: access_token });
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'OTP verification failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'OTP verification failed' 
      };
    }
  };

  const resendOTP = async (email, module = 'register') => {
    try {
      const response = await authAPI.resendOTP({ email, module });
      
      if (response.data.message) {
        return { 
          success: true,
          message: response.data.message,
          attemptsRemaining: response.data.attempts_remaining
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Failed to resend OTP' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to resend OTP' 
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword({ email });
      
      if (response.data.message) {
        return { 
          success: true,
          message: response.data.message,
          attemptsRemaining: response.data.attempts_remaining
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Failed to send reset OTP' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to send reset OTP' 
      };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await authAPI.resetPassword({ 
        email, 
        code: otp, 
        new_password: newPassword 
      });
      
      if (response.data.message) {
        // Logout user after password reset
        logout();
        return { success: true, message: response.data.message };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Failed to reset password' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to reset password' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 