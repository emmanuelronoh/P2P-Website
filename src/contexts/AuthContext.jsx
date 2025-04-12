// import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import axios from 'axios';

// // Create the AuthContext
// const AuthContext = createContext();

// // Create axios instance for auth requests
// const authApi = axios.create({
//   baseURL: 'http://127.0.0.1:8000/api/auth/',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Verify token validity
//   const verifyToken = useCallback(async (token) => {
//     try {
//       const response = await authApi.post('validate-token/', { token });
//       return response.data?.valid || false;
//     } catch (error) {
//       console.error('Token verification failed:', error);
//       return false;
//     }
//   }, []);

//   // Fetch user data
//   const fetchUserData = useCallback(async (token) => {
//     try {
//       const response = await axios.get('http://127.0.0.1:8000/api/auth/user/', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       setUser(response.data);
//       setIsAuthenticated(true);
//       localStorage.setItem('userData', JSON.stringify(response.data));
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch user data:', error);
//       throw error;
//     }
//   }, []);

//   // Refresh access token
//   const refreshAccessToken = useCallback(async () => {
//     try {
//       const refreshToken = localStorage.getItem('refreshToken');
//       if (!refreshToken) throw new Error('No refresh token available');
      
//       const response = await authApi.post('token/refresh/', { refresh: refreshToken });
      
//       if (response.data?.access) {
//         localStorage.setItem('accessToken', response.data.access);
//         return response.data.access;
//       }
      
//       throw new Error('Failed to refresh token');
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       logout();
//       throw error;
//     }
//   }, []);

//   // Initialize auth state on app load
//   const initializeAuth = useCallback(async () => {
//     try {
//       const accessToken = localStorage.getItem('accessToken');
//       const refreshToken = localStorage.getItem('refreshToken');
//       const storedUser = localStorage.getItem('userData');
      
//       if (!accessToken || !refreshToken) {
//         setLoading(false);
//         return;
//       }

//       const isValid = await verifyToken(accessToken);
      
//       if (isValid) {
//         // Use stored user data for immediate UI update
//         if (storedUser) {
//           setUser(JSON.parse(storedUser));
//           setIsAuthenticated(true);
//         }
        
//         // Then fetch fresh user data
//         await fetchUserData(accessToken);
//       } else {
//         logout();
//       }
//     } catch (error) {
//       console.error('Auth initialization error:', error);
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchUserData, verifyToken]);

//   // Login function
//   const login = useCallback(async (email, password) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await authApi.post('login/', { email, password });
      
//       if (response.data?.accessToken && response.data?.refreshToken) {
//         localStorage.setItem('accessToken', response.data.accessToken);
//         localStorage.setItem('refreshToken', response.data.refreshToken);
        
//         // Store user data immediately
//         if (response.data.user) {
//           setUser(response.data.user);
//           localStorage.setItem('userData', JSON.stringify(response.data.user));
//           localStorage.setItem('userId', response.data.user.id || '');
//         }
        
//         setIsAuthenticated(true);
        
//         // Fetch complete user data in background
//         await fetchUserData(response.data.accessToken);
        
//         return true;
//       }
      
//       throw new Error('Login failed: Invalid response from server');
//     } catch (error) {
//       console.error('Login error:', error);
//       setError(error.response?.data?.error || error.message || 'Login failed');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchUserData]);

//   // Logout function - now returns a promise and doesn't navigate
//   const logout = useCallback(async () => {
//     try {
//       const refreshToken = localStorage.getItem('refreshToken');
//       if (refreshToken) {
//         await authApi.post('logout/', { refresh: refreshToken });
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('userData');
//       localStorage.removeItem('userId');
//       setUser(null);
//       setIsAuthenticated(false);
//       setError(null);
//     }
//   }, []);

//   // Register function
//   const register = useCallback(async (userData) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await authApi.post('register/', userData);
      
//       if (response.data?.accessToken && response.data?.refreshToken) {
//         localStorage.setItem('accessToken', response.data.accessToken);
//         localStorage.setItem('refreshToken', response.data.refreshToken);
        
//         if (response.data.user) {
//           setUser(response.data.user);
//           localStorage.setItem('userData', JSON.stringify(response.data.user));
//           localStorage.setItem('userId', response.data.user.id || '');
//         }
        
//         setIsAuthenticated(true);
        
//         await fetchUserData(response.data.accessToken);
        
//         return true;
//       }
      
//       throw new Error('Registration failed: Invalid response from server');
//     } catch (error) {
//       console.error('Registration error:', error);
//       setError(error.response?.data?.error || error.message || 'Registration failed');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchUserData]);

//   // Initialize auth on mount
//   useEffect(() => {
//     initializeAuth();
//   }, [initializeAuth]);

//   // Axios interceptors setup
//   useEffect(() => {
//     const requestInterceptor = axios.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem('accessToken');
//         if (token && !config.url.includes('auth/')) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     const responseInterceptor = axios.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         const originalRequest = error.config;
        
//         if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('auth/')) {
//           originalRequest._retry = true;
          
//           try {
//             const newAccessToken = await refreshAccessToken();
//             originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//             return axios(originalRequest);
//           } catch (refreshError) {
//             await logout();
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
//   }, [logout, refreshAccessToken]);

//   // Context value
//   const value = {
//     user,
//     isAuthenticated,
//     loading,
//     error,
//     login,
//     logout,
//     register,
//     refreshAccessToken,
//     setError,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create the AuthContext
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  const initializeAuth = useCallback(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('userData');
    
    if (accessToken && refreshToken && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user data:", e);
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  // Login function - now just handles state management
  const login = useCallback(async (authData) => {
    try {
      console.log("Updating auth context with:", authData);
      localStorage.setItem('accessToken', authData.token);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('userData', JSON.stringify(authData.user));
      
      setUser(authData.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error("Auth context update error:", error);
      setError("Failed to update authentication state");
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}