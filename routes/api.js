/**
 * API Routes
 * Phase 0 & 1: Token management and asset endpoints
 */

import express from 'express';
import tokenService from '../services/tokenService.js';
import metaApi from '../services/metaApi.js';
import * as dbService from '../services/dbService.js';
import campaignRoutes from './campaigns.js';

const router = express.Router();

/**
 * GET /api/token/status
 * Get token expiration status
 */
router.get('/token/status', (req, res) => {
  try {
    const status = tokenService.getExpirationStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync-assets
 * Fetch and store all assets from Meta API
 */
router.post('/sync-assets', async (req, res) => {
  try {
    console.log('Starting asset sync...');
    
    // Fetch all assets
    const [pages, adAccounts, businesses] = await Promise.all([
      metaApi.fetchPages(),
      metaApi.fetchAdAccounts(),
      metaApi.fetchBusinessManagers()
    ]);

    console.log(`Fetched ${pages.length} pages, ${adAccounts.length} ad accounts, ${businesses.length} businesses`);

    // Store in database
    const [storedPages, storedAccounts, storedBusinesses] = await Promise.all([
      dbService.upsertPages(pages),
      dbService.upsertAdAccounts(adAccounts),
      dbService.upsertBusinessManagers(businesses)
    ]);

    // Fetch ad accounts for each business manager to get all relationships
    console.log('Fetching ad accounts for each business manager...');
    const allBusinessAdAccounts = [];
    for (const business of businesses) {
      try {
        const businessAdAccounts = await metaApi.fetchAdAccountsForBusiness(business.id);
        if (businessAdAccounts.length > 0) {
          console.log(`Found ${businessAdAccounts.length} ad accounts for business ${business.id}`);
          // Set business_id for these accounts
          businessAdAccounts.forEach(acc => {
            acc.business = { id: business.id };
          });
          allBusinessAdAccounts.push(...businessAdAccounts);
        }
      } catch (error) {
        console.warn(`Could not fetch ad accounts for business ${business.id}:`, error.message);
      }
    }

    // Upsert business-specific ad accounts (this will update business_id)
    if (allBusinessAdAccounts.length > 0) {
      console.log(`Upserting ${allBusinessAdAccounts.length} business-specific ad accounts...`);
      await dbService.upsertAdAccounts(allBusinessAdAccounts);
    }

    // Combine all ad accounts (personal + business)
    const allAdAccounts = [...adAccounts, ...allBusinessAdAccounts];
    // Deduplicate by account ID
    const uniqueAdAccounts = Array.from(
      new Map(allAdAccounts.map(acc => [acc.id, acc])).values()
    );

    // Fetch pixels for all ad accounts
    const allPixels = [];
    for (const account of uniqueAdAccounts) {
      try {
        const pixels = await metaApi.fetchPixels(account.id);
        if (pixels.length > 0) {
          await dbService.upsertPixels(pixels, account.id);
          allPixels.push(...pixels);
        }
      } catch (error) {
        console.warn(`Could not fetch pixels for account ${account.id}:`, error.message);
      }
    }

    // Normalize business assets (use all ad accounts including business-specific ones)
    await dbService.normalizeBusinessAssets(pages, uniqueAdAccounts, allPixels);

    // Record sync history
    await dbService.recordSyncHistory('full', 
      pages.length + adAccounts.length + businesses.length + allPixels.length,
      'success'
    );

    res.json({
      success: true,
      data: {
        pages: storedPages.length,
        adAccounts: storedAccounts.length,
        businesses: storedBusinesses.length,
        pixels: allPixels.length
      },
      message: 'Assets synced successfully'
    });
  } catch (error) {
    console.error('Error syncing assets:', error);
    
    // Record failed sync
    await dbService.recordSyncHistory('full', 0, 'failed').catch(() => {});

    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * GET /api/pages
 * Get all pages
 */
router.get('/pages', async (req, res) => {
  try {
    const businessId = req.query.business_id || null;
    const pages = await dbService.getPages(businessId);
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/ad-accounts
 * Get all ad accounts
 */
router.get('/ad-accounts', async (req, res) => {
  try {
    const businessId = req.query.business_id || null;
    const adAccounts = await dbService.getAdAccounts(businessId);
    res.json({ success: true, data: adAccounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/business-managers
 * Get all business managers
 */
router.get('/business-managers', async (req, res) => {
  try {
    const businesses = await dbService.getBusinessManagers();
    res.json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pixels/:adAccountId
 * Get pixels for an ad account
 */
router.get('/pixels/:adAccountId', async (req, res) => {
  try {
    const { adAccountId } = req.params;
    const pixels = await dbService.getPixels(adAccountId);
    
    // TODO: Re-validate pixel permissions at request time (Phase 1 enhancement)
    
    res.json({ success: true, data: pixels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/business-assets/:businessId
 * Get all assets for a business
 */
router.get('/business-assets/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const assets = await dbService.getBusinessAssets(businessId);
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/sync-assets/refresh
 * Re-sync assets
 */
router.post('/sync-assets/refresh', async (req, res) => {
  // Same as /sync-assets but with explicit refresh intent
  req.url = '/sync-assets';
  router.handle(req, res);
});

// Campaign routes (Phase 3-6)
router.use('/', campaignRoutes);

export default router;
