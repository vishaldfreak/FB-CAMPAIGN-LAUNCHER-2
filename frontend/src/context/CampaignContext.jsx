/**
 * Campaign Context
 * Phase 8: Form state management across all columns
 */

import { createContext, useContext, useState, useCallback } from 'react'

const CampaignContext = createContext()

export function CampaignProvider({ children }) {
  // Selected assets from sidebar
  const [selectedAssets, setSelectedAssets] = useState({
    businessManager: null,
    adAccount: null,
    page: null,
    pixel: null,
    timezoneId: null
  })

  // Campaign form data
  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: '',
    status: 'PAUSED',
    special_ad_categories: [],
    bid_strategy: null,
    buying_type: 'AUCTION',
    advantage_plus_budget: false,
    budget_type: 'daily', // 'daily' or 'lifetime'
    daily_budget: null,
    lifetime_budget: null,
    spending_limit: false,
    spending_limit_amount: null
  })

  // Ad Set form data
  const [adSetData, setAdSetData] = useState({
    name: '',
    status: 'PAUSED',
    daily_budget: null,
    lifetime_budget: null,
    budget_type: 'daily', // 'daily' or 'lifetime'
        targeting: {
          geo_locations: {
            countries: [],
            excluded_countries: []
          },
          age_min: 18,
          age_max: 65,
          gender: 'ALL',
          locales: []
        },
    start_time: null,
    end_time: null,
    optimization_goal: '',
    performance_goal: '',
    billing_event: '',
    bid_strategy: null,
    bid_amount: null,
    cost_per_result: null,
    conversion_location: 'WEBSITE',
    pixel: null,
    conversion_event: null,
    custom_audiences: [],
    exclude_custom_audiences: [],
    beneficiary: '',
    placement_type: 'ADVANTAGE_PLUS', // 'ADVANTAGE_PLUS' or 'MANUAL'
    platforms: [],
    device_platforms: [],
    manual_placements: [],
    website_url: ''
  })

  // Ad Creative form data
  const [creativeData, setCreativeData] = useState({
    name: '',
    format: 'SINGLE_IMAGE_OR_VIDEO', // 'SINGLE_IMAGE_OR_VIDEO', 'CAROUSEL', 'COLLECTION'
    creative_source: 'MANUAL', // 'MANUAL' or 'CATALOG_PLUS'
    destination_type: 'website',
    website_url: '',
    display_link: '',
    media: [], // Array of uploaded media files
    headline: '',
    primary_text: '',
    description: '',
    call_to_action: 'LEARN_MORE',
    optimize_text: false,
    multi_advertiser: false,
    object_story_spec: null,
    asset_feed_spec: null
  })

  // Ad form data
  const [adData, setAdData] = useState({
    name: '',
    status: 'PAUSED',
    facebook_page: null,
    instagram_account: null,
    tracking_pixel: null,
    url_parameters: ''
  })

  const updateSelectedAssets = useCallback((assets) => {
    setSelectedAssets(prev => ({ ...prev, ...assets }))
  }, [])

  const updateCampaignData = useCallback((data) => {
    setCampaignData(prev => ({ ...prev, ...data }))
  }, [])

  const updateAdSetData = useCallback((data) => {
    setAdSetData(prev => ({ ...prev, ...data }))
  }, [])

  const updateCreativeData = useCallback((data) => {
    setCreativeData(prev => ({ ...prev, ...data }))
  }, [])

  const updateAdData = useCallback((data) => {
    setAdData(prev => ({ ...prev, ...data }))
  }, [])

  const resetForm = useCallback(() => {
    setCampaignData({
      name: '',
      objective: '',
      status: 'PAUSED',
      special_ad_categories: [],
      bid_strategy: null,
      buying_type: 'AUCTION',
      advantage_plus_budget: false,
      budget_type: 'daily',
      daily_budget: null,
      lifetime_budget: null,
      spending_limit: false,
      spending_limit_amount: null
    })
    setAdSetData({
      name: '',
      status: 'PAUSED',
      daily_budget: null,
      lifetime_budget: null,
      budget_type: 'daily',
      targeting: {
        geo_locations: {
          countries: [],
          excluded_countries: []
        },
        age_min: 18,
        age_max: 65,
        gender: 'ALL', // 'MALE', 'FEMALE', or 'ALL'
        locales: []
      },
      start_time: null,
      end_time: null,
      optimization_goal: '',
      performance_goal: '',
      billing_event: '',
      bid_strategy: null,
      bid_amount: null,
      cost_per_result: null,
      conversion_location: 'WEBSITE',
      pixel: null,
      conversion_event: null,
      custom_audiences: [],
      exclude_custom_audiences: [],
      beneficiary: '',
      placement_type: 'ADVANTAGE_PLUS',
      platforms: [],
      device_platforms: [],
      manual_placements: [],
      website_url: ''
    })
    setCreativeData({
      name: '',
      format: 'SINGLE_IMAGE_OR_VIDEO',
      creative_source: 'MANUAL',
      destination_type: 'website',
      website_url: '',
      display_link: '',
      media: [],
      headline: '',
      primary_text: '',
      description: '',
      call_to_action: 'LEARN_MORE',
      optimize_text: false,
      multi_advertiser: false,
      object_story_spec: null,
      asset_feed_spec: null
    })
    setAdData({
      name: '',
      status: 'PAUSED',
      facebook_page: null,
      instagram_account: null,
      tracking_pixel: null,
      url_parameters: ''
    })
  }, [])

  const value = {
    selectedAssets,
    updateSelectedAssets,
    campaignData,
    updateCampaignData,
    adSetData,
    updateAdSetData,
    creativeData,
    updateCreativeData,
    adData,
    updateAdData,
    resetForm
  }

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  const context = useContext(CampaignContext)
  if (!context) {
    throw new Error('useCampaign must be used within CampaignProvider')
  }
  return context
}
