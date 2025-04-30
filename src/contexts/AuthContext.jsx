
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create context outside the provider
const AuthContext = createContext();

// Create a custom hook that checks the context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  const verifyToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const response = await axios.get('http://localhost:8000/api/auth/validate-token', {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.valid;
    } catch (error) {
      return false;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    const isValid = await verifyToken();
    if (!isValid) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    const userData = localStorage.getItem('userData');
    try {
      setState({
        user: JSON.parse(userData),
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (e) {
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Failed to parse user data'
      });
    }
  }, [verifyToken]);

  const login = useCallback(async (authData) => {
    try {
      localStorage.setItem('accessToken', authData.token);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('userData', JSON.stringify(authData.user));

      setState({
        user: authData.user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to update authentication state'
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        verifyToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Correct export
export { useAuth };

