import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/chat-room';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  },
});

export const getChatRooms = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    throw error;
  }
};

export const createChatRoom = async (tradeId, sellerId) => {
  try {
    const response = await api.post('/', { trade_id: tradeId, seller_id: sellerId });
    return response.data;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

export const getMessages = async (chatRoomId) => {
  try {
    const response = await api.get(`/${chatRoomId}/messages/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (chatRoomId, content) => {
  try {
    const response = await api.post(`/${chatRoomId}/messages/create/`, { content });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const uploadAttachment = async (messageId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/messages/${messageId}/attachments/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

export default {
  getChatRooms,
  createChatRoom,
  getMessages,
  sendMessage,
  uploadAttachment
};