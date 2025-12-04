/**
 * Client-side Validation Utilities
 * Phase 3-8: Validate form data before submission
 */

/**
 * Objective to Optimization Goal Mapping
 */
const OBJECTIVE_OPTIMIZATION_MAP = {
  'LINK_CLICKS': ['LINK_CLICKS', 'LANDING_PAGE_VIEWS', 'IMPRESSIONS', 'REACH'],
  'CONVERSIONS': ['OFFSITE_CONVERSIONS', 'VALUE', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'LEAD_GENERATION': ['LEAD_GENERATION', 'QUALITY_LEAD', 'OFFSITE_CONVERSIONS', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'OUTCOME_TRAFFIC': ['LINK_CLICKS', 'LANDING_PAGE_VIEWS', 'REACH', 'IMPRESSIONS'],
  'OUTCOME_SALES': ['OFFSITE_CONVERSIONS', 'VALUE', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'OUTCOME_LEADS': ['OFFSITE_CONVERSIONS', 'LEAD_GENERATION', 'QUALITY_LEAD', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'OUTCOME_ENGAGEMENT': ['POST_ENGAGEMENT', 'PAGE_LIKES', 'EVENT_RESPONSES', 'THRUPLAY', 'CONVERSATIONS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
  'OUTCOME_APP_PROMOTION': ['APP_INSTALLS', 'APP_INSTALLS_AND_OFFSITE_CONVERSIONS', 'LINK_CLICKS', 'VALUE'],
  'OUTCOME_AWARENESS': ['AD_RECALL_LIFT', 'REACH', 'IMPRESSIONS', 'THRUPLAY', 'TWO_SECOND_CONTINUOUS_VIDEO_VIEWS']
}

/**
 * Get allowed optimization goals for an objective
 */
export function getAllowedOptimizationGoals(objective) {
  return OBJECTIVE_OPTIMIZATION_MAP[objective] || []
}

/**
 * Validate objective and optimization goal compatibility
 */
export function validateObjectiveOptimizationGoal(objective, optimizationGoal) {
  if (!objective || !optimizationGoal) {
    return { valid: false, error: 'Objective and optimization goal are required' }
  }

  const allowedGoals = OBJECTIVE_OPTIMIZATION_MAP[objective]
  if (!allowedGoals) {
    return { valid: false, error: `Unknown objective: ${objective}` }
  }

  if (!allowedGoals.includes(optimizationGoal)) {
    return {
      valid: false,
      error: `Optimization goal "${optimizationGoal}" is not allowed for objective "${objective}"`
    }
  }

  return { valid: true, allowedGoals }
}

export default {
  getAllowedOptimizationGoals,
  validateObjectiveOptimizationGoal
}
