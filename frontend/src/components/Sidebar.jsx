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
  useDisclosure,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, AddIcon } from '@chakra-ui/icons'
import { useCampaign } from '../context/CampaignContext'
import { 
  getPages, 
  getAdAccounts, 
  getBusinessManagers, 
  getPixels,
  getBusinessAssets,
  getCurrentUser,
  getAllUsers
} from '../services/api'
import AddUserModal from './AddUserModal'

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
  const [currentUser, setCurrentUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isOpen: isAddUserOpen, onOpen: onAddUserOpen, onClose: onAddUserClose } = useDisclosure()

  // Load users, current user and business managers on mount
  useEffect(() => {
    loadAllUsers()
    loadCurrentUser()
    loadBusinessManagers()
  }, [])

  // Reload users when modal closes (after adding new user)
  const handleUserAdded = () => {
    loadAllUsers()
    loadBusinessManagers() // Reload assets for new user
  }

  // Reload business managers when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      loadBusinessManagers()
      // Reset selections when user changes
      setSelectedBusinessManager(null)
      setSelectedAdAccount(null)
      setSelectedPage(null)
      setSelectedPixel(null)
    }
  }, [selectedUserId])

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

  // Load pixels when ad account is selected or user changes
  useEffect(() => {
    if (selectedAdAccount && selectedAdAccount.account_id) {
      console.log('Ad account selected, loading pixels:', selectedAdAccount.account_id, 'for user:', selectedUserId)
      loadPixels(selectedAdAccount.account_id)
    } else {
      setPixels([])
    }
  }, [selectedAdAccount, selectedUserId])

  const loadAllUsers = async () => {
    try {
      const response = await getAllUsers()
      if (response.data.success && response.data.data) {
        setAllUsers(response.data.data)
        // Set first user as selected if none selected
        if (!selectedUserId && response.data.data.length > 0) {
          setSelectedUserId(response.data.data[0].user_id)
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadCurrentUser = async () => {
    try {
      const response = await getCurrentUser()
      if (response.data.success && response.data.data) {
        const userData = response.data.data
        setCurrentUser({
          name: userData.name || userData.id || 'Current User',
          picture: userData.picture?.data?.url || null
        })
      }
    } catch (error) {
      console.error('Error loading current user:', error)
      setCurrentUser({ name: 'Current User', picture: null }) // Fallback
    }
  }

  const selectedUser = allUsers.find(u => u.user_id === selectedUserId) || currentUser

  const loadBusinessManagers = async () => {
    try {
      setLoading(true)
      // Get user_name from selected user
      let userName = null
      if (selectedUserId) {
        const user = allUsers.find(u => u.user_id === selectedUserId)
        if (user) {
          userName = user.user_name
        }
      }
      console.log('Loading business managers for user:', userName)
      const response = await getBusinessManagers(userName)
      console.log('Business managers loaded:', response.data.data)
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
      let userName = null
      if (selectedUserId) {
        const user = allUsers.find(u => u.user_id === selectedUserId)
        if (user) {
          userName = user.user_name
        }
      }
      console.log('Loading ad accounts for business:', businessId, 'user:', userName)
      const response = await getAdAccounts(businessId, userName)
      console.log('Ad accounts loaded:', response.data.data)
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
      const params = businessId ? { business_id: businessId } : {}
      if (selectedUserId) {
        const user = allUsers.find(u => u.user_id === selectedUserId)
        if (user) {
          params.user_name = user.user_name
        }
      }
      const response = await getPages(businessId, params.user_name)
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
      // Ensure accountId is in the correct format (with act_ prefix for API call)
      // But the database stores it without act_ prefix
      const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`
      let userName = null
      if (selectedUserId) {
        const user = allUsers.find(u => u.user_id === selectedUserId)
        if (user) {
          userName = user.user_name
        }
      }
      console.log('Loading pixels for account:', accountId, 'user:', userName)
      const response = await getPixels(accountId, userName)
      console.log('Pixels loaded:', response.data.data)
      setPixels(response.data.data || [])
    } catch (error) {
      console.error('Error loading pixels:', error)
      setPixels([]) // Clear pixels on error
    } finally {
      setLoading(false)
    }
  }

  // Sync context whenever local state changes
  useEffect(() => {
    updateSelectedAssets({
      businessManager: selectedBusinessManager,
      adAccount: selectedAdAccount,
      page: selectedPage,
      pixel: selectedPixel,
      timezoneId: selectedAdAccount?.timezone_id || null
    })
  }, [selectedBusinessManager, selectedAdAccount, selectedPage, selectedPixel, updateSelectedAssets])

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
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="bold">
                Select FB Profile
              </Text>
              <IconButton
                icon={<AddIcon />}
                size="xs"
                onClick={onAddUserOpen}
                aria-label="Add new user"
              />
            </HStack>
            <Select
              placeholder="Select profile"
              value={selectedUserId || ''}
              onChange={(e) => {
                setSelectedUserId(e.target.value)
              }}
            >
              {allUsers.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.user_name || user.user_id}
                </option>
              ))}
            </Select>
            {selectedUser && (
              <HStack spacing={2} mt={2}>
                {selectedUser.user_picture_url && (
                  <Avatar
                    size="sm"
                    src={selectedUser.user_picture_url}
                    name={selectedUser.user_name}
                  />
                )}
                <Text fontSize="xs" color="gray.600">
                  {selectedUser.user_name || selectedUser.user_id}
                </Text>
              </HStack>
            )}
          </Box>

          <AddUserModal
            isOpen={isAddUserOpen}
            onClose={onAddUserClose}
            onUserAdded={handleUserAdded}
          />

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
