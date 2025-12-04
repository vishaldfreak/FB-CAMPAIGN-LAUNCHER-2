# Database Setup Instructions

## ✅ Database Schema Created

The database schema has been successfully created using Supabase MCP tools. All tables are now available in your Supabase project.

### Created Tables:

The following tables have been created in the `public` schema:

1. **pages** - Stores Facebook Pages
   - Columns: id, page_id, name, access_token, category, business_id, created_at, updated_at
   - Index: idx_pages_business_id

2. **ad_accounts** - Stores Ad Accounts
   - Columns: id, account_id, name, account_status, currency, timezone_id, business_id, created_at, updated_at
   - Index: idx_ad_accounts_business_id

3. **business_managers** - Stores Business Manager accounts
   - Columns: id, business_id, name, created_at, updated_at

4. **pixels** - Stores Facebook Pixels
   - Columns: id, pixel_id, name, ad_account_id, owner_business_id, permission_level, created_at, updated_at
   - Indexes: idx_pixels_ad_account_id, idx_pixels_owner_business_id

5. **business_assets** - Normalized relationships between businesses and assets
   - Columns: id, business_id, asset_type, asset_id, permission_type, permission_level, created_at
   - Unique constraint: (business_id, asset_type, asset_id)
   - Indexes: idx_business_assets_business_id, idx_business_assets_asset_type

6. **sync_history** - Tracks sync operations
   - Columns: id, sync_type, last_synced_at, items_count, status
   - Index: idx_sync_history_last_synced_at

7. **tokens** - For future token storage
   - Columns: id, token_type, token_value, expires_at, business_id, created_at

### Verification:

✅ All tables have been created and verified
✅ Phase 1 tests passed successfully
✅ Asset sync is working correctly

### Migration Details:

- Migration name: `create_initial_schema`
- Applied to project: `evwujdrxgnzfpxtxoifr`
- Status: ✅ Success

### Tables Created:

- **pages**: Stores Facebook Pages
- **ad_accounts**: Stores Ad Accounts with timezone info
- **business_managers**: Stores Business Manager accounts
- **pixels**: Stores Facebook Pixels
- **business_assets**: Normalized relationships between businesses and assets
- **sync_history**: Tracks sync operations
- **tokens**: For future token storage

### Indexes:

The schema also creates indexes for better query performance on:
- `pages.business_id`
- `ad_accounts.business_id`
- `pixels.ad_account_id` and `pixels.owner_business_id`
- `business_assets.business_id` and `business_assets.asset_type`
- `sync_history.last_synced_at`
