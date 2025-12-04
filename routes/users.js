/**
 * User Management Routes
 * Handle multiple user tokens and profiles
 */

import express from 'express';
import * as userTokenService from '../services/userTokenService.js';
import metaApi from '../services/metaApi.js';
import * as dbService from '../services/dbService.js';

const router = express.Router();

/**
 * POST /api/users/add-token
 * Add a new user token
 */
router.post('/add-token', async (req, res) => {
  try {
    const { access_token, expires_in, data_access_expiration_time } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'access_token is required'
      });
    }

    // Save user token
    const userToken = await userTokenService.saveUserToken({
      access_token,
      expires_in: expires_in ? parseInt(expires_in) : null,
      data_access_expiration_time: data_access_expiration_time ? parseInt(data_access_expiration_time) : null
    });

    res.json({
      success: true,
      data: userToken,
      message: 'User token added successfully'
    });
  } catch (error) {
    console.error('Error adding user token:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * GET /api/users
 * Get all users
 */
router.get('/', async (req, res) => {
  try {
    const users = await userTokenService.getAllUserTokens();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:userId
 * Get user by ID
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userTokenService.getUserToken(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/users/:userId
 * Delete/deactivate a user
 */
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await userTokenService.deleteUserToken(userId);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/users/:userId/sync-assets
 * Sync assets for a specific user
 */
router.post('/:userId/sync-assets', async (req, res) => {
  try {
    const { userId } = req.params;
    const userToken = await userTokenService.getUserToken(userId);

    if (!userToken) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (userTokenService.isTokenExpired(userToken)) {
      return res.status(400).json({
        success: false,
        error: 'User token has expired'
      });
    }

    // Create a temporary metaApi instance with the user's token
    // We'll need to pass the token directly to metaApi functions
    // For now, temporarily update the token service
    const tokenService = (await import('../services/tokenService.js')).default;
    const originalToken = tokenService.getToken();
    
    // Update token service with user's token
    tokenService.updateToken(
      userToken.access_token,
      userToken.expires_in,
      userToken.data_access_expiration_time
    );

    try {
      // Fetch current user information
      let userName = userToken.user_name;
      const userTokenValue = userToken.access_token;
      
      // Fetch all assets
      const [pages, adAccounts, businesses] = await Promise.all([
        metaApi.fetchPages(),
        metaApi.fetchAdAccounts(),
        metaApi.fetchBusinessManagers()
      ]);

      console.log(`Fetched ${pages.length} pages, ${adAccounts.length} ad accounts, ${businesses.length} businesses for user ${userName}`);

      // Store in database with user info
      const [storedPages, storedAccounts, storedBusinesses] = await Promise.all([
        dbService.upsertPages(pages, userName, userTokenValue),
        dbService.upsertAdAccounts(adAccounts, userName, userTokenValue),
        dbService.upsertBusinessManagers(businesses, userName, userTokenValue)
      ]);

      // Fetch ad accounts for each business manager
      const allBusinessAdAccounts = [];
      for (const business of businesses) {
        try {
          const businessAdAccounts = await metaApi.fetchAdAccountsForBusiness(business.id);
          if (businessAdAccounts.length > 0) {
            businessAdAccounts.forEach(acc => {
              acc.business = { id: business.id };
            });
            allBusinessAdAccounts.push(...businessAdAccounts);
          }
        } catch (error) {
          console.warn(`Could not fetch ad accounts for business ${business.id}:`, error.message);
        }
      }

      if (allBusinessAdAccounts.length > 0) {
        await dbService.upsertAdAccounts(allBusinessAdAccounts, userName, userTokenValue);
      }

      const allAdAccounts = [...adAccounts, ...allBusinessAdAccounts];
      const uniqueAdAccounts = Array.from(
        new Map(allAdAccounts.map(acc => [acc.id, acc])).values()
      );

      // Fetch pixels
      const allPixels = [];
      for (const account of uniqueAdAccounts) {
        try {
          const pixels = await metaApi.fetchPixels(account.id);
          if (pixels.length > 0) {
            await dbService.upsertPixels(pixels, account.id, userName, userTokenValue);
            allPixels.push(...pixels);
          }
        } catch (error) {
          console.warn(`Could not fetch pixels for account ${account.id}:`, error.message);
        }
      }

      await dbService.normalizeBusinessAssets(pages, uniqueAdAccounts, allPixels);
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
    } finally {
      // Restore original token
      if (originalToken) {
        tokenService.updateToken(originalToken);
      }
    }
  } catch (error) {
    console.error('Error syncing assets for user:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

export default router;
