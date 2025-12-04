/**
 * Ad Column Component
 * Phase 5-6: Ad creative and ad configuration
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
  Divider,
  Image,
  Textarea,
  HStack,
  Checkbox,
  Card,
  CardBody,
  IconButton,
  SimpleGrid,
  Tag,
  TagLabel,
  TagCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { DeleteIcon, AddIcon } from '@chakra-ui/icons'
import { useCampaign } from '../context/CampaignContext'

const CALL_TO_ACTIONS = [
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'BOOK_TRAVEL', label: 'Book Travel' },
  { value: 'GET_QUOTE', label: 'Get Quote' }
]

export default function AdColumn() {
  const { creativeData, updateCreativeData, adData, updateAdData, selectedAssets } = useCampaign()
  const [uploadedImages, setUploadedImages] = useState(creativeData.media || [])
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useDisclosure()

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = files.map(file => {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            url: reader.result,
            thumbUrl: reader.result
          })
        }
        reader.readAsDataURL(file)
      })
    })

    const images = await Promise.all(newImages)
    const updatedImages = [...uploadedImages, ...images]
    setUploadedImages(updatedImages)
    updateCreativeData({ media: updatedImages })
  }

  const handleRemoveImage = (index) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(updatedImages)
    updateCreativeData({ media: updatedImages })
  }

  // Page and Instagram account are already selected in sidebar, no need to select again

  // Website is always the destination type
  useEffect(() => {
    if (creativeData.destination_type !== 'website') {
      updateCreativeData({ destination_type: 'website' })
    }
  }, [])

  return (
    <Box
      h="calc(100vh - 120px)"
      overflowY="auto"
      p={4}
      bg="white"
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Ad</Heading>

        {/* Ad Name */}
        <FormControl>
          <HStack>
            <Input
              value={adData.name}
              onChange={(e) => updateAdData({ name: e.target.value })}
              placeholder="New Ad"
              flex={1}
            />
            <Button
              variant="outline"
              onClick={onImportOpen}
            >
              Import
            </Button>
          </HStack>
        </FormControl>

        <Divider />

        <Heading size="sm">Ad creative</Heading>

        {/* Media Upload */}
        <FormControl>
          <FormLabel>Media</FormLabel>
          {uploadedImages.length > 0 ? (
            <VStack spacing={2} align="stretch">
              <SimpleGrid columns={3} spacing={2}>
                {uploadedImages.map((img, index) => (
                  <Box key={index} position="relative" border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden">
                    <Image src={img.url || img.thumbUrl} alt={img.name} maxH="120px" w="100%" objectFit="cover" />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="xs"
                      colorScheme="red"
                      position="absolute"
                      top={1}
                      right={1}
                      onClick={() => handleRemoveImage(index)}
                      aria-label="Remove image"
                    />
                    <Box p={2} bg="white">
                      <Text fontSize="xs" noOfLines={1}>{img.name}</Text>
                      {img.size && (
                        <Text fontSize="xs" color="gray.500">
                          {(img.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
              <HStack>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleImageUpload}
                  display="none"
                  id="media-upload"
                />
                <Button
                  as="label"
                  htmlFor="media-upload"
                  cursor="pointer"
                  size="sm"
                  variant="outline"
                  leftIcon={<AddIcon />}
                >
                  Add More Media
                </Button>
                <Button size="sm" colorScheme="blue">
                  Upload All to FB
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Box
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="md"
              p={8}
              textAlign="center"
            >
              <Text mb={2}>Click or drag image files to this area to upload</Text>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Support for single or bulk upload. Images only.
              </Text>
              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleImageUpload}
                display="none"
                id="media-upload"
              />
              <Button
                as="label"
                htmlFor="media-upload"
                cursor="pointer"
                colorScheme="blue"
                leftIcon={<AddIcon />}
              >
                Select Files
              </Button>
            </Box>
          )}
        </FormControl>

        {/* Primary Text */}
        <FormControl>
          <FormLabel>Primary text</FormLabel>
          <Textarea
            placeholder="Enter primary text..."
            value={creativeData.primary_text || ''}
            onChange={(e) => updateCreativeData({ primary_text: e.target.value })}
            rows={4}
          />
        </FormControl>

        {/* Headline */}
        <FormControl>
          <FormLabel>Headline</FormLabel>
          <Input
            placeholder="Enter headline..."
            value={creativeData.headline || ''}
            onChange={(e) => updateCreativeData({ headline: e.target.value })}
          />
        </FormControl>

        {/* Description */}
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            placeholder="Enter Description..."
            value={creativeData.description || ''}
            onChange={(e) => updateCreativeData({ description: e.target.value })}
            rows={3}
          />
        </FormControl>

        <Divider />

        {/* Call to Action */}
        <FormControl>
          <FormLabel>Call to action</FormLabel>
          <Select
            value={creativeData.call_to_action || ''}
            onChange={(e) => updateCreativeData({ call_to_action: e.target.value })}
            placeholder="Select CTA"
          >
            {CALL_TO_ACTIONS.map(cta => (
              <option key={cta.value} value={cta.value}>
                {cta.label}
              </option>
            ))}
          </Select>
        </FormControl>

        <Divider />

        {/* Ad Status */}
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            value={adData.status || 'PAUSED'}
            onChange={(e) => updateAdData({ status: e.target.value })}
          >
            <option value="PAUSED">Paused</option>
            <option value="ACTIVE">Active</option>
          </Select>
        </FormControl>

        {/* Import Saved Ad Modal */}
        <Modal isOpen={isImportOpen} onClose={onImportClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Import Saved Ad</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Alert status="info" mb={4}>
                <AlertIcon />
                Import functionality will be implemented in a future phase.
              </Alert>
              <Text fontSize="sm" color="gray.600">
                This feature will allow you to import previously saved ad configurations.
              </Text>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}
