// Facebook Pixel Custom Event Types (Standard Events + Custom)
// Based on: https://developers.facebook.com/docs/marketing-api/reference/ad-campaign

export const PIXEL_CUSTOM_EVENTS = {
  // Common for all objectives
  COMMON: [
    { value: 'PAGE_VIEW', label: 'Page View', description: 'Track page views' },
    { value: 'VIEW_CONTENT', label: 'View Content', description: 'View content on your website' },
    { value: 'SEARCH', label: 'Search', description: 'Search on your website' },
  ],
  // Sales objective events
  SALES: [
    { value: 'ADD_TO_CART', label: 'Add to Cart', description: 'Add items to shopping cart' },
    { value: 'ADD_TO_WISHLIST', label: 'Add to Wishlist', description: 'Add items to wishlist' },
    { value: 'INITIATED_CHECKOUT', label: 'Initiate Checkout', description: 'Start the checkout process' },
    { value: 'ADD_PAYMENT_INFO', label: 'Add Payment Info', description: 'Add payment information' },
    { value: 'PURCHASE', label: 'Purchase', description: 'Complete a purchase' },
  ],
  // Lead generation objective events
  LEADS: [
    { value: 'LEAD', label: 'Lead', description: 'Submit a lead form' },
    { value: 'COMPLETE_REGISTRATION', label: 'Complete Registration', description: 'Complete a registration form' },
    { value: 'SUBMIT_APPLICATION', label: 'Submit Application', description: 'Submit an application' },
    { value: 'SCHEDULE', label: 'Schedule', description: 'Schedule an appointment' },
    { value: 'START_TRIAL', label: 'Start Trial', description: 'Start a free trial' },
    { value: 'SUBSCRIBE', label: 'Subscribe', description: 'Subscribe to a service' },
    { value: 'CONTACT', label: 'Contact', description: 'Contact your business' },
  ],
  // Engagement objective events
  ENGAGEMENT: [
    { value: 'SERVICE_BOOKING_REQUEST', label: 'Service Booking Request', description: 'Request to book a service' },
    { value: 'MESSAGING_CONVERSATION_STARTED_7D', label: 'Messaging Started (7D)', description: 'Start a messaging conversation' },
    { value: 'FIND_LOCATION', label: 'Find Location', description: 'Find a physical location' },
    { value: 'CUSTOMIZE_PRODUCT', label: 'Customize Product', description: 'Customize a product' },
  ],
  // Awareness objective events
  AWARENESS: [
    { value: 'AD_IMPRESSION', label: 'Ad Impression', description: 'View an ad' },
    { value: 'CONTENT_VIEW', label: 'Content View', description: 'View content' },
  ],
  // App-specific events
  APP: [
    { value: 'LEVEL_ACHIEVED', label: 'Level Achieved', description: 'Achieve a level in app' },
    { value: 'ACHIEVEMENT_UNLOCKED', label: 'Achievement Unlocked', description: 'Unlock an achievement' },
    { value: 'SPENT_CREDITS', label: 'Spent Credits', description: 'Spend credits in app' },
    { value: 'TUTORIAL_COMPLETION', label: 'Tutorial Completion', description: 'Complete a tutorial' },
    { value: 'D2_RETENTION', label: 'D2 Retention', description: '2-day retention' },
    { value: 'D7_RETENTION', label: 'D7 Retention', description: '7-day retention' },
  ],
  // Other events
  OTHER_EVENTS: [
    { value: 'RATE', label: 'Rate', description: 'Rate a product or service' },
    { value: 'DONATE', label: 'Donate', description: 'Make a donation' },
    { value: 'LISTING_INTERACTION', label: 'Listing Interaction', description: 'Interact with a listing' },
    { value: 'OTHER', label: 'Other', description: 'Custom event (specify custom_event_str)' },
  ],
}

// Helper function to get events based on campaign objective
export const getPixelEventsForObjective = (objective) => {
  const events = [...PIXEL_CUSTOM_EVENTS.COMMON]
  
  switch (objective) {
    case 'OUTCOME_SALES':
    case 'SALES':
      events.push(...PIXEL_CUSTOM_EVENTS.SALES)
      break
    case 'OUTCOME_LEADS':
    case 'LEADS':
      events.push(...PIXEL_CUSTOM_EVENTS.LEADS)
      break
    case 'OUTCOME_ENGAGEMENT':
    case 'ENGAGEMENT':
      events.push(...PIXEL_CUSTOM_EVENTS.ENGAGEMENT)
      break
    case 'OUTCOME_AWARENESS':
    case 'AWARENESS':
    case 'BRAND_AWARENESS':
      events.push(...PIXEL_CUSTOM_EVENTS.AWARENESS)
      break
    case 'OUTCOME_APP_PROMOTION':
    case 'APP_PROMOTION':
    case 'APP_INSTALLS':
      events.push(...PIXEL_CUSTOM_EVENTS.APP)
      break
    default:
      // If no specific objective, show all events
      events.push(
        ...PIXEL_CUSTOM_EVENTS.SALES,
        ...PIXEL_CUSTOM_EVENTS.LEADS,
        ...PIXEL_CUSTOM_EVENTS.ENGAGEMENT,
        ...PIXEL_CUSTOM_EVENTS.APP,
        ...PIXEL_CUSTOM_EVENTS.OTHER_EVENTS
      )
  }
  
  // Add other events at the end
  events.push(...PIXEL_CUSTOM_EVENTS.OTHER_EVENTS)
  
  return events
}
