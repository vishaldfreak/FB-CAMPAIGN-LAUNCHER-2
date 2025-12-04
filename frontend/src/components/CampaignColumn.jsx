/**
 * Campaign Column Component
 * Phase 3: Campaign configuration form
 */

import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Input,
  Select,
  Button,
  Text,
  Heading,
  FormControl,
  FormLabel,
  Checkbox,
  CheckboxGroup,
  Divider
} from '@chakra-ui/react'
import { useCampaign } from '../context/CampaignContext'
import { getAllowedOptimizationGoals } from '../utils/validators'

const OBJECTIVES = [
  { value: 'LINK_CLICKS', label: 'Link Clicks' },
  { value: 'CONVERSIONS', label: 'Conversions' },
  { value: 'LEAD_GENERATION', label: 'Lead Generation' },
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic (ODAX)' },
  { value: 'OUTCOME_SALES', label: 'Sales (ODAX)' },
  { value: 'OUTCOME_LEADS', label: 'Leads (ODAX)' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement (ODAX)' },
  { value: 'OUTCOME_APP_PROMOTION', label: 'App Promotion (ODAX)' },
  { value: 'OUTCOME_AWARENESS', label: 'Awareness (ODAX)' }
]

const BID_STRATEGIES = [
  { value: 'LOWEST_COST_WITHOUT_CAP', label: 'Lowest Cost (Automatic)' },
  { value: 'LOWEST_COST_WITH_BID_CAP', label: 'Lowest Cost with Bid Cap' },
  { value: 'COST_CAP', label: 'Cost Cap' },
  { value: 'LOWEST_COST_WITH_MIN_ROAS', label: 'Lowest Cost with Minimum ROAS' }
]

export default function CampaignColumn() {
  const { campaignData, updateCampaignData } = useCampaign()
  const [allowedGoals, setAllowedGoals] = useState([])

  useEffect(() => {
    // Update allowed optimization goals when objective changes
    if (campaignData.objective) {
      const goals = getAllowedOptimizationGoals(campaignData.objective)
      setAllowedGoals(goals)
    }
  }, [campaignData.objective])

  return (
    <Box
      h="calc(100vh - 120px)"
      overflowY="auto"
      p={4}
      borderRight="1px"
      borderColor="gray.200"
      bg="white"
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Campaign</Heading>
        
        {/* Campaign Name */}
        <FormControl>
          <FormLabel>Campaign Name</FormLabel>
          <Input
            value={campaignData.name}
            onChange={(e) => updateCampaignData({ name: e.target.value })}
            placeholder="Enter campaign name"
          />
          <Button size="xs" mt={2} variant="outline">
            Create template
          </Button>
        </FormControl>

        <Divider />

        <Heading size="sm">Campaign Details</Heading>

        {/* Campaign Objective */}
        <FormControl isRequired>
          <FormLabel>Campaign Objective</FormLabel>
          <Select
            value={campaignData.objective}
            onChange={(e) => updateCampaignData({ objective: e.target.value })}
            placeholder="Select objective"
          >
            {OBJECTIVES.map(obj => (
              <option key={obj.value} value={obj.value}>
                {obj.label}
              </option>
            ))}
          </Select>
          {campaignData.objective && allowedGoals.length > 0 && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              Allowed optimization goals: {allowedGoals.join(', ')}
            </Text>
          )}
        </FormControl>

        {/* Advantage+ Campaign Budget */}
        <FormControl>
          <Checkbox
            isChecked={campaignData.advantage_plus_budget || false}
            onChange={(e) => updateCampaignData({ advantage_plus_budget: e.target.checked })}
          >
            Advantage+ campaign budget
          </Checkbox>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Distribute budget across ad sets automatically
          </Text>
        </FormControl>

        {/* Budget */}
        <FormControl>
          <FormLabel>Budget</FormLabel>
          <Select
            value={campaignData.budget_type || 'lifetime'}
            onChange={(e) => updateCampaignData({ budget_type: e.target.value })}
          >
            <option value="lifetime">Lifetime budget</option>
            <option value="daily">Daily budget</option>
          </Select>
          <Input
            type="number"
            mt={2}
            placeholder="0.00"
            value={campaignData.budget_amount || ''}
            onChange={(e) => updateCampaignData({ budget_amount: e.target.value })}
          />
        </FormControl>

        {/* Campaign Bid Strategy */}
        <FormControl>
          <FormLabel>Campaign Bid Strategy</FormLabel>
          <Select
            value={campaignData.bid_strategy || ''}
            onChange={(e) => updateCampaignData({ bid_strategy: e.target.value || null })}
            placeholder="Select bid strategy"
          >
            {BID_STRATEGIES.map(strategy => (
              <option key={strategy.value} value={strategy.value}>
                {strategy.label}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Delivery Type (conditional - shown when Bid Cap selected) */}
        {campaignData.bid_strategy === 'LOWEST_COST_WITH_BID_CAP' && (
          <FormControl>
            <FormLabel>Delivery Type</FormLabel>
            <Select placeholder="Select delivery type">
              <option value="standard">Standard</option>
              <option value="accelerated">Accelerated</option>
            </Select>
          </FormControl>
        )}

        {/* Ad Set Scheduling */}
        <FormControl>
          <FormLabel>Ad Set Scheduling</FormLabel>
          <VStack align="stretch" spacing={2}>
            <Checkbox
              isChecked={campaignData.schedule_all_times || false}
              onChange={(e) => updateCampaignData({ schedule_all_times: e.target.checked })}
            >
              Deliver ads at all times
            </Checkbox>
            <Checkbox
              isChecked={campaignData.schedule_custom || false}
              onChange={(e) => updateCampaignData({ schedule_custom: e.target.checked })}
            >
              Set a schedule for ads
            </Checkbox>
            <Text fontSize="xs" color="gray.500">
              Specific schedule will be set within each ad set
            </Text>
          </VStack>
        </FormControl>

        {/* Status */}
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            value={campaignData.status || 'PAUSED'}
            onChange={(e) => updateCampaignData({ status: e.target.value })}
          >
            <option value="PAUSED">Paused</option>
            <option value="ACTIVE">Active</option>
          </Select>
        </FormControl>

        {/* Special Ad Categories */}
        <FormControl>
          <FormLabel>Special Ad Categories</FormLabel>
          <CheckboxGroup
            value={campaignData.special_ad_categories || []}
            onChange={(values) => updateCampaignData({ special_ad_categories: values })}
          >
            <VStack align="start" spacing={2}>
              <Checkbox value="NONE">None</Checkbox>
              <Checkbox value="HOUSING">Housing</Checkbox>
              <Checkbox value="EMPLOYMENT">Employment</Checkbox>
              <Checkbox value="CREDIT">Credit</Checkbox>
            </VStack>
          </CheckboxGroup>
        </FormControl>
      </VStack>
    </Box>
  )
}
