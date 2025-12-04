/**
 * Dashboard Page
 * Phase 1: Display fetched assets
 */

import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Badge
} from '@chakra-ui/react'
import { syncAssets, getPages, getAdAccounts, getBusinessManagers } from '../services/api'

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [stats, setStats] = useState({
    pages: 0,
    adAccounts: 0,
    businessManagers: 0,
    lastSynced: null
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [pagesRes, accountsRes, bmsRes] = await Promise.all([
        getPages(),
        getAdAccounts(),
        getBusinessManagers()
      ])

      setStats({
        pages: pagesRes.data.data?.length || 0,
        adAccounts: accountsRes.data.data?.length || 0,
        businessManagers: bmsRes.data.data?.length || 0,
        lastSynced: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const response = await syncAssets()
      
      if (response.data.success) {
        // Reload stats
        await loadStats()
        alert('Assets synced successfully!')
      }
    } catch (error) {
      console.error('Error syncing assets:', error)
      alert('Error syncing assets: ' + (error.response?.data?.error || error.message))
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Asset Dashboard</Heading>
        <Button
          colorScheme="blue"
          onClick={handleSync}
          isLoading={syncing}
          loadingText="Syncing..."
        >
          Fetch Assets
        </Button>
      </HStack>

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <SimpleGrid columns={3} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="start">
                <Text fontSize="sm" color="gray.500">
                  Business Managers
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                  {stats.businessManagers}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start">
                <Text fontSize="sm" color="gray.500">
                  Ad Accounts
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                  {stats.adAccounts}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start">
                <Text fontSize="sm" color="gray.500">
                  Pages
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                  {stats.pages}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {stats.lastSynced && (
        <Alert status="info" mt={4}>
          <AlertIcon />
          <Text fontSize="sm">
            Last synced: {new Date(stats.lastSynced).toLocaleString()}
          </Text>
        </Alert>
      )}
    </Box>
  )
}
