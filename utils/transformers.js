/**
 * Data Transformation Utilities
 * Transform UI data to Meta API format
 */

import FormData from 'form-data';

/**
 * Convert targeting object to JSON string (CRITICAL)
 */
export function stringifyTargeting(targeting) {
  if (typeof targeting === 'string') {
    // Already a string, validate it's valid JSON
    try {
      JSON.parse(targeting);
      return targeting;
    } catch (e) {
      throw new Error('Invalid targeting JSON string');
    }
  }
  
  if (typeof targeting === 'object' && targeting !== null) {
    return JSON.stringify(targeting);
  }
  
  throw new Error('Targeting must be an object or valid JSON string');
}

/**
 * Convert budget to cents (integer)
 */
export function convertBudgetToCents(budget) {
  if (typeof budget === 'number') {
    // Assume budget is in dollars, convert to cents
    return Math.round(budget * 100);
  }
  
  if (typeof budget === 'string') {
    const num = parseFloat(budget);
    if (isNaN(num)) {
      throw new Error('Invalid budget value');
    }
    return Math.round(num * 100);
  }
  
  // If already in cents (integer)
  if (Number.isInteger(budget)) {
    return budget;
  }
  
  throw new Error('Budget must be a number');
}

/**
 * Create FormData from object (CRITICAL: Use FormData builder)
 */
export function createFormData(data) {
  const formData = new FormData();
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue; // Skip null/undefined values
    }
    
    // If value is an object, stringify it
    if (typeof value === 'object' && !(value instanceof Buffer) && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  }
  
  return formData;
}

/**
 * Convert time to ISO8601 format in account timezone
 * Note: This is a basic implementation - should use date-fns-tz for proper timezone handling
 */
export function convertToAccountTimezone(time, timezoneId) {
  if (!time) return null;
  
  const date = new Date(time);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  
  // Basic conversion - in production, use a proper timezone library
  // Format: YYYY-MM-DDTHH:mm:ss-0800 (example for PST)
  // For now, return ISO string - this should be enhanced with timezone conversion
  return date.toISOString().replace('Z', getTimezoneOffset(timezoneId));
}

/**
 * Get timezone offset string (simplified - should use proper timezone library)
 */
function getTimezoneOffset(timezoneId) {
  // This is a placeholder - should map timezone_id to actual offset
  // For now, return a default offset
  return '-0800'; // PST/PDT example
}

/**
 * Transform campaign data to Meta API format
 */
export function transformCampaignData(data) {
  const formData = {
    name: data.name,
    objective: data.objective, // Must match Meta API enum exactly
    status: data.status || 'PAUSED',
    special_ad_categories: data.special_ad_categories ? JSON.stringify(data.special_ad_categories) : '[]'
  };

  // Optional fields
  if (data.bid_strategy) formData.bid_strategy = data.bid_strategy;
  if (data.daily_budget) formData.daily_budget = convertBudgetToCents(data.daily_budget);
  if (data.lifetime_budget) formData.lifetime_budget = convertBudgetToCents(data.lifetime_budget);

  return createFormData(formData);
}

/**
 * Transform ad set data to Meta API format
 */
export function transformAdSetData(data) {
  const formData = {
    name: data.name,
    campaign_id: data.campaign_id,
    status: data.status || 'PAUSED'
  };

  // Budget (only one allowed)
  if (data.daily_budget) {
    formData.daily_budget = convertBudgetToCents(data.daily_budget);
  } else if (data.lifetime_budget) {
    formData.lifetime_budget = convertBudgetToCents(data.lifetime_budget);
  }

  // Targeting (CRITICAL: Must be JSON string)
  if (data.targeting) {
    // Transform targeting object for Meta API
    const targeting = { ...data.targeting };
    
    // Convert gender string to genders array if needed
    if (targeting.gender && !targeting.genders) {
      if (targeting.gender === 'ALL' || !targeting.gender) {
        targeting.genders = [1, 2]; // All genders
      } else if (targeting.gender === 'MALE') {
        targeting.genders = [1];
      } else if (targeting.gender === 'FEMALE') {
        targeting.genders = [2];
      }
      delete targeting.gender; // Remove string gender field
    }
    
    // Ensure countries are strings (country codes)
    if (targeting.geo_locations?.countries) {
      targeting.geo_locations.countries = targeting.geo_locations.countries.map(country => 
        typeof country === 'string' ? country : country.code || country
      );
    }
    if (targeting.geo_locations?.excluded_countries) {
      targeting.geo_locations.excluded_countries = targeting.geo_locations.excluded_countries.map(country => 
        typeof country === 'string' ? country : country.code || country
      );
    }
    
    formData.targeting = stringifyTargeting(targeting);
  }

  // Time fields
  if (data.start_time) {
    formData.start_time = convertToAccountTimezone(data.start_time, data.timezone_id);
  }
  if (data.end_time) {
    formData.end_time = convertToAccountTimezone(data.end_time, data.timezone_id);
  } else if (data.daily_budget) {
    // For daily budget, set end_time=0 for ongoing
    formData.end_time = 0;
  }

  // Optional fields
  if (data.optimization_goal) formData.optimization_goal = data.optimization_goal;
  if (data.billing_event) formData.billing_event = data.billing_event;
  if (data.bid_strategy) formData.bid_strategy = data.bid_strategy;
  if (data.bid_amount) formData.bid_amount = convertBudgetToCents(data.bid_amount);
  if (data.promoted_object) formData.promoted_object = JSON.stringify(data.promoted_object);

  return createFormData(formData);
}

/**
 * Transform ad creative data (standard object_story_spec)
 */
export function transformAdCreativeData(data) {
  const formData = {
    name: data.name
  };

  // Standard creative with object_story_spec
  if (data.object_story_spec) {
    formData.object_story_spec = JSON.stringify(data.object_story_spec);
  }

  return createFormData(formData);
}

/**
 * Transform ad creative data with placement customization
 */
export function transformAdCreativeWithPlacementsData(data) {
  const formData = {
    name: data.name
  };

  // CRITICAL: Both object_story_spec (minimal) AND asset_feed_spec required
  if (data.object_story_spec) {
    // Should be minimal: { "page_id": "xxx" }
    formData.object_story_spec = JSON.stringify(data.object_story_spec);
  }

  if (data.asset_feed_spec) {
    // Full asset_feed_spec with customization rules
    formData.asset_feed_spec = JSON.stringify(data.asset_feed_spec);
  }

  return createFormData(formData);
}

/**
 * Transform ad data to Meta API format
 */
export function transformAdData(data) {
  const formData = {
    name: data.name,
    adset_id: data.adset_id,
    status: data.status || 'PAUSED'
  };

  // Creative (CRITICAL: Must be JSON string)
  if (data.creative) {
    if (typeof data.creative === 'object') {
      formData.creative = JSON.stringify(data.creative);
    } else {
      formData.creative = data.creative; // Assume already stringified
    }
  }

  return createFormData(formData);
}

export default {
  stringifyTargeting,
  convertBudgetToCents,
  createFormData,
  convertToAccountTimezone,
  transformCampaignData,
  transformAdSetData,
  transformAdCreativeData,
  transformAdCreativeWithPlacementsData,
  transformAdData
};
