import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './utils/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import JobDetailPage from './pages/JobDetailPage';
import AddEditJobPage from './pages/AddEditJobPage';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {isAuthenticated && (
          <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        )}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
            } 
          />
          <Route 
            path="/verify-otp" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <OTPVerificationPage />
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/job/:id" 
            element={
              <ProtectedRoute>
                <JobDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-job" 
            element={
              <ProtectedRoute>
                <AddEditJobPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-job/:id" 
            element={
              <ProtectedRoute>
                <AddEditJobPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ApolloProvider>
  );
};

export default App;
