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
  CheckboxGroup,
  Divider,
  NumberInput,
  NumberInputField,
  HStack,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderMark,
  Tag,
  TagLabel,
  TagCloseButton,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  SimpleGrid
} from '@chakra-ui/react'
import { useCampaign } from '../context/CampaignContext'
import { getAllowedOptimizationGoals, validateObjectiveOptimizationGoal } from '../utils/validators'
import { FACEBOOK_COUNTRIES } from '../utils/countries'
import { FACEBOOK_LANGUAGES } from '../utils/languages'
import { getPixelEventsForObjective } from '../utils/pixelEvents'

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
  const { adSetData, updateAdSetData, campaignData, selectedAssets } = useCampaign()
  const [allowedGoals, setAllowedGoals] = useState([])
  const [validationError, setValidationError] = useState('')
  const [availablePixelEvents, setAvailablePixelEvents] = useState([])

  useEffect(() => {
    // Update allowed optimization goals based on campaign objective
    if (campaignData.objective) {
      const goals = getAllowedOptimizationGoals(campaignData.objective)
      setAllowedGoals(goals)
      
      // Get available pixel events
      const events = getPixelEventsForObjective(campaignData.objective)
      setAvailablePixelEvents(events)
      
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

  // Auto-select pixel from selectedAssets
  useEffect(() => {
    if (selectedAssets.pixel && !adSetData.pixel) {
      updateAdSetData({ pixel: selectedAssets.pixel.pixel_id })
    }
  }, [selectedAssets.pixel, adSetData.pixel])

  // Auto-select Purchase conversion event by default
  useEffect(() => {
    if (adSetData.pixel && !adSetData.conversion_event && availablePixelEvents.length > 0) {
      const purchaseAvailable = availablePixelEvents.some(event => event.value === 'PURCHASE')
      if (purchaseAvailable) {
        updateAdSetData({ conversion_event: 'PURCHASE' })
      } else if (availablePixelEvents.length > 0) {
        updateAdSetData({ conversion_event: availablePixelEvents[0].value })
      }
    }
  }, [adSetData.pixel, adSetData.conversion_event, availablePixelEvents])

  // Always set start_time to current date and time on mount
  useEffect(() => {
    if (!adSetData.start_time) {
      const now = new Date()
      updateAdSetData({ start_time: now.toISOString() })
    }
  }, []) // Only run once on mount


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
        </FormControl>

        <Divider />

        {/* Pixel and Conversion Event */}
        <FormControl>
          <FormLabel>Select Your Pixel</FormLabel>
          {!selectedAssets.adAccount && (
            <Alert status="warning" fontSize="sm" mb={2}>
              <AlertIcon />
              Please select an Ad Account at Campaign level first
            </Alert>
          )}
          <HStack spacing={2}>
            <Select
              value={adSetData.pixel || ''}
              onChange={(e) => updateAdSetData({ pixel: e.target.value })}
              placeholder="Select Pixel"
              isDisabled={!selectedAssets.adAccount}
              flex={1}
            >
              {selectedAssets.pixel && (
                <option value={selectedAssets.pixel.pixel_id}>
                  {selectedAssets.pixel.name || selectedAssets.pixel.pixel_id}
                </option>
              )}
            </Select>
            <Select
              value={adSetData.conversion_event || ''}
              onChange={(e) => updateAdSetData({ conversion_event: e.target.value })}
              placeholder="Select Conversion Event"
              isDisabled={!adSetData.pixel}
              flex={1}
            >
              {availablePixelEvents.map(event => (
                <option key={event.value} value={event.value}>
                  {event.label}
                </option>
              ))}
            </Select>
          </HStack>
          {campaignData.objective && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              Showing events relevant for <strong>{campaignData.objective}</strong> objective
            </Text>
          )}
        </FormControl>

        {/* Cost per result goal */}
        <FormControl>
          <FormLabel>Cost per result goal</FormLabel>
          <NumberInput
            value={adSetData.cost_per_result != null ? (adSetData.cost_per_result / 100).toFixed(2) : ''}
            onChange={(value) => {
              const numValue = parseFloat(value || 0)
              if (!isNaN(numValue)) {
                const cents = Math.round(numValue * 100)
                updateAdSetData({ cost_per_result: cents })
              }
            }}
            min={0}
          >
            <NumberInputField placeholder="Enter cost per result" />
          </NumberInput>
        </FormControl>

        <Divider />

        {/* Bid Cap */}
        {campaignData.bid_strategy === 'LOWEST_COST_WITH_BID_CAP' && (
          <FormControl>
            <FormLabel>Bid Cap ($)</FormLabel>
            <NumberInput
              value={adSetData.bid_amount != null ? (adSetData.bid_amount / 100).toFixed(2) : ''}
              onChange={(value) => {
                const numValue = parseFloat(value || 0)
                if (!isNaN(numValue)) {
                  const cents = Math.round(numValue * 100)
                  updateAdSetData({ bid_amount: cents })
                }
              }}
            >
              <NumberInputField placeholder="0.00" />
            </NumberInput>
          </FormControl>
        )}

        <Divider />

        <Heading size="sm">Budget & Schedule</Heading>

        {/* Budget (only show when Advantage Campaign Budget is OFF) */}
        {!campaignData.advantage_plus_budget && (
          <FormControl>
            <FormLabel>Budget</FormLabel>
            <Box
              p={3}
              bg="blue.50"
              border="1px"
              borderColor="blue.200"
              borderRadius="md"
            >
              <HStack>
                <Text fontWeight="bold" minW="120px">Daily Budget</Text>
                <NumberInput
                  value={adSetData.daily_budget != null ? (adSetData.daily_budget / 100).toFixed(2) : ''}
                  onChange={(value) => {
                    const numValue = parseFloat(value || 0)
                    if (!isNaN(numValue)) {
                      const cents = Math.round(numValue * 100)
                      updateAdSetData({ daily_budget: cents })
                    }
                  }}
                  min={1}
                  flex={1}
                >
                  <NumberInputField placeholder="0.00" />
                </NumberInput>
                <Text color="gray.600">USD</Text>
              </HStack>
            </Box>
          </FormControl>
        )}

        {/* Show message when Advantage Campaign Budget is ON */}
        {campaignData.advantage_plus_budget && (
          <Alert status="info" fontSize="sm">
            <AlertIcon />
            Your Budget was set using Advantage Campaign Budget. Visit the Campaign level to make updates.
          </Alert>
        )}

        {/* Schedule */}
        <FormControl>
          <FormLabel>Schedule</FormLabel>
          <HStack spacing={2}>
            <Box flex={1}>
              <Text fontSize="xs" color="gray.500" mb={1}>Start Date</Text>
              <Input
                type="date"
                value={adSetData.start_time ? new Date(adSetData.start_time).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
                readOnly
                bg="gray.50"
                cursor="not-allowed"
              />
            </Box>
            <Box flex={1}>
              <Text fontSize="xs" color="gray.500" mb={1}>Time</Text>
              <Input
                type="time"
                value={adSetData.start_time ? new Date(adSetData.start_time).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5)}
                readOnly
                bg="gray.50"
                cursor="not-allowed"
              />
            </Box>
            <Box flex={1} pt={6}>
              <Checkbox
                isChecked={!!adSetData.end_time}
                onChange={(e) => {
                  if (!e.target.checked) {
                    updateAdSetData({ end_time: null })
                  } else {
                    // Set default end date to 30 days from start
                    const start = adSetData.start_time ? new Date(adSetData.start_time) : new Date()
                    const end = new Date(start)
                    end.setDate(end.getDate() + 30)
                    updateAdSetData({ end_time: end.toISOString() })
                  }
                }}
              >
                Set an end Date
              </Checkbox>
            </Box>
          </HStack>
          {adSetData.end_time && (
            <Input
              type="date"
              mt={2}
              value={adSetData.end_time ? new Date(adSetData.end_time).toISOString().slice(0, 10) : ''}
              onChange={(e) => {
                const date = e.target.value
                if (date) {
                  updateAdSetData({ end_time: `${date}T23:59:59` })
                } else {
                  updateAdSetData({ end_time: null })
                }
              }}
            />
          )}
        </FormControl>

        {/* Ad Set spending limits */}
        <FormControl>
          <FormLabel>Ad Set spending limits</FormLabel>
          <Checkbox>Ad Set spending limits</Checkbox>
        </FormControl>

        <Divider />

        <Heading size="sm">Audience Controls</Heading>

        {/* Locations */}
        <FormControl>
          <FormLabel>Locations</FormLabel>
          <HStack spacing={4} align="start">
            <Box flex={1}>
              <Text fontSize="xs" color="gray.500" mb={1}>Include</Text>
              <Text fontWeight="bold" fontSize="sm" mb={2}>Countries to Target</Text>
              {adSetData.targeting?.geo_locations?.countries?.length > 0 && (
                <HStack wrap="wrap" mb={2}>
                  {adSetData.targeting.geo_locations.countries.map((country, index) => (
                    <Tag key={index} size="sm">
                      <TagLabel>{typeof country === 'string' ? country : country.name}</TagLabel>
                      <TagCloseButton
                        onClick={() => {
                          const countries = [...(adSetData.targeting?.geo_locations?.countries || [])]
                          countries.splice(index, 1)
                          updateAdSetData({
                            targeting: {
                              ...adSetData.targeting,
                              geo_locations: {
                                ...adSetData.targeting?.geo_locations,
                                countries
                              }
                            }
                          })
                        }}
                      />
                    </Tag>
                  ))}
                </HStack>
              )}
              <Select
                placeholder="Search and select countries..."
                size="sm"
                onChange={(e) => {
                  if (e.target.value) {
                    const country = FACEBOOK_COUNTRIES.find(c => c.code === e.target.value)
                    if (country) {
                      const countries = [...(adSetData.targeting?.geo_locations?.countries || []), country]
                      updateAdSetData({
                        targeting: {
                          ...adSetData.targeting,
                          geo_locations: {
                            ...adSetData.targeting?.geo_locations,
                            countries
                          }
                        }
                      })
                      e.target.value = ''
                    }
                  }
                }}
              >
                {FACEBOOK_COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </Select>
            </Box>
            <Box flex={1}>
              <Text fontSize="xs" color="gray.500" mb={1}>Exclude</Text>
              <Text fontWeight="bold" fontSize="sm" mb={2}>Countries to Exclude</Text>
              {adSetData.targeting?.geo_locations?.excluded_countries?.length > 0 && (
                <HStack wrap="wrap" mb={2}>
                  {adSetData.targeting.geo_locations.excluded_countries.map((country, index) => (
                    <Tag key={index} size="sm">
                      <TagLabel>{typeof country === 'string' ? country : country.name}</TagLabel>
                      <TagCloseButton
                        onClick={() => {
                          const excluded = [...(adSetData.targeting?.geo_locations?.excluded_countries || [])]
                          excluded.splice(index, 1)
                          updateAdSetData({
                            targeting: {
                              ...adSetData.targeting,
                              geo_locations: {
                                ...adSetData.targeting?.geo_locations,
                                excluded_countries: excluded
                              }
                            }
                          })
                        }}
                      />
                    </Tag>
                  ))}
                </HStack>
              )}
              <Select
                placeholder="Search and select countries to exclude..."
                size="sm"
                onChange={(e) => {
                  if (e.target.value) {
                    const country = FACEBOOK_COUNTRIES.find(c => c.code === e.target.value)
                    const includedCodes = (adSetData.targeting?.geo_locations?.countries || []).map(c => typeof c === 'string' ? c : c.code)
                    if (country && !includedCodes.includes(country.code)) {
                      const excluded = [...(adSetData.targeting?.geo_locations?.excluded_countries || []), country]
                      updateAdSetData({
                        targeting: {
                          ...adSetData.targeting,
                          geo_locations: {
                            ...adSetData.targeting?.geo_locations,
                            excluded_countries: excluded
                          }
                        }
                      })
                      e.target.value = ''
                    }
                  }
                }}
              >
                {FACEBOOK_COUNTRIES.map(country => {
                  const includedCodes = (adSetData.targeting?.geo_locations?.countries || []).map(c => typeof c === 'string' ? c : c.code)
                  const isIncluded = includedCodes.includes(country.code)
                  return (
                    <option key={country.code} value={country.code} disabled={isIncluded}>
                      {country.name} {isIncluded && '(already included)'}
                    </option>
                  )
                })}
              </Select>
            </Box>
          </HStack>
          <Button size="xs" variant="link" mt={2} onClick={() => {
            updateAdSetData({
              targeting: {
                ...adSetData.targeting,
                geo_locations: {
                  countries: [],
                  excluded_countries: []
                }
              }
            })
          }}>
            Clear All
          </Button>
        </FormControl>

        {/* Age */}
        <FormControl>
          <FormLabel>Age</FormLabel>
          <Box px={2}>
            <RangeSlider
              aria-label={['Minimum age', 'Maximum age']}
              value={[adSetData.targeting?.age_min || 18, adSetData.targeting?.age_max || 65]}
              onChange={(val) => {
                updateAdSetData({
                  targeting: {
                    ...adSetData.targeting,
                    age_min: val[0],
                    age_max: val[1]
                  }
                })
              }}
              onChangeEnd={(val) => {
                updateAdSetData({
                  targeting: {
                    ...adSetData.targeting,
                    age_min: val[0],
                    age_max: val[1]
                  }
                })
              }}
              min={18}
              max={65}
              step={1}
            >
              <RangeSliderTrack>
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} />
              <RangeSliderThumb index={1} />
            </RangeSlider>
          </Box>
          <HStack justify="space-between" mt={2}>
            <Text fontSize="sm" fontWeight="bold">{adSetData.targeting?.age_min || 18}</Text>
            <Text fontSize="sm" fontWeight="bold">{adSetData.targeting?.age_max || 65}</Text>
          </HStack>
        </FormControl>

        {/* Gender */}
        <FormControl>
          <FormLabel>Gender</FormLabel>
          <Text fontSize="xs" color="gray.500" mb={2}>Gender Variant</Text>
          <HStack spacing={2}>
            <Button
              size="sm"
              colorScheme={adSetData.targeting?.gender === 'MALE' ? 'blue' : 'gray'}
              variant={adSetData.targeting?.gender === 'MALE' ? 'solid' : 'outline'}
              flex={1}
              onClick={() => updateAdSetData({
                targeting: {
                  ...adSetData.targeting,
                  gender: 'MALE'
                }
              })}
            >
              Male
            </Button>
            <Button
              size="sm"
              colorScheme={adSetData.targeting?.gender === 'FEMALE' ? 'blue' : 'gray'}
              variant={adSetData.targeting?.gender === 'FEMALE' ? 'solid' : 'outline'}
              flex={1}
              onClick={() => updateAdSetData({
                targeting: {
                  ...adSetData.targeting,
                  gender: 'FEMALE'
                }
              })}
            >
              Female
            </Button>
            <Button
              size="sm"
              colorScheme={(!adSetData.targeting?.gender || adSetData.targeting.gender === 'ALL') ? 'blue' : 'gray'}
              variant={(!adSetData.targeting?.gender || adSetData.targeting.gender === 'ALL') ? 'solid' : 'outline'}
              flex={1}
              onClick={() => updateAdSetData({
                targeting: {
                  ...adSetData.targeting,
                  gender: 'ALL'
                }
              })}
            >
              All
            </Button>
          </HStack>
        </FormControl>

        {/* Languages */}
        <FormControl>
          <FormLabel>Language</FormLabel>
          <Text fontSize="xs" color="gray.500" mb={2}>Languages</Text>
          {adSetData.targeting?.locales?.length > 0 && (
            <HStack wrap="wrap" mb={2}>
              {adSetData.targeting.locales.map((lang, index) => (
                <Tag key={index} size="sm">
                  <TagLabel>{typeof lang === 'number' ? FACEBOOK_LANGUAGES.find(l => l.id === lang)?.name : lang.name}</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      const locales = [...(adSetData.targeting?.locales || [])]
                      locales.splice(index, 1)
                      updateAdSetData({
                        targeting: {
                          ...adSetData.targeting,
                          locales
                        }
                      })
                    }}
                  />
                </Tag>
              ))}
            </HStack>
          )}
          <Select
            placeholder="Select Languages"
            size="sm"
            onChange={(e) => {
              if (e.target.value) {
                const langId = parseInt(e.target.value)
                const language = FACEBOOK_LANGUAGES.find(l => l.id === langId)
                if (language) {
                  const locales = [...(adSetData.targeting?.locales || []), langId]
                  updateAdSetData({
                    targeting: {
                      ...adSetData.targeting,
                      locales
                    }
                  })
                  e.target.value = ''
                }
              }
            }}
          >
            {FACEBOOK_LANGUAGES.map(language => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <Divider />

        <Heading size="sm">Beneficiary</Heading>

        <FormControl>
          <Input
            placeholder="Enter the beneficiary"
            value={adSetData.beneficiary || ''}
            onChange={(e) => updateAdSetData({ beneficiary: e.target.value })}
          />
        </FormControl>

        <Divider />

        <Heading size="sm">Placements</Heading>

        {/* Placement Type */}
        <FormControl>
          <RadioGroup
            value={adSetData.placement_type || 'ADVANTAGE_PLUS'}
            onChange={(value) => updateAdSetData({ placement_type: value })}
          >
            <VStack align="stretch" spacing={2}>
              <Card
                size="sm"
                border="2px"
                borderColor={adSetData.placement_type === 'ADVANTAGE_PLUS' ? 'blue.500' : 'gray.200'}
                bg={adSetData.placement_type === 'ADVANTAGE_PLUS' ? 'blue.50' : 'white'}
                cursor="pointer"
                onClick={() => updateAdSetData({ placement_type: 'ADVANTAGE_PLUS' })}
              >
                <CardBody>
                  <Radio value="ADVANTAGE_PLUS" isChecked={adSetData.placement_type === 'ADVANTAGE_PLUS'}>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">Advantage+ placements (recommended)</Text>
                      <Text fontSize="xs" color="gray.600">
                        Use Advantage+ placements to maximize your budget and show your ads to more people. Facebook's delivery system will allocate your ad set's budget across multiple placements based on where they're likely to perform best.
                      </Text>
                    </VStack>
                  </Radio>
                </CardBody>
              </Card>

              <Card
                size="sm"
                border="2px"
                borderColor={adSetData.placement_type === 'MANUAL' ? 'blue.500' : 'gray.200'}
                bg={adSetData.placement_type === 'MANUAL' ? 'blue.50' : 'white'}
                cursor="pointer"
                onClick={() => updateAdSetData({ placement_type: 'MANUAL' })}
              >
                <CardBody>
                  <Radio value="MANUAL" isChecked={adSetData.placement_type === 'MANUAL'}>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">Manual placements</Text>
                      <Text fontSize="xs" color="gray.600">
                        Manually choose the places to show your ad. The more placements you select, the more opportunities you'll have to reach your target audience and achieve your business goals.
                      </Text>
                    </VStack>
                  </Radio>
                </CardBody>
              </Card>
            </VStack>
          </RadioGroup>
        </FormControl>

        {/* Manual Placement Selector (simplified for now) */}
        {adSetData.placement_type === 'MANUAL' && (
          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Manual Placement Selection
            </Text>
            <Text fontSize="xs" color="gray.600" mb={4}>
              Full placement selector with devices, platforms, and placement categories will be implemented in Phase 7.
            </Text>
            
            {/* Devices */}
            <FormControl mb={4}>
              <FormLabel fontSize="sm">Select Devices</FormLabel>
              <CheckboxGroup
                value={adSetData.device_platforms || []}
                onChange={(values) => updateAdSetData({ device_platforms: values })}
              >
                <HStack>
                  <Checkbox value="mobile">Mobile</Checkbox>
                  <Checkbox value="desktop">Desktop</Checkbox>
                </HStack>
              </CheckboxGroup>
            </FormControl>

            {/* Platforms */}
            <FormControl>
              <FormLabel fontSize="sm">Platform</FormLabel>
              <CheckboxGroup
                value={adSetData.platforms || []}
                onChange={(values) => updateAdSetData({ platforms: values })}
              >
                <VStack align="start" spacing={2}>
                  <Checkbox value="facebook">Facebook</Checkbox>
                  <Checkbox value="instagram">Instagram</Checkbox>
                  <Checkbox value="audienceNetwork">Audience Network</Checkbox>
                  <Checkbox value="messenger">Messenger</Checkbox>
                </VStack>
              </CheckboxGroup>
            </FormControl>
          </Box>
        )}

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
