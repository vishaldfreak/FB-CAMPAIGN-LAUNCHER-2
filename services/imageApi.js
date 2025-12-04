/**
 * Image Upload API Service
 * Phase 5: Upload images to Meta API
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import tokenService from './tokenService.js';
import dotenv from 'dotenv';

dotenv.config();

const FB_API_VERSION = process.env.FB_API_VERSION || 'v24.0';
const BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

/**
 * Upload image to Meta API
 * CRITICAL: Use FormData builder, not JSON
 */
export async function uploadImage(adAccountId, imageFile) {
  try {
    // Validate token
    tokenService.validateToken();

    const formData = new FormData();

    // Handle different input types
    if (typeof imageFile === 'string') {
      // File path
      if (!fs.existsSync(imageFile)) {
        throw new Error(`Image file not found: ${imageFile}`);
      }
      const filename = path.basename(imageFile);
      formData.append('bytes', fs.createReadStream(imageFile));
    } else if (Buffer.isBuffer(imageFile)) {
      // Buffer
      formData.append('bytes', imageFile, 'image.jpg');
    } else if (imageFile instanceof File || imageFile.stream) {
      // File object (from multipart upload)
      formData.append('bytes', imageFile.stream || imageFile, imageFile.name || 'image.jpg');
    } else {
      throw new Error('Invalid image file format. Expected file path, Buffer, or File object.');
    }

    // Add access token
    formData.append('access_token', tokenService.getToken());

    // Make request
    const accountId = adAccountId.replace('act_', '');
    const url = `${BASE_URL}/act_${accountId}/adimages`;

    const response = await axios.post(url, formData, {
      headers: {
        // CRITICAL: Let FormData set Content-Type with boundary
        ...formData.getHeaders()
      },
      timeout: 60000
    });

    // Response format: { "images": { "filename.jpg": { "hash": "...", ... } } }
    const imageData = response.data.images;
    const firstImage = Object.values(imageData)[0];

    return {
      success: true,
      hash: firstImage.hash,
      url: firstImage.url,
      data: firstImage
    };
  } catch (error) {
    console.error('Error uploading image:', error.response?.data || error.message);
    throw error;
  }
}

export default {
  uploadImage
};
