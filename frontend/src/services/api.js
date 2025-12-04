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
export const getPages = (businessId = null) => {
  return api.get('/api/pages', {
    params: businessId ? { business_id: businessId } : {}
  });
};

export const getAdAccounts = (businessId = null) => {
  return api.get('/api/ad-accounts', {
    params: businessId ? { business_id: businessId } : {}
  });
};

export const getBusinessManagers = () => {
  return api.get('/api/business-managers');
};

export const getPixels = (adAccountId) => {
  return api.get(`/api/pixels/${adAccountId}`);
};

export const getBusinessAssets = (businessId) => {
  return api.get(`/api/business-assets/${businessId}`);
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
