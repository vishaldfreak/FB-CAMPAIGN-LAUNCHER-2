/**
 * Database Service
 * Phase 1: Database operations for assets
 */

import supabase from './supabase.js';

/**
 * Upsert pages
 */
export async function upsertPages(pages) {
  const pagesData = pages.map(page => ({
    page_id: page.id,
    name: page.name || 'Untitled Page',
    access_token: page.access_token || null,
    category: page.category || null,
    business_id: page.business?.id || null,
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('pages')
    .upsert(pagesData, {
      onConflict: 'page_id',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error('Error upserting pages:', error);
    throw error;
  }

  return data;
}

/**
 * Upsert ad accounts
 */
export async function upsertAdAccounts(adAccounts) {
  const accountsData = adAccounts.map(account => ({
    account_id: account.id.replace('act_', ''),
    name: account.name || account.id,
    account_status: account.account_status || null,
    currency: account.currency || null,
    timezone_id: account.timezone_id || null,
    business_id: account.business?.id || null,
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('ad_accounts')
    .upsert(accountsData, {
      onConflict: 'account_id',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error('Error upserting ad accounts:', error);
    throw error;
  }

  return data;
}

/**
 * Upsert business managers
 */
export async function upsertBusinessManagers(businesses) {
  const businessesData = businesses.map(business => ({
    business_id: business.id,
    name: business.name || 'Untitled Business',
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('business_managers')
    .upsert(businessesData, {
      onConflict: 'business_id',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error('Error upserting business managers:', error);
    throw error;
  }

  return data;
}

/**
 * Upsert pixels
 */
export async function upsertPixels(pixels, adAccountId) {
  const pixelsData = pixels.map(pixel => ({
    pixel_id: pixel.id,
    name: pixel.name || 'Untitled Pixel',
    ad_account_id: adAccountId.replace('act_', ''),
    owner_business_id: pixel.owner_business?.id || null,
    permission_level: 'unknown', // Will be validated later
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('pixels')
    .upsert(pixelsData, {
      onConflict: 'pixel_id',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error('Error upserting pixels:', error);
    throw error;
  }

  return data;
}

/**
 * Normalize business assets relationships
 */
export async function normalizeBusinessAssets(pages, adAccounts, pixels) {
  const assets = [];

  // Add page relationships
  pages.forEach(page => {
    if (page.business?.id) {
      assets.push({
        business_id: page.business.id,
        asset_type: 'page',
        asset_id: page.id,
        permission_type: 'owned', // Default, can be refined
        permission_level: 'admin' // Default, can be refined
      });
    }
  });

  // Add ad account relationships
  adAccounts.forEach(account => {
    if (account.business?.id) {
      assets.push({
        business_id: account.business.id,
        asset_type: 'ad_account',
        asset_id: account.id,
        permission_type: 'owned',
        permission_level: 'admin'
      });
    }
  });

  // Add pixel relationships
  pixels.forEach(pixel => {
    if (pixel.owner_business?.id) {
      assets.push({
        business_id: pixel.owner_business.id,
        asset_type: 'pixel',
        asset_id: pixel.id,
        permission_type: 'owned',
        permission_level: 'admin'
      });
    }
  });

  if (assets.length === 0) return [];

  const { data, error } = await supabase
    .from('business_assets')
    .upsert(assets, {
      onConflict: 'business_id,asset_type,asset_id',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error('Error normalizing business assets:', error);
    throw error;
  }

  return data;
}

/**
 * Record sync history
 */
export async function recordSyncHistory(syncType, itemsCount, status = 'success') {
  const { data, error } = await supabase
    .from('sync_history')
    .insert({
      sync_type: syncType,
      last_synced_at: new Date().toISOString(),
      items_count: itemsCount,
      status: status
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording sync history:', error);
    // Don't throw - sync history is not critical
  }

  return data;
}

/**
 * Get all pages
 * If businessId is provided, filter by business_id OR by business_assets relationship
 */
export async function getPages(businessId = null) {
  if (businessId) {
    // First, get page IDs from business_assets table for this business
    const { data: businessAssets, error: assetsError } = await supabase
      .from('business_assets')
      .select('asset_id')
      .eq('business_id', businessId)
      .eq('asset_type', 'page');

    if (assetsError) {
      console.error('Error fetching business assets:', assetsError);
      throw assetsError;
    }

    // Extract page IDs
    const pageIds = (businessAssets || []).map(asset => asset.asset_id);

    // Fetch pages with direct business_id match
    const { data: directPages, error: directError } = await supabase
      .from('pages')
      .select('*')
      .eq('business_id', businessId);

    if (directError) {
      console.error('Error fetching direct pages:', directError);
      throw directError;
    }

    // Fetch pages from business_assets relationships
    let assetPages = [];
    if (pageIds.length > 0) {
      const { data: assetsData, error: assetsQueryError } = await supabase
        .from('pages')
        .select('*')
        .in('page_id', pageIds);

      if (assetsQueryError) {
        console.error('Error fetching asset pages:', assetsQueryError);
        throw assetsQueryError;
      }

      assetPages = assetsData || [];
    }

    // Combine and deduplicate by page_id
    const allPages = [...(directPages || []), ...assetPages];
    const uniquePages = Array.from(
      new Map(allPages.map(page => [page.page_id, page])).values()
    );

    // Sort by name
    uniquePages.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return uniquePages;
  } else {
    // No business filter - return all pages
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }

    return data || [];
  }
}

/**
 * Get all ad accounts
 * If businessId is provided, filter by business_id OR by business_assets relationship
 */
export async function getAdAccounts(businessId = null) {
  if (businessId) {
    // First, get ad account IDs from business_assets table for this business
    const { data: businessAssets, error: assetsError } = await supabase
      .from('business_assets')
      .select('asset_id')
      .eq('business_id', businessId)
      .eq('asset_type', 'ad_account');

    if (assetsError) {
      console.error('Error fetching business assets:', assetsError);
      throw assetsError;
    }

    // Extract account IDs (remove 'act_' prefix if present)
    const accountIds = (businessAssets || []).map(asset => 
      asset.asset_id.replace('act_', '')
    );

    // Fetch accounts with direct business_id match
    const { data: directAccounts, error: directError } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('business_id', businessId);

    if (directError) {
      console.error('Error fetching direct ad accounts:', directError);
      throw directError;
    }

    // Fetch accounts from business_assets relationships
    let assetAccounts = [];
    if (accountIds.length > 0) {
      // Use 'in' filter for multiple account IDs
      const { data: assetsData, error: assetsQueryError } = await supabase
        .from('ad_accounts')
        .select('*')
        .in('account_id', accountIds);

      if (assetsQueryError) {
        console.error('Error fetching asset ad accounts:', assetsQueryError);
        throw assetsQueryError;
      }

      assetAccounts = assetsData || [];
    }

    // Combine and deduplicate by account_id
    const allAccounts = [...(directAccounts || []), ...assetAccounts];
    const uniqueAccounts = Array.from(
      new Map(allAccounts.map(acc => [acc.account_id, acc])).values()
    );

    // Sort by name
    uniqueAccounts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return uniqueAccounts;
  } else {
    // No business filter - return all ad accounts
    const { data, error } = await supabase
      .from('ad_accounts')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching ad accounts:', error);
      throw error;
    }

    return data || [];
  }
}

/**
 * Get all business managers
 */
export async function getBusinessManagers() {
  const { data, error } = await supabase
    .from('business_managers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching business managers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get pixels for ad account
 */
export async function getPixels(adAccountId) {
  const accountId = adAccountId.replace('act_', '');
  
  const { data, error } = await supabase
    .from('pixels')
    .select('*')
    .eq('ad_account_id', accountId);

  if (error) {
    console.error('Error fetching pixels:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get business assets
 */
export async function getBusinessAssets(businessId) {
  const { data, error } = await supabase
    .from('business_assets')
    .select('*')
    .eq('business_id', businessId);

  if (error) {
    console.error('Error fetching business assets:', error);
    throw error;
  }

  return data || [];
}
