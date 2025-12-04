/**
 * Facebook API Configuration
 */

const FB_API_VERSION = import.meta.env.VITE_FB_API_VERSION || 'v24.0';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const facebookConfig = {
  apiVersion: FB_API_VERSION,
  apiBaseUrl: API_BASE_URL,
  clientId: import.meta.env.VITE_FB_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_FB_REDIRECT_URI || ''
};

export default facebookConfig;
