/**
 * API Client Service
 * Frontend API client for backend communication
 */

import axios from 'axios';
import facebookConfig from '../config/facebook.js';

const api = axios.create({
  baseURL: facebookConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log errors in development, and avoid logging network errors that might be transient
    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        // Handle API errors
        console.error('API Error:', error.response.data);
      } else if (error.request && !error.request.status) {
        // Only log network errors if they're not CORS-related (which we've fixed)
        // CORS errors will have error.request but no response
        if (!error.message.includes('CORS')) {
          console.debug('Network Error:', error.message);
        }
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

// Token status
export const getTokenStatus = () => {
  return api.get('/api/token/status');
};

// Asset sync
export const syncAssets = () => {
  return api.post('/api/sync-assets');
};

// Get assets
export const getPages = (businessId = null, userName = null) => {
  const params = {}
  if (businessId) params.business_id = businessId
  if (userName) params.user_name = userName
  return api.get('/api/pages', { params });
};

export const getAdAccounts = (businessId = null, userName = null) => {
  const params = {}
  if (businessId) params.business_id = businessId
  if (userName) params.user_name = userName
  return api.get('/api/ad-accounts', { params });
};

export const getBusinessManagers = (userName = null) => {
  const params = userName ? { user_name: userName } : {};
  return api.get('/api/business-managers', { params });
};

export const getPixels = (adAccountId, userName = null) => {
  const params = userName ? { user_name: userName } : {};
  return api.get(`/api/pixels/${adAccountId}`, { params });
};

export const getBusinessAssets = (businessId) => {
  return api.get(`/api/business-assets/${businessId}`);
};

export const getCurrentUser = () => {
  return api.get('/api/current-user');
};

export const getStats = () => {
  return api.get('/api/stats');
};

// User management
export const getAllUsers = () => {
  return api.get('/api/users');
};

export const addUserToken = (tokenData) => {
  return api.post('/api/users/add-token', tokenData);
};

export const syncUserAssets = (userId) => {
  return api.post(`/api/users/${userId}/sync-assets`);
};

export const deleteUser = (userId) => {
  return api.delete(`/api/users/${userId}`);
};

// Campaign creation
export const createCampaign = (data) => {
  return api.post('/api/campaigns/create', data);
};

export const createAdSet = (data) => {
  return api.post('/api/adsets/create', data);
};

export const uploadImage = (adAccountId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('adAccountId', adAccountId);
  
  return api.post('/api/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const createCreative = (data) => {
  return api.post('/api/creatives/create', data);
};

export const createCreativeWithPlacements = (data) => {
  return api.post('/api/creatives/create-with-placements', data);
};

export const createAd = (data) => {
  return api.post('/api/ads/create', data);
};

export const createFullCampaign = (data) => {
  return api.post('/api/campaigns/create-full', data);
};

export default api;
