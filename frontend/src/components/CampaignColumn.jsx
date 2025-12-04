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
  Divider,
  NumberInput,
  NumberInputField,
  HStack,
  Switch,
  Alert,
  AlertIcon,
  SimpleGrid
} from '@chakra-ui/react'
import { useCampaign } from '../context/CampaignContext'
import { getAllowedOptimizationGoals } from '../utils/validators'

const OBJECTIVES = [
  { value: 'OUTCOME_SALES', label: 'Sales', icon: '⚡' },
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic', icon: '🔀' },
  { value: 'OUTCOME_LEADS', label: 'Leads', icon: '📄' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement', icon: '🤝' },
  { value: 'OUTCOME_AWARENESS', label: 'Awareness', icon: '💡' },
  { value: 'OUTCOME_APP_PROMOTION', label: 'App Promotion', icon: '📱' }
]

const BID_STRATEGIES = [
  { value: 'HIGHEST_VOLUME', label: 'Highest Volume' },
  { value: 'COST_PER_RESULT', label: 'Cost per result goal' },
  { value: 'BID_CAP', label: 'Bid cap' },
  { value: 'LOWEST_COST_MIN_ROAS', label: 'Lowest Cost With Min ROAS' }
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
        </FormControl>

        <Divider />

        <Heading size="sm">Campaign Details</Heading>

        {/* Campaign Objective */}
        <FormControl isRequired>
          <FormLabel>Campaign Objectives</FormLabel>
          <SimpleGrid columns={3} spacing={2} mt={2}>
            {OBJECTIVES.map(obj => (
              <Box
                key={obj.value}
                p={3}
                border="2px"
                borderColor={campaignData.objective === obj.value ? 'blue.500' : 'gray.200'}
                borderRadius="md"
                cursor="pointer"
                bg={campaignData.objective === obj.value ? 'blue.50' : 'white'}
                onClick={() => updateCampaignData({ objective: obj.value })}
                textAlign="center"
                _hover={{ borderColor: 'blue.300' }}
              >
                <Text fontSize="xl" mb={1}>{obj.icon}</Text>
                <Text fontSize="sm" fontWeight={campaignData.objective === obj.value ? 'bold' : 'normal'}>
                  {obj.label}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
          {campaignData.objective && allowedGoals.length > 0 && (
            <Text fontSize="xs" color="gray.500" mt={2}>
              Allowed optimization goals: {allowedGoals.join(', ')}
            </Text>
          )}
        </FormControl>

        <Divider />

        <Heading size="sm">Advantage Campaign Budget</Heading>

        {/* Advantage+ Campaign Budget Toggle */}
        <FormControl>
          <HStack justify="space-between">
            <Box>
              <FormLabel mb={0}>Advantage Campaign Budget</FormLabel>
              <Text fontSize="xs" color="gray.500">
                Distribute budget across ad sets automatically
              </Text>
            </Box>
            <Switch
              isChecked={campaignData.advantage_plus_budget || false}
              onChange={(e) => updateCampaignData({ advantage_plus_budget: e.target.checked })}
            />
          </HStack>
        </FormControl>

        {/* Budget (only shown when Advantage Campaign Budget is ON) */}
        {campaignData.advantage_plus_budget && (
          <>
            <FormControl>
              <FormLabel>Budget</FormLabel>
              <HStack>
                <Select
                  value={campaignData.budget_type || 'DAILY'}
                  onChange={(e) => updateCampaignData({ budget_type: e.target.value })}
                  flex={1}
                >
                  <option value="DAILY">Daily Budget</option>
                  <option value="LIFETIME">Lifetime Budget</option>
                </Select>
                <NumberInput
                  value={campaignData.budget_type === 'LIFETIME' 
                    ? (campaignData.lifetime_budget != null ? (campaignData.lifetime_budget / 100).toFixed(2) : '')
                    : (campaignData.daily_budget != null ? (campaignData.daily_budget / 100).toFixed(2) : '')}
                  onChange={(value) => {
                    const numValue = parseFloat(value || 0)
                    if (!isNaN(numValue)) {
                      const cents = Math.round(numValue * 100)
                      if (campaignData.budget_type === 'LIFETIME') {
                        updateCampaignData({ lifetime_budget: cents })
                      } else {
                        updateCampaignData({ daily_budget: cents })
                      }
                    }
                  }}
                  min={1}
                  flex={2}
                >
                  <NumberInputField placeholder="0.00" />
                </NumberInput>
                <Text>USD</Text>
              </HStack>
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

            {/* Campaign Spending Limit */}
            <FormControl>
              <Checkbox
                isChecked={campaignData.spending_limit || false}
                onChange={(e) => updateCampaignData({ spending_limit: e.target.checked })}
              >
                Add campaign spending limit
              </Checkbox>
              {campaignData.spending_limit && (
                <NumberInput
                  mt={2}
                  value={campaignData.spending_limit_amount != null ? (campaignData.spending_limit_amount / 100).toFixed(2) : ''}
                  onChange={(value) => {
                    const numValue = parseFloat(value || 0)
                    if (!isNaN(numValue)) {
                      const cents = Math.round(numValue * 100)
                      updateCampaignData({ spending_limit_amount: cents })
                    }
                  }}
                  min={1}
                >
                  <NumberInputField placeholder="Enter spending limit" />
                </NumberInput>
              )}
            </FormControl>
          </>
        )}

        {!campaignData.advantage_plus_budget && (
          <Alert status="info" fontSize="sm">
            <AlertIcon />
            Budget will be set at Ad Set level
          </Alert>
        )}


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

      </VStack>
    </Box>
  )
}
