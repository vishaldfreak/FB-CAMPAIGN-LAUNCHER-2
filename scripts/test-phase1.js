/**
 * Phase 1 Testing Script
 * Test asset fetching and storage
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3001';

async function testPhase1() {
  console.log('='.repeat(60));
  console.log('Phase 1: Testing Asset Fetching & Storage');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Test 1: Token Status
    console.log('Test 1: Token Status');
    const tokenRes = await axios.get(`${API_BASE_URL}/api/token/status`);
    console.log('✅ Token Status:', tokenRes.data.status);
    console.log(`   Expires in: ${tokenRes.data.remainingMinutes} minutes`);
    console.log('');

    // Test 2: Sync Assets
    console.log('Test 2: Syncing Assets from Meta API...');
    const syncRes = await axios.post(`${API_BASE_URL}/api/sync-assets`);
    console.log('✅ Sync completed:', syncRes.data.message);
    console.log('   Pages:', syncRes.data.data.pages);
    console.log('   Ad Accounts:', syncRes.data.data.adAccounts);
    console.log('   Business Managers:', syncRes.data.data.businesses);
    console.log('   Pixels:', syncRes.data.data.pixels);
    console.log('');

    // Test 3: Get Pages
    console.log('Test 3: Retrieving Pages from Database');
    const pagesRes = await axios.get(`${API_BASE_URL}/api/pages`);
    console.log(`✅ Retrieved ${pagesRes.data.data.length} pages`);
    if (pagesRes.data.data.length > 0) {
      console.log('   Sample:', pagesRes.data.data[0].name);
    }
    console.log('');

    // Test 4: Get Ad Accounts
    console.log('Test 4: Retrieving Ad Accounts from Database');
    const accountsRes = await axios.get(`${API_BASE_URL}/api/ad-accounts`);
    console.log(`✅ Retrieved ${accountsRes.data.data.length} ad accounts`);
    if (accountsRes.data.data.length > 0) {
      console.log('   Sample:', accountsRes.data.data[0].name);
    }
    console.log('');

    // Test 5: Get Business Managers
    console.log('Test 5: Retrieving Business Managers from Database');
    const bmsRes = await axios.get(`${API_BASE_URL}/api/business-managers`);
    console.log(`✅ Retrieved ${bmsRes.data.data.length} business managers`);
    if (bmsRes.data.data.length > 0) {
      console.log('   Sample:', bmsRes.data.data[0].name);
    }
    console.log('');

    // Test 6: Get Pixels for first ad account
    if (accountsRes.data.data.length > 0) {
      const firstAccount = accountsRes.data.data[0];
      console.log(`Test 6: Retrieving Pixels for Ad Account ${firstAccount.account_id}`);
      try {
        const pixelsRes = await axios.get(`${API_BASE_URL}/api/pixels/act_${firstAccount.account_id}`);
        console.log(`✅ Retrieved ${pixelsRes.data.data.length} pixels`);
        if (pixelsRes.data.data.length > 0) {
          console.log('   Sample:', pixelsRes.data.data[0].name);
        }
      } catch (error) {
        console.log('⚠️  No pixels found or error:', error.response?.data?.error || error.message);
      }
      console.log('');
    }

    // Test 7: Get Business Assets
    if (bmsRes.data.data.length > 0) {
      const firstBM = bmsRes.data.data[0];
      console.log(`Test 7: Retrieving Business Assets for BM ${firstBM.business_id}`);
      try {
        const assetsRes = await axios.get(`${API_BASE_URL}/api/business-assets/${firstBM.business_id}`);
        console.log(`✅ Retrieved ${assetsRes.data.data.length} assets`);
      } catch (error) {
        console.log('⚠️  Error or no assets:', error.response?.data?.error || error.message);
      }
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('✅ Phase 1 Tests Completed Successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('   Error details:', error.response.data.error);
    }
    process.exit(1);
  }
}

// Run tests
testPhase1();
