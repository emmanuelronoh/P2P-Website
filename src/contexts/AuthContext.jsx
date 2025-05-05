import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create context outside the provider
const AuthContext = createContext();

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

  const verifyToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return false;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/auth/validate-token/', {  // Added trailing slash
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (!response.data?.valid) {
        logout();
        return false;
      }
      
      return true;
    } catch (error) {
      // Don't logout on network errors, only on 401
      if (error.response?.status === 401) {
        logout();
      }
      return false;
    }
  }, [logout]);

  const initializeAuth = useCallback(async () => {
    try {
      const isValid = await verifyToken();
      if (!isValid) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const userData = localStorage.getItem('userData');
      if (!userData) {
        logout();
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setState({
          user: parsedUser,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      } catch (e) {
        console.error('Failed to parse user data:', e);
        logout();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize authentication'
      }));
    }
  }, [verifyToken, logout]);

  const login = useCallback(async (authData) => {
    try {
      // More comprehensive validation
      if (!authData || !authData.accessToken || !authData.refreshToken || !authData.user) {
        throw new Error('Invalid authentication data structure');
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('userData', JSON.stringify(authData.user));

      // Update state
      setState({
        user: authData.user,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      // Return success
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to login'
      }));
      throw error;
    }
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

export { useAuth };

// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [state, setState] = useState({
//     user: null,
//     isAuthenticated: false,
//     loading: true,
//     error: null
//   });

//   const verifyToken = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) return false;

//       const response = await axios.get('http://127.0.0.1:8000/api/auth/validate-token/', {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       return response.data.valid;
//     } catch (error) {
//       return false;
//     }
//   }, []);

//   const initializeAuth = useCallback(async () => {
//     const isValid = await verifyToken();
//     if (!isValid) {
//       setState(prev => ({ ...prev, loading: false }));
//       return;
//     }

//     const userData = localStorage.getItem('userData');
//     try {
//       setState({
//         user: JSON.parse(userData),
//         isAuthenticated: true,
//         loading: false,
//         error: null
//       });
//     } catch (e) {
//       setState({
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: 'Failed to parse user data'
//       });
//     }
//   }, [verifyToken]);

//   const login = useCallback(async (authData) => {
//     try {
//       // Store both tokens and user data
//       localStorage.setItem('accessToken', authData.accessToken);
//       localStorage.setItem('refreshToken', authData.refreshToken);
//       localStorage.setItem('userData', JSON.stringify(authData.user));

//       setState({
//         user: authData.user,
//         isAuthenticated: true,
//         loading: false,
//         error: null
//       });
//     } catch (error) {
//       setState(prev => ({
//         ...prev,
//         error: 'Failed to update authentication state'
//       }));
//       throw error;
//     }
//   }, []);

//   const logout = useCallback(() => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('userData');

//     setState({
//       user: null,
//       isAuthenticated: false,
//       loading: false,
//       error: null
//     });
//   }, []);

//   const refreshToken = useCallback(async () => {
//     try {
//       const refreshToken = localStorage.getItem('refreshToken');
//       if (!refreshToken) {
//         throw new Error('No refresh token available');
//       }

//       const response = await axios.post('http://127.0.0.1:8000/api/auth/refresh-token/', {
//         refreshToken
//       });

//       // Update stored tokens
//       localStorage.setItem('accessToken', response.data.accessToken);
      
//       // Store new refresh token if provided (recommended for security)
//       if (response.data.refreshToken) {
//         localStorage.setItem('refreshToken', response.data.refreshToken);
//       }

//       return response.data.accessToken;
//     } catch (error) {
//       logout();
//       throw error;
//     }
//   }, [logout]);

//   // Add axios interceptors
//   useEffect(() => {
//     // Request interceptor to add token to headers
//     const requestInterceptor = axios.interceptors.request.use(
//       config => {
//         const token = localStorage.getItem('accessToken');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       error => Promise.reject(error)
//     );

//     // Response interceptor to handle token refresh
//     const responseInterceptor = axios.interceptors.response.use(
//       response => response,
//       async error => {
//         const originalRequest = error.config;
        
//         // If 401 error and not a login/refresh request
//         if (error.response?.status === 401 && 
//             !originalRequest.url.includes('/api/auth/') &&
//             !originalRequest._retry) {
          
//           originalRequest._retry = true;
//           try {
//             const newToken = await refreshToken();
//             originalRequest.headers.Authorization = `Bearer ${newToken}`;
//             return axios(originalRequest);
//           } catch (refreshError) {
//             logout();
//             return Promise.reject(refreshError);
//           }
//         }
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       axios.interceptors.request.eject(requestInterceptor);
//       axios.interceptors.response.eject(responseInterceptor);
//     };
//   }, [refreshToken, logout]);

//   useEffect(() => {
//     initializeAuth();
//   }, [initializeAuth]);

//   return (
//     <AuthContext.Provider
//       value={{
//         ...state,
//         login,
//         logout,
//         verifyToken,
//         refreshToken
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export { useAuth };