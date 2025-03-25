// src/api/offerService.js
import axios from 'axios';

const API_BASE_URL = 'YOUR_BACKEND_API_URL';

export const fetchOffers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/offers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching offers:", error);
    throw error;
  }
};

export const createOffer = async (offerData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/offers`, offerData);
    return response.data;
  } catch (error) {
    console.error("Error creating offer:", error);
    throw error;
  }
};

export const updateOffer = async (offerId, offerData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/offers/${offerId}`, offerData);
    return response.data;
  } catch (error) {
    console.error("Error updating offer:", error);
    throw error;
  }
};

export const deleteOffer = async (offerId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/offers/${offerId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting offer:", error);
    throw error;
  }
};

// ... other functions if you have them