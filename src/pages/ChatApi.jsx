import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/chat-room';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { 
          refresh_token: refreshToken 
        });
        
        const { accessToken, refresh_token } = response.data;
        
        // Store the new tokens
        localStorage.setItem('accessToken', accessToken);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle common error scenarios
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with a status code outside 2xx
    console.error('API Error:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
    
    if (error.response.status === 401) {
      // Special handling for unauthorized (token may be invalid)
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  } else if (error.request) {
    // Request was made but no response received
    console.error('API Request Error:', error.request);
  } else {
    // Something happened in setting up the request
    console.error('API Setup Error:', error.message);
  }
  
  throw error;
};

export const getChatRooms = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createChatRoom = async (tradeId, sellerId) => {
  try {
    const response = await api.post('/', { 
      trade_id: tradeId, 
      seller_id: sellerId 
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMessages = async (chatRoomId) => {
  try {
    const response = await api.get(`/${chatRoomId}/messages/`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const sendMessage = async (chatRoomId, content) => {
  try {
    const response = await api.post(`/${chatRoomId}/messages/create/`, { 
      content,
      chat_room: chatRoomId  // Add the chat_room field with the chatRoomId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const uploadAttachment = async (messageId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(
      `/messages/${messageId}/attachments/`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export default {
  getChatRooms,
  createChatRoom,
  getMessages,
  sendMessage,
  uploadAttachment
};