/**
 * Meta API Service
 * Phase 1: Asset fetching with pagination, rate limiting, and error handling
 */

import axios from 'axios';
import tokenService from './tokenService.js';
import dotenv from 'dotenv';

dotenv.config();

const FB_API_VERSION = process.env.FB_API_VERSION || 'v24.0';
const BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

// Rate limiting configuration
const RATE_LIMIT_DELAYS = [1000, 2000, 4000, 8000, 16000, 32000, 60000]; // milliseconds
const MAX_RETRIES = 7;
const MAX_PAGINATION_PAGES = 100; // Safety limit

/**
 * Sleep utility for rate limiting
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Make API request with rate limiting and retry logic
 */
async function makeRequest(url, params = {}, retryCount = 0) {
  try {
    // Validate token before request
    tokenService.validateToken();

    const response = await axios.get(url, {
      params: {
        ...params,
        access_token: tokenService.getToken()
      },
      timeout: 30000
    });

    // Check rate limit headers
    const businessUsage = response.headers['x-business-use-case-usage'];
    const appUsage = response.headers['x-app-usage'];
    
    if (businessUsage || appUsage) {
      console.log('Rate limit headers:', { businessUsage, appUsage });
      // Could implement proactive throttling here
    }

    return response;
  } catch (error) {
    if (error.response) {
      const errorCode = error.response.data?.error?.code;
      const errorSubcode = error.response.data?.error?.error_subcode;

      // Handle rate limiting errors
      if (errorCode === 17 || errorCode === 613 || errorSubcode === 2446003 || errorCode === 80002 || errorCode === 80004) {
        if (retryCount < MAX_RETRIES) {
          const delay = RATE_LIMIT_DELAYS[retryCount] || 300000; // 5 minutes for final retries
          console.warn(`Rate limit hit. Retrying in ${delay / 1000} seconds... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await sleep(delay);
          return makeRequest(url, params, retryCount + 1);
        }
      }

      // Log error (redact token)
      const errorMessage = tokenService.redactToken(JSON.stringify(error.response.data));
      console.error('API Error:', errorMessage);
      throw error;
    }

    throw error;
  }
}

/**
 * Fetch all pages with pagination
 */
async function fetchPages(pageCount = 0) {
  if (pageCount >= MAX_PAGINATION_PAGES) {
    console.warn(`⚠️  Reached pagination safety limit (${MAX_PAGINATION_PAGES} pages)`);
    return [];
  }

  try {
    const url = `${BASE_URL}/me/accounts`;
    const params = {
      fields: 'id,name,access_token,category,business'
    };

    const response = await makeRequest(url, params);
    let pages = response.data.data || [];

    // Handle pagination
    if (response.data.paging && response.data.paging.next) {
      console.log(`Fetching next page of pages... (page ${pageCount + 1})`);
      const nextUrl = response.data.paging.next;
      const nextPages = await fetchPagesFromUrl(nextUrl, pageCount + 1);
      pages = pages.concat(nextPages);
    }

    return pages;
  } catch (error) {
    console.error('Error fetching pages:', error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * Fetch pages from pagination URL
 */
async function fetchPagesFromUrl(url, pageCount = 0) {
  if (pageCount >= MAX_PAGINATION_PAGES) {
    return [];
  }

  try {
    const response = await axios.get(url, { timeout: 30000 });
    let pages = response.data.data || [];

    if (response.data.paging && response.data.paging.next) {
      const nextPages = await fetchPagesFromUrl(response.data.paging.next, pageCount + 1);
      pages = pages.concat(nextPages);
    }

    return pages;
  } catch (error) {
    console.error('Error fetching paginated pages:', error.message);
    return [];
  }
}

/**
 * Fetch all ad accounts with pagination
 */
async function fetchAdAccounts(pageCount = 0) {
  if (pageCount >= MAX_PAGINATION_PAGES) {
    console.warn(`⚠️  Reached pagination safety limit (${MAX_PAGINATION_PAGES} pages)`);
    return [];
  }

  try {
    const url = `${BASE_URL}/me/adaccounts`;
    const params = {
      fields: 'id,name,account_status,currency,timezone_id,business'
    };

    const response = await makeRequest(url, params);
    let adAccounts = response.data.data || [];

    // Fetch timezone_id for each ad account if not included
    for (let account of adAccounts) {
      if (!account.timezone_id && account.id) {
        try {
          const accountId = account.id.replace('act_', '');
          const accountUrl = `${BASE_URL}/act_${accountId}`;
          const accountResponse = await makeRequest(accountUrl, { fields: 'timezone_id' });
          account.timezone_id = accountResponse.data.timezone_id;
        } catch (err) {
          console.warn(`Could not fetch timezone for account ${account.id}`);
        }
      }
    }

    // Handle pagination
    if (response.data.paging && response.data.paging.next) {
      console.log(`Fetching next page of ad accounts... (page ${pageCount + 1})`);
      const nextUrl = response.data.paging.next;
      const nextAccounts = await fetchAdAccountsFromUrl(nextUrl, pageCount + 1);
      adAccounts = adAccounts.concat(nextAccounts);
    }

    return adAccounts;
  } catch (error) {
    console.error('Error fetching ad accounts:', error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * Fetch ad accounts from pagination URL
 */
async function fetchAdAccountsFromUrl(url, pageCount = 0) {
  if (pageCount >= MAX_PAGINATION_PAGES) {
    return [];
  }

  try {
    const response = await axios.get(url, { timeout: 30000 });
    let adAccounts = response.data.data || [];

    if (response.data.paging && response.data.paging.next) {
      const nextAccounts = await fetchAdAccountsFromUrl(response.data.paging.next, pageCount + 1);
      adAccounts = adAccounts.concat(nextAccounts);
    }

    return adAccounts;
  } catch (error) {
    console.error('Error fetching paginated ad accounts:', error.message);
    return [];
  }
}

/**
 * Fetch all business managers with pagination
 */
async function fetchBusinessManagers(pageCount = 0) {
  if (pageCount >= MAX_PAGINATION_PAGES) {
    console.warn(`⚠️  Reached pagination safety limit (${MAX_PAGINATION_PAGES} pages)`);
    return [];
  }

  try {
    const url = `${BASE_URL}/me/businesses`;
    const params = {
      fields: 'id,name'
    };

    const response = await makeRequest(url, params);
    let businesses = response.data.data || [];

    // Handle pagination
    if (response.data.paging && response.data.paging.next) {
      console.log(`Fetching next page of business managers... (page ${pageCount + 1})`);
      const nextUrl = response.data.paging.next;
      const nextBusinesses = await fetchBusinessManagersFromUrl(nextUrl, pageCount + 1);
      businesses = businesses.concat(nextBusinesses);
    }

    return businesses;
  } catch (error) {
    console.error('Error fetching business managers:', error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * Fetch business managers from pagination URL
 */
async function fetchBusinessManagersFromUrl(url, pageCount = 0) {
  if (pageCount >= MAX_PAGINATION_PAGES) {
    return [];
  }

  try {
    const response = await axios.get(url, { timeout: 30000 });
    let businesses = response.data.data || [];

    if (response.data.paging && response.data.paging.next) {
      const nextBusinesses = await fetchBusinessManagersFromUrl(response.data.paging.next, pageCount + 1);
      businesses = businesses.concat(nextBusinesses);
    }

    return businesses;
  } catch (error) {
    console.error('Error fetching paginated business managers:', error.message);
    return [];
  }
}

/**
 * Fetch ad accounts for a specific business manager
 * Fetches both owned_ad_accounts and client_ad_accounts
 */
async function fetchAdAccountsForBusiness(businessId, pageCount = 0) {
  if (pageCount >= MAX_PAGINATION_PAGES) {
    console.warn(`⚠️  Reached pagination safety limit (${MAX_PAGINATION_PAGES} pages)`);
    return [];
  }

  const allAdAccounts = [];

  try {
    // Fetch owned ad accounts for this business
    try {
      const ownedUrl = `${BASE_URL}/${businessId}/owned_ad_accounts`;
      const ownedParams = {
        fields: 'id,name,account_status,currency,timezone_id,business'
      };

      const ownedResponse = await makeRequest(ownedUrl, ownedParams);
      let ownedAccounts = ownedResponse.data.data || [];

      // Handle pagination for owned accounts
      if (ownedResponse.data.paging && ownedResponse.data.paging.next) {
        const nextAccounts = await fetchAdAccountsFromUrl(ownedResponse.data.paging.next, pageCount + 1);
        ownedAccounts = ownedAccounts.concat(nextAccounts);
      }

      allAdAccounts.push(...ownedAccounts);
      console.log(`Found ${ownedAccounts.length} owned ad accounts for business ${businessId}`);
    } catch (error) {
      console.warn(`Could not fetch owned_ad_accounts for business ${businessId}:`, error.response?.data?.error?.message || error.message);
    }

    // Fetch client ad accounts (shared/assigned accounts)
    try {
      const clientUrl = `${BASE_URL}/${businessId}/client_ad_accounts`;
      const clientParams = {
        fields: 'id,name,account_status,currency,timezone_id,business'
      };

      const clientResponse = await makeRequest(clientUrl, clientParams);
      let clientAccounts = clientResponse.data.data || [];

      // Handle pagination for client accounts
      if (clientResponse.data.paging && clientResponse.data.paging.next) {
        const nextAccounts = await fetchAdAccountsFromUrl(clientResponse.data.paging.next, pageCount + 1);
        clientAccounts = clientAccounts.concat(nextAccounts);
      }

      allAdAccounts.push(...clientAccounts);
      console.log(`Found ${clientAccounts.length} client ad accounts for business ${businessId}`);
    } catch (error) {
      console.warn(`Could not fetch client_ad_accounts for business ${businessId}:`, error.response?.data?.error?.message || error.message);
    }

    // Deduplicate by account ID
    const uniqueAccounts = Array.from(
      new Map(allAdAccounts.map(acc => [acc.id, acc])).values()
    );

    // Fetch timezone_id for each ad account if not included
    for (let account of uniqueAccounts) {
      if (!account.timezone_id && account.id) {
        try {
          const accountId = account.id.replace('act_', '');
          const accountUrl = `${BASE_URL}/act_${accountId}`;
          const accountResponse = await makeRequest(accountUrl, { fields: 'timezone_id' });
          account.timezone_id = accountResponse.data.timezone_id;
        } catch (err) {
          console.warn(`Could not fetch timezone for account ${account.id}`);
        }
      }
    }

    return uniqueAccounts;
  } catch (error) {
    console.error(`Error fetching ad accounts for business ${businessId}:`, error.response?.data?.error || error.message);
    // Return empty array if no access or error
    return [];
  }
}

/**
 * Fetch pixels for an ad account
 */
async function fetchPixels(adAccountId) {
  try {
    // Remove 'act_' prefix if present
    const accountId = adAccountId.replace('act_', '');
    const url = `${BASE_URL}/act_${accountId}/pixels`;
    const params = {
      fields: 'id,name,owner_business'
    };

    const response = await makeRequest(url, params);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching pixels:', error.response?.data?.error || error.message);
    // Return empty array if no pixels or permission denied
    return [];
  }
}

export default {
  fetchPages,
  fetchAdAccounts,
  fetchAdAccountsForBusiness,
  fetchBusinessManagers,
  fetchPixels
};
