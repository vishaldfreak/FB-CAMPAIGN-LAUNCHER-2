import { useState, useEffect } from 'react'
import { Box, Container, Heading, Button, VStack, HStack, Text, Alert, AlertIcon, Spinner } from '@chakra-ui/react'
import { CampaignProvider } from './context/CampaignContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CampaignBuilder from './pages/CampaignBuilder'
import { getTokenStatus } from './services/api'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [tokenStatus, setTokenStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check token status on mount
    checkTokenStatus()
    
    // Check token status every minute
    const interval = setInterval(checkTokenStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkTokenStatus = async () => {
    try {
      const response = await getTokenStatus()
      setTokenStatus(response.data)
    } catch (error) {
      console.error('Error checking token status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CampaignProvider>
      <Box minH="100vh" bg="gray.50">
        {/* Token Status Alert */}
        {tokenStatus && tokenStatus.status === 'active' && (
          <Alert 
            status={tokenStatus.alertLevel === 'critical' ? 'error' : tokenStatus.alertLevel === 'warning' ? 'warning' : 'info'}
            borderRadius="0"
          >
            <AlertIcon />
            <Text fontSize="sm">
              {tokenStatus.message} 
              {tokenStatus.alertLevel === 'critical' && ' - Please update token soon!'}
            </Text>
          </Alert>
        )}

        <Container maxW="full" p={0}>
          <HStack align="stretch" spacing={0}>
            {/* Sidebar */}
            <Sidebar 
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />

            {/* Main Content */}
            <Box flex="1" p={6}>
              {loading ? (
                <Spinner size="xl" />
            ) : currentPage === 'dashboard' ? (
              <Dashboard />
            ) : currentPage === 'campaign-builder' ? (
              <CampaignBuilder />
            ) : (
              <Dashboard />
            )}
            </Box>
          </HStack>
        </Container>
      </Box>
    </CampaignProvider>
  )
}

export default App
