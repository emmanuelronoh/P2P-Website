import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  const verifyToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const response = await axios.get('http://127.0.0.1:8000/api/auth/validate-token', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.valid;
    } catch (error) {
      return false;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    const isValid = await verifyToken();
    if (!isValid) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const userData = localStorage.getItem('userData');
    try {
      setState({
        user: JSON.parse(userData),
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (e) {
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Failed to parse user data',
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
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to update authentication state',
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
      error: null,
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
        verifyToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Move loadData outside of AuthProvider if you want it to be independent
export function loadData() {
  const userData = localStorage.getItem('userData');
  try {
    return JSON.parse(userData);
  } catch (e) {
    return null;
  }
}

// ✅ Export the custom hook
export function useAuth() {
  return useContext(AuthContext);
}
// import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
// import axios from 'axios';

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [state, setState] = useState({
//     user: null,
//     isAuthenticated: false,
//     loading: true,
//     error: null,
//   });

//   // Define logout first since it's used in the interceptor
//   const logout = useCallback(() => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('userData');

//     setState({
//       user: null,
//       isAuthenticated: false,
//       loading: false,
//       error: null,
//     });
//   }, []);

//   // Create stable axios instance with useMemo
//   const api = useMemo(() => {
//     const instance = axios.create({
//       baseURL: 'http://127.0.0.1:8000/api',
//     });

//     // Add request interceptor to include access token
//     instance.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem('accessToken');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     // Add response interceptor to handle token refresh
//     instance.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         const originalRequest = error.config;
        
//         if (error.response?.status === 401 && !originalRequest._retry) {
//           originalRequest._retry = true;
          
//           try {
//             const refreshToken = localStorage.getItem('refreshToken');
//             if (!refreshToken) throw new Error('No refresh token');
            
//             const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
//               refresh: refreshToken
//             });
            
//             const { access } = response.data;
//             localStorage.setItem('accessToken', access);
            
//             originalRequest.headers.Authorization = `Bearer ${access}`;
//             return instance(originalRequest);
//           } catch (err) {
//             logout(); // Now logout is defined
//             return Promise.reject(err);
//           }
//         }
        
//         return Promise.reject(error);
//       }
//     );

//     return instance;
//   }, [logout]); // Add logout to dependencies

//   const verifyToken = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) return false;

//       const response = await api.get('/auth/validate-token');
//       return response.data.valid;
//     } catch (error) {
//       return false;
//     }
//   }, [api]);

//   const initializeAuth = useCallback(async () => {
//     const isValid = await verifyToken();
//     if (!isValid) {
//       setState((prev) => ({ ...prev, loading: false }));
//       return;
//     }

//     const userData = localStorage.getItem('userData');
//     const refreshToken = localStorage.getItem('refreshToken');
    
//     try {
//       setState({
//         user: JSON.parse(userData),
//         isAuthenticated: true,
//         loading: false,
//         error: null,
//       });
      
//       if (!refreshToken) {
//         logout();
//       }
//     } catch (e) {
//       setState({
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: 'Failed to parse user data',
//       });
//     }
//   }, [verifyToken, logout]);

//   const login = useCallback(async (authData) => {
//     try {
//       if (!authData.access || !authData.refresh || !authData.user) {
//         throw new Error('Invalid authentication data');
//       }

//       localStorage.setItem('accessToken', authData.access);
//       localStorage.setItem('refreshToken', authData.refresh);
//       localStorage.setItem('userData', JSON.stringify(authData.user));

//       setState({
//         user: authData.user,
//         isAuthenticated: true,
//         loading: false,
//         error: null,
//       });
//     } catch (error) {
//       setState((prev) => ({
//         ...prev,
//         error: error.message || 'Failed to update authentication state',
//       }));
//       throw error;
//     }
//   }, []);

//   // Run initializeAuth only once on mount
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
//         api,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }