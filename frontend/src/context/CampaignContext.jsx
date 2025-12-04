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
    bid_strategy: null
  })

  // Ad Set form data
  const [adSetData, setAdSetData] = useState({
    name: '',
    daily_budget: null,
    lifetime_budget: null,
    budget_type: 'daily', // 'daily' or 'lifetime'
    targeting: {
      geo_locations: {
        countries: []
      }
    },
    start_time: null,
    end_time: null,
    optimization_goal: '',
    billing_event: '',
    bid_strategy: null,
    bid_amount: null
  })

  // Ad Creative form data
  const [creativeData, setCreativeData] = useState({
    name: '',
    format: 'standard', // 'standard' or 'placement_customization'
    object_story_spec: null,
    asset_feed_spec: null
  })

  // Ad form data
  const [adData, setAdData] = useState({
    name: '',
    status: 'PAUSED'
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
      bid_strategy: null
    })
    setAdSetData({
      name: '',
      daily_budget: null,
      lifetime_budget: null,
      budget_type: 'daily',
      targeting: {
        geo_locations: {
          countries: []
        }
      },
      start_time: null,
      end_time: null,
      optimization_goal: '',
      billing_event: '',
      bid_strategy: null,
      bid_amount: null
    })
    setCreativeData({
      name: '',
      format: 'standard',
      object_story_spec: null,
      asset_feed_spec: null
    })
    setAdData({
      name: '',
      status: 'PAUSED'
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
