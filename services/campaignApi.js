/**
 * Campaign API Service
 * Phase 3-6: Create campaigns, ad sets, creatives, and ads
 */

import axios from 'axios';
import FormData from 'form-data';
import tokenService from './tokenService.js';
import * as transformers from '../utils/transformers.js';
import * as validators from '../utils/validators.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FB_API_VERSION = process.env.FB_API_VERSION || 'v24.0';
const BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

/**
 * Log request to file (with token redaction)
 */
function logRequest(type, data) {
  try {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `${type}.json`);
    const redactedData = tokenService.redactToken(JSON.stringify(data, null, 2));
    fs.writeFileSync(logFile, redactedData);
    console.log(`📝 Logged ${type} request to ${logFile}`);
  } catch (error) {
    console.warn('Could not log request:', error.message);
  }
}

/**
 * Make POST request with FormData
 * CRITICAL: Do NOT manually set Content-Type header
 */
async function makeFormDataRequest(url, formData, retryCount = 0) {
  try {
    // Validate token
    tokenService.validateToken();

    // Log request (redact token)
    const formDataObj = {};
    for (const [key, value] of formData.entries()) {
      formDataObj[key] = typeof value === 'string' ? value : '[Buffer/File]';
    }
    logRequest(url.split('/').pop().split('?')[0], formDataObj);

    const response = await axios.post(url, formData, {
      headers: {
        // CRITICAL: Let axios/FormData set Content-Type automatically with boundary
        ...formData.getHeaders()
      },
      timeout: 60000
    });

    return response;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data?.error || {};
      console.error('API Error:', tokenService.redactToken(JSON.stringify(errorData)));
      throw error;
    }
    throw error;
  }
}

/**
 * Create Campaign
 * Phase 3
 */
export async function createCampaign(adAccountId, data) {
  try {
    // Validate required fields
    if (!data.name || !data.objective) {
      throw new Error('Campaign name and objective are required');
    }

    // Validate objective enum
    const validObjectives = [
      'LINK_CLICKS', 'CONVERSIONS', 'LEAD_GENERATION', 'APP_INSTALLS',
      'BRAND_AWARENESS', 'REACH', 'VIDEO_VIEWS', 'POST_ENGAGEMENT',
      'PAGE_LIKES', 'EVENT_RESPONSES', 'MESSAGES', 'PRODUCT_CATALOG_SALES',
      'OUTCOME_TRAFFIC', 'OUTCOME_SALES', 'OUTCOME_LEADS', 'OUTCOME_ENGAGEMENT',
      'OUTCOME_APP_PROMOTION', 'OUTCOME_AWARENESS'
    ];

    if (!validObjectives.includes(data.objective)) {
      throw new Error(`Invalid objective: ${data.objective}. Must be one of: ${validObjectives.join(', ')}`);
    }

    // Transform data
    const formData = transformers.transformCampaignData(data);

    // Add access token
    formData.append('access_token', tokenService.getToken());

    // Make request
    const accountId = adAccountId.replace('act_', '');
    const url = `${BASE_URL}/act_${accountId}/campaigns`;
    
    const response = await makeFormDataRequest(url, formData);

    return {
      success: true,
      id: response.data.id,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating campaign:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create Ad Set
 * Phase 4
 */
export async function createAdSet(adAccountId, campaignId, data) {
  try {
    // Validate required fields
    if (!data.name || !campaignId) {
      throw new Error('Ad set name and campaign_id are required');
    }

    // Validate budget type
    const budgetValidation = validators.validateBudgetType(data.daily_budget, data.lifetime_budget);
    if (!budgetValidation.valid) {
      throw new Error(budgetValidation.error);
    }

    // Validate targeting
    if (!data.targeting) {
      throw new Error('Targeting is required');
    }

    // Validate optimization goal matches campaign objective (if provided)
    if (data.campaign_objective && data.optimization_goal) {
      const goalValidation = validators.validateObjectiveOptimizationGoal(
        data.campaign_objective,
        data.optimization_goal
      );
      if (!goalValidation.valid) {
        throw new Error(goalValidation.error);
      }
    }

    // Transform data
    const formData = transformers.transformAdSetData({
      ...data,
      campaign_id: campaignId
    });

    // Add access token
    formData.append('access_token', tokenService.getToken());

    // Make request
    const accountId = adAccountId.replace('act_', '');
    const url = `${BASE_URL}/act_${accountId}/adsets`;
    
    const response = await makeFormDataRequest(url, formData);

    return {
      success: true,
      id: response.data.id,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating ad set:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create Ad Creative (Standard)
 * Phase 5
 */
export async function createAdCreative(adAccountId, data) {
  try {
    // Validate required fields
    if (!data.name || !data.object_story_spec) {
      throw new Error('Creative name and object_story_spec are required');
    }

    // Validate creative type
    const creativeValidation = validators.validateCreativeType(
      data.object_story_spec,
      data.asset_feed_spec
    );
    if (!creativeValidation.valid) {
      throw new Error(creativeValidation.error);
    }

    // Transform data
    const formData = transformers.transformAdCreativeData(data);

    // Add access token
    formData.append('access_token', tokenService.getToken());

    // Make request
    const accountId = adAccountId.replace('act_', '');
    const url = `${BASE_URL}/act_${accountId}/adcreatives`;
    
    const response = await makeFormDataRequest(url, formData);

    return {
      success: true,
      id: response.data.id,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating ad creative:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create Ad Creative with Placement Customization
 * Phase 7
 */
export async function createAdCreativeWithPlacements(adAccountId, data) {
  try {
    // Validate required fields
    if (!data.name || !data.object_story_spec || !data.asset_feed_spec) {
      throw new Error('Creative name, object_story_spec (minimal with page_id), and asset_feed_spec are required');
    }

    // Validate object_story_spec is minimal (only page_id)
    if (!data.object_story_spec.page_id || Object.keys(data.object_story_spec).length > 1) {
      throw new Error('object_story_spec must only contain page_id for placement customization');
    }

    // Validate asset_feed_spec
    const assetFeedValidation = validators.validateAssetFeedSpec(data.asset_feed_spec);
    if (!assetFeedValidation.valid) {
      throw new Error(assetFeedValidation.error);
    }

    // Transform data
    const formData = transformers.transformAdCreativeWithPlacementsData(data);

    // Add access token
    formData.append('access_token', tokenService.getToken());

    // Make request
    const accountId = adAccountId.replace('act_', '');
    const url = `${BASE_URL}/act_${accountId}/adcreatives`;
    
    const response = await makeFormDataRequest(url, formData);

    return {
      success: true,
      id: response.data.id,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating ad creative with placements:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create Ad
 * Phase 6
 */
export async function createAd(adAccountId, adSetId, creativeId, data) {
  try {
    // Validate required fields
    if (!data.name || !adSetId || !creativeId) {
      throw new Error('Ad name, adset_id, and creative_id are required');
    }

    // Transform data
    const formData = transformers.transformAdData({
      ...data,
      adset_id: adSetId,
      creative: { creative_id: creativeId }
    });

    // Add access token
    formData.append('access_token', tokenService.getToken());

    // Make request
    const accountId = adAccountId.replace('act_', '');
    const url = `${BASE_URL}/act_${accountId}/ads`;
    
    const response = await makeFormDataRequest(url, formData);

    return {
      success: true,
      id: response.data.id,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating ad:', error.response?.data || error.message);
    throw error;
  }
}

export default {
  createCampaign,
  createAdSet,
  createAdCreative,
  createAdCreativeWithPlacements,
  createAd
};
