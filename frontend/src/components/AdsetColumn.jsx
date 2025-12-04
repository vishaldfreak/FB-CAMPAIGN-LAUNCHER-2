/**
 * Adset Column Component
 * Phase 4: Ad set configuration form
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
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
  Divider,
  NumberInput,
  NumberInputField,
  HStack
} from '@chakra-ui/react'
import { useCampaign } from '../context/CampaignContext'
import { getAllowedOptimizationGoals, validateObjectiveOptimizationGoal } from '../utils/validators'

const OPTIMIZATION_GOALS = [
  { value: 'LINK_CLICKS', label: 'Link Clicks' },
  { value: 'LANDING_PAGE_VIEWS', label: 'Landing Page Views' },
  { value: 'OFFSITE_CONVERSIONS', label: 'Conversions' },
  { value: 'VALUE', label: 'Value' },
  { value: 'LEAD_GENERATION', label: 'Lead Generation' },
  { value: 'QUALITY_LEAD', label: 'Quality Lead' },
  { value: 'REACH', label: 'Reach' },
  { value: 'IMPRESSIONS', label: 'Impressions' },
  { value: 'POST_ENGAGEMENT', label: 'Post Engagement' },
  { value: 'PAGE_LIKES', label: 'Page Likes' },
  { value: 'THRUPLAY', label: 'ThruPlay' }
]

const BILLING_EVENTS = [
  { value: 'IMPRESSIONS', label: 'Impressions' },
  { value: 'LINK_CLICKS', label: 'Link Clicks' },
  { value: 'THRUPLAY', label: 'ThruPlay' }
]

export default function AdsetColumn() {
  const { adSetData, updateAdSetData, campaignData } = useCampaign()
  const [allowedGoals, setAllowedGoals] = useState([])
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    // Update allowed optimization goals based on campaign objective
    if (campaignData.objective) {
      const goals = getAllowedOptimizationGoals(campaignData.objective)
      setAllowedGoals(goals)
      
      // Validate current optimization goal
      if (adSetData.optimization_goal) {
        const validation = validateObjectiveOptimizationGoal(
          campaignData.objective,
          adSetData.optimization_goal
        )
        if (!validation.valid) {
          setValidationError(validation.error)
        } else {
          setValidationError('')
        }
      }
    }
  }, [campaignData.objective, adSetData.optimization_goal])

  const handleBudgetTypeChange = (value) => {
    if (value === 'daily') {
      updateAdSetData({ budget_type: 'daily', lifetime_budget: null })
    } else {
      updateAdSetData({ budget_type: 'lifetime', daily_budget: null })
    }
  }

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
        <Heading size="md">Ad Set</Heading>
        
        {/* Ad Set Name */}
        <FormControl>
          <FormLabel>Ad Set Name</FormLabel>
          <Input
            value={adSetData.name}
            onChange={(e) => updateAdSetData({ name: e.target.value })}
            placeholder="Enter ad set name"
          />
          <Button size="xs" mt={2} variant="outline">
            Create template
          </Button>
        </FormControl>

        <Divider />

        <Heading size="sm">Conversion</Heading>

        {/* Conversion Location */}
        <FormControl>
          <FormLabel>Conversion Location</FormLabel>
          <Select placeholder="Select location">
            <option value="website">Website</option>
            <option value="app">App</option>
            <option value="messenger">Messenger</option>
          </Select>
        </FormControl>

        {/* Performance Goal */}
        <FormControl isRequired>
          <FormLabel>Performance Goal</FormLabel>
          <Select
            value={adSetData.optimization_goal}
            onChange={(e) => {
              updateAdSetData({ optimization_goal: e.target.value })
              setValidationError('')
            }}
            placeholder="Select optimization goal"
            isInvalid={!!validationError}
          >
            {allowedGoals.length > 0 ? (
              allowedGoals.map(goal => {
                const goalOption = OPTIMIZATION_GOALS.find(g => g.value === goal)
                return goalOption ? (
                  <option key={goal} value={goal}>
                    {goalOption.label}
                  </option>
                ) : (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                )
              })
            ) : (
              OPTIMIZATION_GOALS.map(goal => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))
            )}
          </Select>
          {validationError && (
            <Text fontSize="xs" color="red.500" mt={1}>
              {validationError}
            </Text>
          )}
          {campaignData.objective && allowedGoals.length > 0 && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              Filtered by campaign objective: {campaignData.objective}
            </Text>
          )}
        </FormControl>

        {/* Dataset */}
        <FormControl>
          <FormLabel>Dataset</FormLabel>
          <Select placeholder="Select dataset">
            <option value="pixel">Pixel</option>
          </Select>
        </FormControl>

        {/* Conversion Event */}
        <FormControl>
          <FormLabel>Conversion Event</FormLabel>
          <Select placeholder="Select event">
            <option value="purchase">Purchase</option>
            <option value="lead">Lead</option>
            <option value="add_to_cart">Add to Cart</option>
          </Select>
        </FormControl>

        <Divider />

        {/* Bid Cap */}
        {campaignData.bid_strategy === 'LOWEST_COST_WITH_BID_CAP' && (
          <FormControl>
            <FormLabel>Bid Cap ($)</FormLabel>
            <NumberInput
              value={adSetData.bid_amount ? (adSetData.bid_amount / 100).toFixed(2) : ''}
              onChange={(value) => {
                const cents = Math.round(parseFloat(value || 0) * 100)
                updateAdSetData({ bid_amount: cents })
              }}
            >
              <NumberInputField placeholder="0.00" />
            </NumberInput>
          </FormControl>
        )}

        {/* Attribution Model */}
        <FormControl>
          <FormLabel>Attribution Model</FormLabel>
          <Select defaultValue="standard">
            <option value="standard">Standard</option>
            <option value="1day_click">1 Day Click</option>
            <option value="7day_click">7 Day Click</option>
          </Select>
        </FormControl>

        <Divider />

        <Heading size="sm">Budget & Schedule</Heading>

        {/* Budget Strategy */}
        <FormControl isRequired>
          <FormLabel>Budget Strategy</FormLabel>
          <RadioGroup
            value={adSetData.budget_type || 'daily'}
            onChange={handleBudgetTypeChange}
          >
            <Stack direction="row">
              <Radio value="daily">Daily Budget</Radio>
              <Radio value="lifetime">Lifetime Budget</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        {/* Daily Budget */}
        {adSetData.budget_type === 'daily' && (
          <FormControl isRequired>
            <FormLabel>Daily Budget ($)</FormLabel>
            <NumberInput
              value={adSetData.daily_budget ? (adSetData.daily_budget / 100).toFixed(2) : ''}
              onChange={(value) => {
                const cents = Math.round(parseFloat(value || 0) * 100)
                updateAdSetData({ daily_budget: cents, lifetime_budget: null })
              }}
            >
              <NumberInputField placeholder="0.00" />
            </NumberInput>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Budget in cents: {adSetData.daily_budget || 0}
            </Text>
          </FormControl>
        )}

        {/* Lifetime Budget */}
        {adSetData.budget_type === 'lifetime' && (
          <FormControl isRequired>
            <FormLabel>Lifetime Budget ($)</FormLabel>
            <NumberInput
              value={adSetData.lifetime_budget ? (adSetData.lifetime_budget / 100).toFixed(2) : ''}
              onChange={(value) => {
                const cents = Math.round(parseFloat(value || 0) * 100)
                updateAdSetData({ lifetime_budget: cents, daily_budget: null })
              }}
            >
              <NumberInputField placeholder="0.00" />
            </NumberInput>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Budget in cents: {adSetData.lifetime_budget || 0}
            </Text>
          </FormControl>
        )}

        {/* Schedule */}
        <FormControl>
          <FormLabel>Start Date</FormLabel>
          <Input
            type="datetime-local"
            value={adSetData.start_time ? new Date(adSetData.start_time).toISOString().slice(0, 16) : ''}
            onChange={(e) => updateAdSetData({ start_time: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <Checkbox
            isChecked={!!adSetData.end_time}
            onChange={(e) => {
              if (!e.target.checked) {
                updateAdSetData({ end_time: null })
              }
            }}
          >
            Set an end date
          </Checkbox>
          {adSetData.end_time !== null && (
            <Input
              type="datetime-local"
              mt={2}
              value={adSetData.end_time ? new Date(adSetData.end_time).toISOString().slice(0, 16) : ''}
              onChange={(e) => updateAdSetData({ end_time: e.target.value })}
            />
          )}
        </FormControl>

        <Divider />

        <Heading size="sm">Audience</Heading>

        {/* Advantage+ */}
        <FormControl>
          <Checkbox defaultChecked>
            Advantage+ on
          </Checkbox>
        </FormControl>

        {/* Locations */}
        <FormControl>
          <FormLabel>Locations</FormLabel>
          <Input
            placeholder="Enter location (e.g., Turkey)"
            value={adSetData.targeting?.geo_locations?.countries?.join(', ') || ''}
            onChange={(e) => {
              const countries = e.target.value.split(',').map(c => c.trim()).filter(c => c)
              updateAdSetData({
                targeting: {
                  ...adSetData.targeting,
                  geo_locations: {
                    countries: countries
                  }
                }
              })
            }}
          />
          <HStack mt={2}>
            <Button size="xs">Include</Button>
            <Button size="xs">Exclude</Button>
            <Button size="xs">Browse</Button>
          </HStack>
        </FormControl>

        {/* Age */}
        <FormControl>
          <FormLabel>Age</FormLabel>
          <Text fontSize="sm">18 - 65+</Text>
          {/* Age slider would go here */}
        </FormControl>

        {/* Gender */}
        <FormControl>
          <FormLabel>Gender</FormLabel>
          <Select defaultValue="all">
            <option value="all">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </FormControl>

        {/* Languages */}
        <FormControl>
          <FormLabel>Languages</FormLabel>
          <Select defaultValue="all">
            <option value="all">All languages</option>
          </Select>
        </FormControl>

        <Divider />

        <Heading size="sm">Placements</Heading>

        {/* Advantage+ Placements */}
        <FormControl>
          <Checkbox defaultChecked>
            Advantage+ on
          </Checkbox>
        </FormControl>

        {/* Devices */}
        <FormControl>
          <FormLabel>Devices</FormLabel>
          <Select defaultValue="all">
            <option value="all">All devices (recommended)</option>
            <option value="mobile">Mobile devices</option>
            <option value="desktop">Desktop</option>
          </Select>
        </FormControl>

        <FormControl>
          <Checkbox>Only when connected to Wi-Fi</Checkbox>
        </FormControl>

        {/* Platforms */}
        <FormControl>
          <FormLabel>Platforms</FormLabel>
          <Text fontSize="sm">
            Facebook, Instagram, Audience Network, Messenger and Threads
          </Text>
        </FormControl>

        {/* Status */}
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            value={adSetData.status || 'PAUSED'}
            onChange={(e) => updateAdSetData({ status: e.target.value })}
          >
            <option value="PAUSED">Paused</option>
            <option value="ACTIVE">Active</option>
          </Select>
        </FormControl>
      </VStack>
    </Box>
  )
}
