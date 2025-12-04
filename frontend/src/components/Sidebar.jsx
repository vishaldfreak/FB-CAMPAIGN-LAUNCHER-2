/**
 * Sidebar Component
 * Phase 2: Asset selection with dropdowns
 */

import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Select,
  Button,
  Text,
  Heading,
  Divider,
  Collapse,
  IconButton,
  useDisclosure
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { useCampaign } from '../context/CampaignContext'
import { 
  getPages, 
  getAdAccounts, 
  getBusinessManagers, 
  getPixels,
  getBusinessAssets 
} from '../services/api'

export default function Sidebar({ currentPage, onPageChange }) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  const { selectedAssets, updateSelectedAssets } = useCampaign()
  
  // Local state for dropdowns
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [selectedBusinessManager, setSelectedBusinessManager] = useState(selectedAssets.businessManager)
  const [selectedAdAccount, setSelectedAdAccount] = useState(selectedAssets.adAccount)
  const [selectedPage, setSelectedPage] = useState(selectedAssets.page)
  const [selectedPixel, setSelectedPixel] = useState(selectedAssets.pixel)

  // Data for dropdowns
  const [businessManagers, setBusinessManagers] = useState([])
  const [adAccounts, setAdAccounts] = useState([])
  const [pages, setPages] = useState([])
  const [pixels, setPixels] = useState([])
  const [loading, setLoading] = useState(false)

  // Load business managers on mount
  useEffect(() => {
    loadBusinessManagers()
  }, [])

  // Load ad accounts when BM is selected
  useEffect(() => {
    if (selectedBusinessManager) {
      loadAdAccounts(selectedBusinessManager.business_id)
      loadPages(selectedBusinessManager.business_id)
    } else {
      setAdAccounts([])
      setPages([])
    }
  }, [selectedBusinessManager])

  // Load pixels when ad account is selected
  useEffect(() => {
    if (selectedAdAccount) {
      loadPixels(selectedAdAccount.account_id)
    } else {
      setPixels([])
    }
  }, [selectedAdAccount])

  const loadBusinessManagers = async () => {
    try {
      setLoading(true)
      const response = await getBusinessManagers()
      setBusinessManagers(response.data.data || [])
    } catch (error) {
      console.error('Error loading business managers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAdAccounts = async (businessId) => {
    try {
      setLoading(true)
      const response = await getAdAccounts(businessId)
      setAdAccounts(response.data.data || [])
    } catch (error) {
      console.error('Error loading ad accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPages = async (businessId) => {
    try {
      setLoading(true)
      const response = await getPages(businessId)
      setPages(response.data.data || [])
    } catch (error) {
      console.error('Error loading pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPixels = async (adAccountId) => {
    try {
      setLoading(true)
      const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`
      const response = await getPixels(accountId)
      setPixels(response.data.data || [])
    } catch (error) {
      console.error('Error loading pixels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelection = () => {
    // Update context with selected assets
    updateSelectedAssets({
      businessManager: selectedBusinessManager,
      adAccount: selectedAdAccount,
      page: selectedPage,
      pixel: selectedPixel,
      timezoneId: selectedAdAccount?.timezone_id || null
    })

    // Auto-hide sidebar after selection (if all required fields selected)
    if (selectedBusinessManager && selectedAdAccount && selectedPage) {
      // Could auto-hide here if desired
    }
  }

  return (
    <Box
      w={isOpen ? "300px" : "60px"}
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      transition="width 0.3s"
      position="relative"
    >
      <IconButton
        icon={isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        onClick={onToggle}
        position="absolute"
        top={4}
        right={-4}
        zIndex={10}
        size="sm"
        borderRadius="full"
        bg="white"
        boxShadow="md"
      />

      <Collapse in={isOpen} animateOpacity>
        <VStack align="stretch" p={4} spacing={4}>
          <Heading size="md">Asset Selection</Heading>
          <Divider />

          {/* Select FB Profile */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Select FB Profile
            </Text>
            <Select
              placeholder="Select profile"
              value={selectedProfile?.id || ''}
              onChange={(e) => {
                setSelectedProfile({ id: e.target.value })
                handleSelection()
              }}
            >
              <option value="current">Current User</option>
            </Select>
          </Box>

          {/* Select Business Manager */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Select Business Manager
            </Text>
            <Select
              placeholder="Select Business Manager"
              value={selectedBusinessManager?.business_id || ''}
              onChange={(e) => {
                const bm = businessManagers.find(b => b.business_id === e.target.value)
                setSelectedBusinessManager(bm || null)
                setSelectedAdAccount(null)
                setSelectedPixel(null)
                setSelectedPage(null)
                handleSelection()
              }}
            >
              {businessManagers.map(bm => (
                <option key={bm.business_id} value={bm.business_id}>
                  {bm.name}
                </option>
              ))}
            </Select>
          </Box>

          {/* Select Ad Account */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Select Ad Account
            </Text>
            <Select
              placeholder="Select Ad Account"
              value={selectedAdAccount?.account_id || ''}
              onChange={(e) => {
                const account = adAccounts.find(a => a.account_id === e.target.value)
                setSelectedAdAccount(account || null)
                setSelectedPixel(null)
                handleSelection()
              }}
              isDisabled={!selectedBusinessManager}
            >
              {adAccounts.map(account => (
                <option key={account.account_id} value={account.account_id}>
                  {account.name} ({account.account_id})
                </option>
              ))}
            </Select>
          </Box>

          {/* Select Pages */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Select Pages
            </Text>
            <Select
              placeholder="Select Page"
              value={selectedPage?.page_id || ''}
              onChange={(e) => {
                const page = pages.find(p => p.page_id === e.target.value)
                setSelectedPage(page || null)
                handleSelection()
              }}
              isDisabled={!selectedBusinessManager}
            >
              {pages.map(page => (
                <option key={page.page_id} value={page.page_id}>
                  {page.name}
                </option>
              ))}
            </Select>
          </Box>

          {/* Select Pixel/Dataset */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Select Pixel/Dataset
            </Text>
            <Select
              placeholder="Select Pixel"
              value={selectedPixel?.pixel_id || ''}
              onChange={(e) => {
                const pixel = pixels.find(p => p.pixel_id === e.target.value)
                setSelectedPixel(pixel || null)
                handleSelection()
              }}
              isDisabled={!selectedAdAccount}
            >
              {pixels.map(pixel => (
                <option key={pixel.pixel_id} value={pixel.pixel_id}>
                  {pixel.name || pixel.pixel_id}
                </option>
              ))}
            </Select>
          </Box>

          <Divider />
          <Text fontSize="xs" color="gray.500" fontStyle="italic">
            Auto hide sidebar after selection
          </Text>

          {/* Navigation */}
          <VStack spacing={2} mt={4}>
            <Button
              size="sm"
              w="full"
              colorScheme={currentPage === 'dashboard' ? 'blue' : 'gray'}
              onClick={() => onPageChange('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              w="full"
              colorScheme={currentPage === 'campaign-builder' ? 'blue' : 'gray'}
              onClick={() => onPageChange('campaign-builder')}
              isDisabled={!selectedBusinessManager || !selectedAdAccount || !selectedPage}
            >
              Campaign Builder
            </Button>
          </VStack>
        </VStack>
      </Collapse>
    </Box>
  )
}
