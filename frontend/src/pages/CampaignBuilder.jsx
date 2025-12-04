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
      const adSetPayload = {
        name: adSetData.name,
        daily_budget: adSetData.daily_budget,
        lifetime_budget: adSetData.lifetime_budget,
        targeting: adSetData.targeting,
        start_time: adSetData.start_time,
        end_time: adSetData.end_time,
        optimization_goal: adSetData.optimization_goal,
        billing_event: adSetData.billing_event || 'IMPRESSIONS',
        status: adSetData.status || 'PAUSED',
        campaign_objective: campaignData.objective
      }

      // Prepare creative data
      const creativePayload = {
        name: creativeData.name || `${campaignData.name} - Creative`,
        format: creativeData.format || 'standard',
        object_story_spec: {
          page_id: selectedAssets.page?.page_id,
          link_data: {
            message: creativeData.description || '',
            link: creativeData.website_url || '',
            caption: creativeData.headline || '',
            picture: creativeData.image_hash || creativeData.picture || '',
            call_to_action: {
              type: creativeData.call_to_action || 'LEARN_MORE'
            }
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
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000
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
