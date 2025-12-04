/**
 * User Token Management Service
 * Manages multiple user tokens and their associated data
 */

import supabase from './supabase.js';
import tokenService from './tokenService.js';

/**
 * Add or update a user token
 */
export async function saveUserToken(tokenData) {
  try {
    // Fetch user info from Meta API
    const userInfo = await fetchUserInfo(tokenData.access_token);
    
    // Calculate expiration
    let tokenExpiresAt = null;
    if (tokenData.data_access_expiration_time) {
      tokenExpiresAt = new Date(tokenData.data_access_expiration_time * 1000).toISOString();
    } else if (tokenData.expires_in) {
      tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    }

    const userTokenData = {
      user_id: userInfo.id,
      user_name: userInfo.name,
      user_picture_url: userInfo.picture?.data?.url || null,
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in || null,
      data_access_expiration_time: tokenData.data_access_expiration_time || null,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_tokens')
      .upsert(userTokenData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user token:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveUserToken:', error);
    throw error;
  }
}

/**
 * Fetch user info from Meta API
 */
async function fetchUserInfo(accessToken) {
  const axios = (await import('axios')).default;
  const FB_API_VERSION = process.env.FB_API_VERSION || 'v24.0';
  const url = `https://graph.facebook.com/${FB_API_VERSION}/me`;
  
  const response = await axios.get(url, {
    params: {
      access_token: accessToken,
      fields: 'id,name,picture.type(large)'
    }
  });

  return response.data;
}

/**
 * Get all active user tokens
 */
export async function getAllUserTokens() {
  try {
    const { data, error } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tokens:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllUserTokens:', error);
    throw error;
  }
}

/**
 * Get user token by user_id
 */
export async function getUserToken(userId) {
  try {
    const { data, error } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching user token:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserToken:', error);
    throw error;
  }
}

/**
 * Delete/deactivate a user token
 */
export async function deleteUserToken(userId) {
  try {
    const { data, error } = await supabase
      .from('user_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error deleting user token:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteUserToken:', error);
    throw error;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(userToken) {
  if (!userToken.token_expires_at) return false;
  return new Date() >= new Date(userToken.token_expires_at);
}

export default {
  saveUserToken,
  getAllUserTokens,
  getUserToken,
  deleteUserToken,
  isTokenExpired
};
