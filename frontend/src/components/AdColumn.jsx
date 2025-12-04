/**
 * Ad Column Component
 * Phase 5-6: Ad creative and ad configuration
 */

import { useState } from 'react'
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
  Textarea
} from '@chakra-ui/react'
import { useCampaign } from '../context/CampaignContext'

export default function AdColumn() {
  const { creativeData, updateCreativeData, adData, updateAdData } = useCampaign()
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imageHash, setImageHash] = useState(creativeData.image_hash || null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result)
    }
    reader.readAsDataURL(file)

    // TODO: Upload to backend in Phase 5
    // For now, just store the file
  }

  return (
    <Box
      h="calc(100vh - 120px)"
      overflowY="auto"
      p={4}
      bg="white"
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Ad</Heading>

        <Divider />

        <Heading size="sm">Destination</Heading>

        {/* Destination Type */}
        <FormControl>
          <FormLabel>Destination</FormLabel>
          <RadioGroup
            value={creativeData.destination_type || 'website'}
            onChange={(value) => updateCreativeData({ destination_type: value })}
          >
            <Stack direction="row">
              <Radio value="website">Website</Radio>
              <Radio value="app">App</Radio>
              <Radio value="messenger">Messenger</Radio>
              <Radio value="whatsapp">WhatsApp</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        {/* Website URL */}
        {creativeData.destination_type === 'website' && (
          <>
            <FormControl>
              <FormLabel>Website URL</FormLabel>
              <Input
                placeholder="https://example.com/page"
                value={creativeData.website_url || ''}
                onChange={(e) => updateCreativeData({ website_url: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Display Link</FormLabel>
              <Input
                placeholder="Enter the link you want to show on your ad"
                value={creativeData.display_link || ''}
                onChange={(e) => updateCreativeData({ display_link: e.target.value })}
              />
            </FormControl>
          </>
        )}

        <Divider />

        <Heading size="sm">Ad Creative</Heading>

        {/* Creative Setup */}
        <FormControl>
          <FormLabel>Creative Setup</FormLabel>
          <Select
            value={creativeData.format || 'standard'}
            onChange={(e) => updateCreativeData({ format: e.target.value })}
          >
            <option value="standard">Manual upload (Image)</option>
            <option value="placement_customization">Placement Customization</option>
          </Select>
        </FormControl>

        {/* Media Upload */}
        <FormControl>
          <FormLabel>Media</FormLabel>
          <Box
            border="2px dashed"
            borderColor="gray.300"
            borderRadius="md"
            p={4}
            textAlign="center"
          >
            {uploadedImage ? (
              <VStack spacing={2}>
                <Image src={uploadedImage} maxH="200px" />
                <Button size="sm" onClick={() => {
                  setUploadedImage(null)
                  setImageHash(null)
                }}>
                  Remove
                </Button>
              </VStack>
            ) : (
              <>
                <Text mb={2}>Feeds, In-stream ads for reels</Text>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  display="none"
                  id="image-upload"
                />
                <Button
                  as="label"
                  htmlFor="image-upload"
                  cursor="pointer"
                  size="sm"
                >
                  Upload Image
                </Button>
              </>
            )}
          </Box>
        </FormControl>

        {/* Placement Customization (Phase 7) */}
        {creativeData.format === 'placement_customization' && (
          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Placement Customization
            </Text>
            <Text fontSize="xs" color="gray.600">
              Placement-specific customization will be implemented in Phase 7
            </Text>
            <Text fontSize="xs" color="gray.600" mt={2}>
              Each placement can have custom: Image, Description, Headline, Destination URL
            </Text>
          </Box>
        )}

        {/* Standard Creative Fields */}
        {creativeData.format === 'standard' && (
          <>
            <FormControl>
              <FormLabel>Headline</FormLabel>
              <Input
                placeholder="Enter headline"
                value={creativeData.headline || ''}
                onChange={(e) => updateCreativeData({ headline: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Enter description"
                value={creativeData.description || ''}
                onChange={(e) => updateCreativeData({ description: e.target.value })}
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Call to Action</FormLabel>
              <Select
                value={creativeData.call_to_action || ''}
                onChange={(e) => updateCreativeData({ call_to_action: e.target.value })}
                placeholder="Select CTA"
              >
                <option value="SHOP_NOW">Shop Now</option>
                <option value="LEARN_MORE">Learn More</option>
                <option value="SIGN_UP">Sign Up</option>
                <option value="DOWNLOAD">Download</option>
              </Select>
            </FormControl>
          </>
        )}

        <Divider />

        {/* Ad Name */}
        <FormControl>
          <FormLabel>Ad Name</FormLabel>
          <Input
            value={adData.name}
            onChange={(e) => updateAdData({ name: e.target.value })}
            placeholder="Enter ad name"
          />
        </FormControl>

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
      </VStack>
    </Box>
  )
}
