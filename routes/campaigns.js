/**
 * Campaign Routes
 * Phase 3-6: Campaign, Ad Set, Creative, and Ad creation endpoints
 */

import express from 'express';
import campaignApi from '../services/campaignApi.js';
import imageApi from '../services/imageApi.js';
import * as validators from '../utils/validators.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * POST /api/campaigns/create
 * Create a campaign
 */
router.post('/campaigns/create', async (req, res) => {
  try {
    const { adAccountId, ...campaignData } = req.body;

    if (!adAccountId) {
      return res.status(400).json({
        success: false,
        error: 'adAccountId is required'
      });
    }

    const result = await campaignApi.createCampaign(adAccountId, campaignData);

    res.json({
      success: true,
      campaign_id: result.id,
      data: result.data
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/adsets/create
 * Create an ad set
 */
router.post('/adsets/create', async (req, res) => {
  try {
    const { adAccountId, campaignId, ...adSetData } = req.body;

    if (!adAccountId || !campaignId) {
      return res.status(400).json({
        success: false,
        error: 'adAccountId and campaignId are required'
      });
    }

    // Validate budget type
    const budgetValidation = validators.validateBudgetType(
      adSetData.daily_budget,
      adSetData.lifetime_budget
    );
    if (!budgetValidation.valid) {
      return res.status(400).json({
        success: false,
        error: budgetValidation.error
      });
    }

    const result = await campaignApi.createAdSet(adAccountId, campaignId, adSetData);

    res.json({
      success: true,
      adset_id: result.id,
      data: result.data
    });
  } catch (error) {
    console.error('Error creating ad set:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/images/upload
 * Upload an image
 */
router.post('/images/upload', upload.single('image'), async (req, res) => {
  try {
    const { adAccountId } = req.body;

    if (!adAccountId) {
      return res.status(400).json({
        success: false,
        error: 'adAccountId is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    const result = await imageApi.uploadImage(adAccountId, req.file.buffer);

    res.json({
      success: true,
      image_hash: result.hash,
      url: result.url,
      data: result.data
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/creatives/create
 * Create an ad creative (standard)
 */
router.post('/creatives/create', async (req, res) => {
  try {
    const { adAccountId, ...creativeData } = req.body;

    if (!adAccountId) {
      return res.status(400).json({
        success: false,
        error: 'adAccountId is required'
      });
    }

    // Validate creative type
    const creativeValidation = validators.validateCreativeType(
      creativeData.object_story_spec,
      creativeData.asset_feed_spec
    );
    if (!creativeValidation.valid) {
      return res.status(400).json({
        success: false,
        error: creativeValidation.error
      });
    }

    const result = await campaignApi.createAdCreative(adAccountId, creativeData);

    res.json({
      success: true,
      creative_id: result.id,
      data: result.data
    });
  } catch (error) {
    console.error('Error creating creative:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/creatives/create-with-placements
 * Create an ad creative with placement customization
 */
router.post('/creatives/create-with-placements', async (req, res) => {
  try {
    const { adAccountId, ...creativeData } = req.body;

    if (!adAccountId) {
      return res.status(400).json({
        success: false,
        error: 'adAccountId is required'
      });
    }

    // Validate asset_feed_spec
    if (creativeData.asset_feed_spec) {
      const assetFeedValidation = validators.validateAssetFeedSpec(creativeData.asset_feed_spec);
      if (!assetFeedValidation.valid) {
        return res.status(400).json({
          success: false,
          error: assetFeedValidation.error
        });
      }
    }

    const result = await campaignApi.createAdCreativeWithPlacements(adAccountId, creativeData);

    res.json({
      success: true,
      creative_id: result.id,
      data: result.data
    });
  } catch (error) {
    console.error('Error creating creative with placements:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/ads/create
 * Create an ad
 */
router.post('/ads/create', async (req, res) => {
  try {
    const { adAccountId, adSetId, creativeId, ...adData } = req.body;

    if (!adAccountId || !adSetId || !creativeId) {
      return res.status(400).json({
        success: false,
        error: 'adAccountId, adSetId, and creativeId are required'
      });
    }

    const result = await campaignApi.createAd(adAccountId, adSetId, creativeId, adData);

    res.json({
      success: true,
      ad_id: result.id,
      data: result.data
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/campaigns/create-full
 * Create complete campaign flow (Campaign → AdSet → Creative → Ad)
 * Phase 8: Full flow with rollback handling
 */
router.post('/campaigns/create-full', async (req, res) => {
  try {
    const { adAccountId, campaign, adset, creative, ad } = req.body;

    if (!adAccountId) {
      return res.status(400).json({
        success: false,
        error: 'adAccountId is required'
      });
    }

    const createdIds = {};
    const errors = [];

    try {
      // Step 1: Create Campaign
      const campaignResult = await campaignApi.createCampaign(adAccountId, campaign);
      createdIds.campaign_id = campaignResult.id;
      console.log(`✅ Campaign created: ${campaignResult.id}`);

      // Step 2: Create Ad Set
      const adSetResult = await campaignApi.createAdSet(
        adAccountId,
        campaignResult.id,
        { ...adset, campaign_objective: campaign.objective }
      );
      createdIds.adset_id = adSetResult.id;
      console.log(`✅ Ad Set created: ${adSetResult.id}`);

      // Step 3: Create Creative
      let creativeResult;
      if (creative.asset_feed_spec) {
        // Placement customization
        creativeResult = await campaignApi.createAdCreativeWithPlacements(adAccountId, creative);
      } else {
        // Standard creative
        creativeResult = await campaignApi.createAdCreative(adAccountId, creative);
      }
      createdIds.creative_id = creativeResult.id;
      console.log(`✅ Creative created: ${creativeResult.id}`);

      // Step 4: Create Ad
      const adResult = await campaignApi.createAd(
        adAccountId,
        adSetResult.id,
        creativeResult.id,
        ad
      );
      createdIds.ad_id = adResult.id;
      console.log(`✅ Ad created: ${adResult.id}`);

      res.json({
        success: true,
        message: 'Campaign created successfully',
        ids: createdIds
      });
    } catch (error) {
      // Rollback: Store created IDs for manual cleanup
      console.error('Error in campaign creation flow:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.error?.error_user_msg ||
                          error.message || 
                          'Unknown error occurred';
      
      res.status(500).json({
        success: false,
        error: errorMessage,
        error_details: error.response?.data?.error || error.response?.data,
        created_ids: createdIds, // Return created IDs for cleanup
        message: 'Campaign creation failed. Some resources may have been created. Use created_ids for cleanup.'
      });
    }
  } catch (error) {
    console.error('Error in full campaign creation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
