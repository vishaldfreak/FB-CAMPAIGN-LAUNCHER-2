/**
 * Phase 0.5: Token Testing Script
 * Tests the provided access token with Meta API endpoints
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FB_API_VERSION = process.env.FB_API_VERSION || 'v24.0';
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

// Token info from OAuth callback
const TOKEN_INFO = {
  token: FB_ACCESS_TOKEN,
  expires_in: 4710, // seconds (~78 minutes)
  data_access_expiration_time: 1772581290, // Unix timestamp
  client_id: '576881582383647'
};

console.log('='.repeat(60));
console.log('Phase 0.5: Token Testing & Selection');
console.log('='.repeat(60));
console.log(`Token: ${TOKEN_INFO.token.substring(0, 20)}...`);
console.log(`Expires in: ${TOKEN_INFO.expires_in} seconds (~${Math.round(TOKEN_INFO.expires_in / 60)} minutes)`);
console.log(`Client ID: ${TOKEN_INFO.client_id}`);
console.log('');

// Test endpoints
const tests = [
  {
    name: 'User Info',
    endpoint: '/me',
    fields: 'id,name,email'
  },
  {
    name: 'Pages Access',
    endpoint: '/me/accounts',
    fields: 'id,name,access_token'
  },
  {
    name: 'Ad Accounts Access',
    endpoint: '/me/adaccounts',
    fields: 'id,name,account_status'
  },
  {
    name: 'Business Managers Access',
    endpoint: '/me/businesses',
    fields: 'id,name'
  }
];

async function testEndpoint(test) {
  try {
    console.log(`Testing: ${test.name}...`);
    const url = `${BASE_URL}${test.endpoint}`;
    const params = {
      access_token: TOKEN_INFO.token,
      fields: test.fields
    };

    const response = await axios.get(url, { params });
    
    console.log(`✅ ${test.name}: SUCCESS`);
    if (response.data.data) {
      console.log(`   Found ${response.data.data.length} items`);
      if (response.data.data.length > 0) {
        console.log(`   Sample: ${JSON.stringify(response.data.data[0], null, 2).substring(0, 200)}...`);
      }
    } else if (response.data.id) {
      console.log(`   Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
    }
    
    // Check for pagination
    if (response.data.paging && response.data.paging.next) {
      console.log(`   ⚠️  Pagination detected - need to handle in implementation`);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ ${test.name}: FAILED`);
    if (error.response) {
      console.log(`   Error: ${error.response.data.error?.message || 'Unknown error'}`);
      console.log(`   Code: ${error.response.data.error?.code}`);
      console.log(`   Type: ${error.response.data.error?.type}`);
      if (error.response.data.error?.error_subcode) {
        console.log(`   Subcode: ${error.response.data.error.error_subcode}`);
      }
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return { success: false, error: error.response?.data || error.message };
  }
}

async function checkTokenPermissions() {
  try {
    console.log('\nChecking token permissions/scopes...');
    const url = `${BASE_URL}/me/permissions`;
    const response = await axios.get(url, {
      params: { access_token: TOKEN_INFO.token }
    });

    const permissions = response.data.data || [];
    const requiredScopes = ['ads_management', 'business_management', 'pages_read_engagement'];
    
    console.log('Token has the following permissions:');
    permissions.forEach(perm => {
      const status = perm.status === 'granted' ? '✅' : '❌';
      console.log(`   ${status} ${perm.permission}: ${perm.status}`);
    });

    console.log('\nRequired scopes check:');
    requiredScopes.forEach(scope => {
      const hasPermission = permissions.some(p => p.permission === scope && p.status === 'granted');
      console.log(`   ${hasPermission ? '✅' : '❌'} ${scope}: ${hasPermission ? 'GRANTED' : 'MISSING'}`);
    });

    return permissions;
  } catch (error) {
    console.log('❌ Failed to check permissions');
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    return [];
  }
}

async function checkTokenInfo() {
  try {
    console.log('\nChecking token details...');
    const url = `${BASE_URL}/debug_token`;
    const response = await axios.get(url, {
      params: {
        input_token: TOKEN_INFO.token,
        access_token: TOKEN_INFO.token
      }
    });

    const data = response.data.data;
    console.log('Token Debug Info:');
    console.log(`   App ID: ${data.app_id}`);
    console.log(`   User ID: ${data.user_id}`);
    console.log(`   Type: ${data.type}`);
    console.log(`   Valid: ${data.is_valid ? '✅ YES' : '❌ NO'}`);
    console.log(`   Expires at: ${data.expires_at ? new Date(data.expires_at * 1000).toISOString() : 'Never'}`);
    console.log(`   Data access expires at: ${data.data_access_expires_at ? new Date(data.data_access_expires_at * 1000).toISOString() : 'Never'}`);
    
    if (data.scopes) {
      console.log(`   Scopes: ${data.scopes.join(', ')}`);
    }

    return data;
  } catch (error) {
    console.log('❌ Failed to debug token');
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('Starting token tests...\n');

  // Test token info first
  const tokenInfo = await checkTokenInfo();
  await checkTokenPermissions();

  console.log('\n' + '='.repeat(60));
  console.log('Testing API Endpoints');
  console.log('='.repeat(60) + '\n');

  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test);
    results.push({ ...test, ...result });
    console.log(''); // Empty line between tests
  }

  // Summary
  console.log('='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  console.log(`✅ Passed: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`Total: ${results.length}`);

  if (successCount === results.length) {
    console.log('\n🎉 All tests passed! Token is ready to use.');
    console.log('\nRecommendation: Use this token for Phase 1 implementation.');
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.');
    console.log('Token may need additional permissions or may be expired.');
  }

  // Token expiration info
  if (TOKEN_INFO.expires_in) {
    const expiresInMinutes = Math.round(TOKEN_INFO.expires_in / 60);
    const expiresAt = new Date(Date.now() + TOKEN_INFO.expires_in * 1000);
    console.log(`\nToken expires in: ${expiresInMinutes} minutes (at ${expiresAt.toISOString()})`);
    console.log('⚠️  Remember to update token manually when it expires.');
  }

  return results;
}

// Run tests
runTests().catch(console.error);
