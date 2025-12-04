/**
 * Add User Modal Component
 * Modal to add a new user access token
 */

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  VStack,
  Text,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { useState } from 'react'
import { addUserToken, syncUserAssets } from '../services/api'

export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [tokenUrl, setTokenUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const parseTokenFromUrl = (url) => {
    // Extract token from URL like: access_token=XXX&data_access_expiration_time=YYY&expires_in=ZZZ
    const params = new URLSearchParams(url.split('?')[1] || url)
    return {
      access_token: params.get('access_token') || url.trim(),
      expires_in: params.get('expires_in'),
      data_access_expiration_time: params.get('data_access_expiration_time')
    }
  }

  const handleSubmit = async () => {
    if (!tokenUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an access token',
        status: 'error',
        duration: 3000
      })
      return
    }

    try {
      setLoading(true)
      
      // Parse token from URL or use as-is
      const tokenData = parseTokenFromUrl(tokenUrl)
      
      // Add user token
      const response = await addUserToken(tokenData)
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'User added successfully! Syncing assets...',
          status: 'success',
          duration: 3000
        })

        // Sync assets for the new user
        try {
          await syncUserAssets(response.data.data.user_id)
          toast({
            title: 'Success',
            description: 'Assets synced successfully!',
            status: 'success',
            duration: 3000
          })
        } catch (syncError) {
          console.error('Error syncing assets:', syncError)
          toast({
            title: 'Warning',
            description: 'User added but asset sync failed. You can sync manually later.',
            status: 'warning',
            duration: 5000
          })
        }

        // Reset form
        setTokenUrl('')
        onClose()
        
        // Notify parent to refresh user list
        if (onUserAdded) {
          onUserAdded()
        }
      }
    } catch (error) {
      console.error('Error adding user:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'Failed to add user',
        status: 'error',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info" fontSize="sm">
              <AlertIcon />
              Paste the access token URL or just the token. The system will extract the token and fetch user information.
            </Alert>

            <FormControl>
              <FormLabel>Access Token</FormLabel>
              <Textarea
                placeholder="Paste access token URL or token here..."
                value={tokenUrl}
                onChange={(e) => setTokenUrl(e.target.value)}
                rows={4}
                fontFamily="monospace"
                fontSize="sm"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Example: access_token=EAA...&data_access_expiration_time=1234567890&expires_in=3600
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Adding..."
          >
            Add User
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
