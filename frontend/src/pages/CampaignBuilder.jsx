/**
 * Campaign Builder Page
 * Phase 3-8: Campaign creation UI with 3-column layout
 */

import { Box, HStack, Button, Heading, Alert, AlertIcon, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import CampaignColumn from '../components/CampaignColumn'
import AdsetColumn from '../components/AdsetColumn'
import AdColumn from '../components/AdColumn'
import { useCampaign } from '../context/CampaignContext'
import { createFullCampaign } from '../services/api'


export default function CampaignBuilder() {
  const { selectedAssets, campaignData, adSetData, creativeData, adData } = useCampaign()
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async () => {
    // Validate required fields
    if (!selectedAssets.adAccount) {
      toast({
        title: 'Error',
        description: 'Please select an Ad Account',
        status: 'error',
        duration: 3000
      })
      return
    }

    if (!campaignData.name || !campaignData.objective) {
      toast({
        title: 'Error',
        description: 'Campaign name and objective are required',
        status: 'error',
        duration: 3000
      })
      return
    }

    if (!adSetData.name) {
      toast({
        title: 'Error',
        description: 'Ad Set name is required',
        status: 'error',
        duration: 3000
      })
      return
    }

    try {
      setSubmitting(true)

      // Prepare campaign data
      const campaignPayload = {
        adAccountId: `act_${selectedAssets.adAccount.account_id}`,
        campaign: {
          name: campaignData.name,
          objective: campaignData.objective,
          status: campaignData.status || 'PAUSED',
          special_ad_categories: campaignData.special_ad_categories.length > 0 
            ? campaignData.special_ad_categories 
            : ['NONE']
        }
      }

      // Prepare ad set data
      // Transform targeting for Meta API format
      const targeting = { ...adSetData.targeting }
      
      // Convert gender to Meta API format (array of numbers: [1] = male, [2] = female, [1,2] = all)
      if (targeting.gender) {
        if (targeting.gender === 'ALL' || !targeting.gender) {
          targeting.genders = [1, 2] // All genders
        } else if (targeting.gender === 'MALE') {
          targeting.genders = [1]
        } else if (targeting.gender === 'FEMALE') {
          targeting.genders = [2]
        }
        delete targeting.gender // Remove the string gender field
      }
      
      // Convert countries to country codes if they're objects
      if (targeting.geo_locations?.countries) {
        targeting.geo_locations.countries = targeting.geo_locations.countries.map(country => 
          typeof country === 'string' ? country : country.code
        )
      }
      if (targeting.geo_locations?.excluded_countries) {
        targeting.geo_locations.excluded_countries = targeting.geo_locations.excluded_countries.map(country => 
          typeof country === 'string' ? country : country.code
        )
      }
      
      // Ensure optimization_goal is set (required for most objectives)
      if (!adSetData.optimization_goal && campaignData.objective) {
        // Set default optimization goal based on objective
        const defaultGoals = {
          'OUTCOME_SALES': 'OFFSITE_CONVERSIONS',
          'OUTCOME_TRAFFIC': 'LINK_CLICKS',
          'OUTCOME_LEADS': 'OFFSITE_CONVERSIONS',
          'OUTCOME_ENGAGEMENT': 'POST_ENGAGEMENT',
          'OUTCOME_AWARENESS': 'REACH',
          'OUTCOME_APP_PROMOTION': 'APP_INSTALLS'
        }
        adSetData.optimization_goal = defaultGoals[campaignData.objective] || 'LINK_CLICKS'
      }

      const adSetPayload = {
        name: adSetData.name,
        daily_budget: adSetData.daily_budget,
        lifetime_budget: adSetData.lifetime_budget,
        targeting: targeting,
        start_time: adSetData.start_time,
        end_time: adSetData.end_time,
        optimization_goal: adSetData.optimization_goal,
        billing_event: adSetData.billing_event || 'IMPRESSIONS',
        status: adSetData.status || 'PAUSED',
        campaign_objective: campaignData.objective,
        timezone_id: selectedAssets.timezoneId || 'America/Los_Angeles' // Default timezone
      }

      // Prepare creative data
      // Ensure we have required fields
      if (!selectedAssets.page?.page_id) {
        toast({
          title: 'Error',
          description: 'Please select a Facebook Page from the sidebar',
          status: 'error',
          duration: 3000
        })
        return
      }

      if (!creativeData.website_url) {
        toast({
          title: 'Error',
          description: 'Website URL is required',
          status: 'error',
          duration: 3000
        })
        return
      }

      const creativePayload = {
        name: creativeData.name || `${campaignData.name} - Creative`,
        format: creativeData.format || 'SINGLE_IMAGE_OR_VIDEO',
        object_story_spec: {
          page_id: selectedAssets.page.page_id,
          link_data: {
            message: creativeData.primary_text || creativeData.description || '',
            link: creativeData.website_url,
            caption: creativeData.headline || '',
            name: creativeData.display_link || creativeData.website_url,
            ...(creativeData.image_hash && { picture: creativeData.image_hash }),
            ...(creativeData.call_to_action && {
              call_to_action: {
                type: creativeData.call_to_action
              }
            })
          }
        }
      }

      // Prepare ad data
      const adPayload = {
        name: adData.name || `${campaignData.name} - Ad`,
        status: adData.status || 'PAUSED'
      }

      // Submit full campaign
      const response = await createFullCampaign({
        adAccountId: `act_${selectedAssets.adAccount.account_id}`,
        campaign: campaignPayload.campaign,
        adset: adSetPayload,
        creative: creativePayload,
        ad: adPayload
      })

      toast({
        title: 'Success',
        description: 'Campaign created successfully!',
        status: 'success',
        duration: 5000
      })

      console.log('Campaign created:', response.data)

    } catch (error) {
      console.error('Error creating campaign:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Unknown error occurred'
      console.error('Full error response:', error.response?.data)
      toast({
        title: 'Error',
        description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
        status: 'error',
        duration: 10000,
        isClosable: true
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="lg">Campaign Builder</Heading>
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={submitting}
          loadingText="Creating..."
          isDisabled={!selectedAssets.adAccount || !selectedAssets.page}
        >
          Create Campaign
        </Button>
      </HStack>

      {(!selectedAssets.adAccount || !selectedAssets.page) && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          Please select an Ad Account and Page from the sidebar to continue.
        </Alert>
      )}

      {/* Three Column Layout */}
      <HStack align="stretch" spacing={0} h="calc(100vh - 200px)">
        {/* Campaign Column */}
        <Box flex="1" minW="300px">
          <CampaignColumn />
        </Box>

        {/* Adset Column */}
        <Box flex="1" minW="300px">
          <AdsetColumn />
        </Box>

        {/* Ad Column */}
        <Box flex="1" minW="300px">
          <AdColumn />
        </Box>
      </HStack>
    </Box>
  )
}
