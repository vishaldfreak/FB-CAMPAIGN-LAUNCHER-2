/**
 * Validation Utilities
 * Phase 3-8: Validate data before sending to Meta API
 */

/**
 * Objective to Optimization Goal Mapping
 * CRITICAL: Complete mapping table for validation
 */
const OBJECTIVE_OPTIMIZATION_MAP = {
  // Legacy Objectives
  'LINK_CLICKS': ['LINK_CLICKS', 'LANDING_PAGE_VIEWS', 'IMPRESSIONS', 'REACH'],
  'CONVERSIONS': ['OFFSITE_CONVERSIONS', 'VALUE', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'LEAD_GENERATION': ['LEAD_GENERATION', 'QUALITY_LEAD', 'OFFSITE_CONVERSIONS', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'APP_INSTALLS': ['APP_INSTALLS', 'APP_INSTALLS_AND_OFFSITE_CONVERSIONS', 'LINK_CLICKS', 'REACH'],
  'BRAND_AWARENESS': ['AD_RECALL_LIFT', 'REACH', 'IMPRESSIONS'],
  'REACH': ['REACH', 'IMPRESSIONS'],
  'VIDEO_VIEWS': ['THRUPLAY', 'TWO_SECOND_CONTINUOUS_VIDEO_VIEWS', 'IMPRESSIONS'],
  'POST_ENGAGEMENT': ['POST_ENGAGEMENT', 'IMPRESSIONS', 'REACH'],
  'PAGE_LIKES': ['PAGE_LIKES', 'IMPRESSIONS', 'REACH'],
  'EVENT_RESPONSES': ['EVENT_RESPONSES', 'POST_ENGAGEMENT', 'IMPRESSIONS', 'REACH'],
  'MESSAGES': ['CONVERSATIONS', 'LINK_CLICKS'],
  'PRODUCT_CATALOG_SALES': ['OFFSITE_CONVERSIONS', 'VALUE'],
  
  // New ODAX Objectives
  'OUTCOME_TRAFFIC': ['LINK_CLICKS', 'LANDING_PAGE_VIEWS', 'REACH', 'IMPRESSIONS'],
  'OUTCOME_SALES': ['OFFSITE_CONVERSIONS', 'VALUE', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'OUTCOME_LEADS': ['OFFSITE_CONVERSIONS', 'LEAD_GENERATION', 'QUALITY_LEAD', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'OUTCOME_ENGAGEMENT': ['POST_ENGAGEMENT', 'PAGE_LIKES', 'EVENT_RESPONSES', 'THRUPLAY', 'CONVERSATIONS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'OUTCOME_APP_PROMOTION': ['APP_INSTALLS', 'APP_INSTALLS_AND_OFFSITE_CONVERSIONS', 'LINK_CLICKS', 'VALUE'],
  'OUTCOME_AWARENESS': ['AD_RECALL_LIFT', 'REACH', 'IMPRESSIONS', 'THRUPLAY', 'TWO_SECOND_CONTINUOUS_VIDEO_VIEWS']
};

/**
 * Validate objective and optimization goal compatibility
 */
export function validateObjectiveOptimizationGoal(objective, optimizationGoal) {
  if (!objective || !optimizationGoal) {
    return {
      valid: false,
      error: 'Objective and optimization goal are required'
    };
  }

  const allowedGoals = OBJECTIVE_OPTIMIZATION_MAP[objective];
  
  if (!allowedGoals) {
    return {
      valid: false,
      error: `Unknown objective: ${objective}`
    };
  }

  if (!allowedGoals.includes(optimizationGoal)) {
    return {
      valid: false,
      error: `Optimization goal "${optimizationGoal}" is not allowed for objective "${objective}". Allowed goals: ${allowedGoals.join(', ')}`
    };
  }

  return {
    valid: true,
    allowedGoals
  };
}

/**
 * Get allowed optimization goals for an objective
 */
export function getAllowedOptimizationGoals(objective) {
  return OBJECTIVE_OPTIMIZATION_MAP[objective] || [];
}

/**
 * Validate budget type (only one allowed)
 */
export function validateBudgetType(dailyBudget, lifetimeBudget) {
  const hasDaily = dailyBudget !== null && dailyBudget !== undefined && dailyBudget > 0;
  const hasLifetime = lifetimeBudget !== null && lifetimeBudget !== undefined && lifetimeBudget > 0;

  if (hasDaily && hasLifetime) {
    return {
      valid: false,
      error: 'Cannot specify both daily_budget and lifetime_budget. Please choose one.'
    };
  }

  if (!hasDaily && !hasLifetime) {
    return {
      valid: false,
      error: 'Either daily_budget or lifetime_budget must be specified'
    };
  }

  return {
    valid: true,
    budgetType: hasDaily ? 'daily' : 'lifetime'
  };
}

/**
 * Validate creative type (object_story_spec OR asset_feed_spec, but asset_feed_spec requires minimal object_story_spec)
 */
export function validateCreativeType(objectStorySpec, assetFeedSpec) {
  const hasObjectStory = objectStorySpec && Object.keys(objectStorySpec).length > 0;
  const hasAssetFeed = assetFeedSpec && Object.keys(assetFeedSpec).length > 0;

  // Standard creative: only object_story_spec
  if (hasObjectStory && !hasAssetFeed) {
    return {
      valid: true,
      type: 'standard',
      requiresObjectStory: true,
      requiresAssetFeed: false
    };
  }

  // Placement customization: both required (object_story_spec minimal with page_id)
  if (hasAssetFeed) {
    if (!hasObjectStory || !objectStorySpec.page_id) {
      return {
        valid: false,
        error: 'Placement customization (asset_feed_spec) requires object_story_spec with at least page_id'
      };
    }

    // Validate object_story_spec is minimal (only page_id)
    const objectStoryKeys = Object.keys(objectStorySpec);
    if (objectStoryKeys.length > 1 || !objectStorySpec.page_id) {
      return {
        valid: false,
        error: 'When using asset_feed_spec, object_story_spec should only contain page_id'
      };
    }

    return {
      valid: true,
      type: 'placement_customization',
      requiresObjectStory: true,
      requiresAssetFeed: true
    };
  }

  return {
    valid: false,
    error: 'Either object_story_spec (standard) or asset_feed_spec (placement customization) must be provided'
  };
}

/**
 * Validate asset_feed_spec structure
 */
export function validateAssetFeedSpec(assetFeedSpec) {
  if (!assetFeedSpec || typeof assetFeedSpec !== 'object') {
    return {
      valid: false,
      error: 'asset_feed_spec must be an object'
    };
  }

  // Check for required fields
  if (!assetFeedSpec.asset_customization_rules || !Array.isArray(assetFeedSpec.asset_customization_rules)) {
    return {
      valid: false,
      error: 'asset_feed_spec must have asset_customization_rules array'
    };
  }

  // CRITICAL: Minimum 2 rules required
  if (assetFeedSpec.asset_customization_rules.length < 2) {
    return {
      valid: false,
      error: 'asset_feed_spec must have at least 2 asset_customization_rules'
    };
  }

  // Check optimization_type
  if (assetFeedSpec.optimization_type !== 'PLACEMENT') {
    return {
      valid: false,
      error: 'asset_feed_spec must have optimization_type: "PLACEMENT"'
    };
  }

  // Validate labels match between assets and rules
  const assetLabels = new Set();
  
  // Collect labels from assets
  ['images', 'videos', 'titles', 'bodies'].forEach(assetType => {
    if (assetFeedSpec[assetType] && Array.isArray(assetFeedSpec[assetType])) {
      assetFeedSpec[assetType].forEach(asset => {
        if (asset.adlabels && Array.isArray(asset.adlabels)) {
          asset.adlabels.forEach(label => {
            if (label.name) assetLabels.add(label.name);
          });
        }
      });
    }
  });

  // Validate rules reference existing labels
  const ruleLabels = new Set();
  assetFeedSpec.asset_customization_rules.forEach((rule, index) => {
    if (rule.image_label?.name) ruleLabels.add(rule.image_label.name);
    if (rule.video_label?.name) ruleLabels.add(rule.video_label.name);
    if (rule.carousel_label?.name) ruleLabels.add(rule.carousel_label.name);
  });

  // Check all rule labels exist in assets
  const missingLabels = Array.from(ruleLabels).filter(label => !assetLabels.has(label));
  if (missingLabels.length > 0) {
    return {
      valid: false,
      error: `Asset labels referenced in rules but not found in assets: ${missingLabels.join(', ')}`
    };
  }

  return {
    valid: true,
    assetLabels: Array.from(assetLabels),
    ruleLabels: Array.from(ruleLabels)
  };
}

/**
 * Validate placement combinations
 */
export function validatePlacementCombinations(placementSpec) {
  const { publisher_platforms, instagram_positions } = placementSpec || {};

  // Check if threads is selected without instagram stream
  if (publisher_platforms?.includes('threads')) {
    if (!publisher_platforms.includes('instagram') || !instagram_positions?.includes('stream')) {
      return {
        valid: false,
        error: 'Threads placement requires instagram platform with stream position'
      };
    }
  }

  // Validate explore_home only supports SINGLE_IMAGE (checked at creative level)
  
  return {
    valid: true
  };
}

/**
 * Validate pixel permissions (should be re-validated at creation time)
 */
export function validatePixelPermissions(pixelId, adAccountId, pixelOwnerBusinessId, adAccountBusinessId) {
  if (!pixelId || !adAccountId) {
    return {
      valid: false,
      error: 'Pixel ID and Ad Account ID are required'
    };
  }

  // If business IDs are provided, validate they match
  if (pixelOwnerBusinessId && adAccountBusinessId) {
    if (pixelOwnerBusinessId !== adAccountBusinessId) {
      return {
        valid: false,
        error: `Pixel owner business (${pixelOwnerBusinessId}) does not match ad account business (${adAccountBusinessId})`
      };
    }
  }

  return {
    valid: true
  };
}

/**
 * Validate timezone conversion (handle DST)
 */
export function validateTimezoneConversion(time, timezoneId) {
  if (!time || !timezoneId) {
    return {
      valid: false,
      error: 'Time and timezone_id are required'
    };
  }

  try {
    // Convert to ISO8601 format in the specified timezone
    // Note: This is a basic validation - actual conversion should use a library like date-fns-tz
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      return {
        valid: false,
        error: 'Invalid date format'
      };
    }

    return {
      valid: true,
      convertedTime: date.toISOString() // This should be converted to account timezone
    };
  } catch (error) {
    return {
      valid: false,
      error: `Timezone conversion error: ${error.message}`
    };
  }
}

/**
 * Validate FormData encoding
 */
export function validateFormDataEncoding(formData) {
  if (!formData || typeof formData !== 'object') {
    return {
      valid: false,
      error: 'FormData must be an object'
    };
  }

  // Check that Content-Type is not manually set (should be handled by FormData)
  // This is more of a reminder - actual validation happens at request time

  return {
    valid: true
  };
}

export default {
  validateObjectiveOptimizationGoal,
  getAllowedOptimizationGoals,
  validateBudgetType,
  validateCreativeType,
  validateAssetFeedSpec,
  validatePlacementCombinations,
  validatePixelPermissions,
  validateTimezoneConversion,
  validateFormDataEncoding
};
