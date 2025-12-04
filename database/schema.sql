-- Supabase Database Schema
-- Phase 1: Tables for storing Facebook assets

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  page_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  access_token TEXT,
  category VARCHAR(255),
  business_id VARCHAR(255),
  user_name VARCHAR(255),
  user_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Accounts table
CREATE TABLE IF NOT EXISTS ad_accounts (
  id BIGSERIAL PRIMARY KEY,
  account_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  account_status INTEGER,
  currency VARCHAR(10),
  timezone_id INTEGER,
  business_id VARCHAR(255),
  user_name VARCHAR(255),
  user_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Managers table
CREATE TABLE IF NOT EXISTS business_managers (
  id BIGSERIAL PRIMARY KEY,
  business_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  user_name VARCHAR(255),
  user_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pixels table
CREATE TABLE IF NOT EXISTS pixels (
  id BIGSERIAL PRIMARY KEY,
  pixel_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  ad_account_id VARCHAR(255),
  owner_business_id VARCHAR(255),
  permission_level VARCHAR(50),
  user_name VARCHAR(255),
  user_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Assets table (normalized relationships)
CREATE TABLE IF NOT EXISTS business_assets (
  id BIGSERIAL PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL, -- 'page', 'ad_account', 'pixel'
  asset_id VARCHAR(255) NOT NULL,
  permission_type VARCHAR(50), -- 'owned', 'shared', 'inherited'
  permission_level VARCHAR(50), -- 'admin', 'analyst', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, asset_type, asset_id)
);

-- Sync History table
CREATE TABLE IF NOT EXISTS sync_history (
  id BIGSERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', etc.
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  items_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'success' -- 'success', 'failed', 'partial'
);

-- User Tokens table (for multiple users)
CREATE TABLE IF NOT EXISTS user_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  user_name VARCHAR(255),
  user_picture_url TEXT,
  access_token TEXT NOT NULL,
  expires_in INTEGER, -- seconds
  data_access_expiration_time BIGINT, -- Unix timestamp
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pages_business_id ON pages(business_id);
CREATE INDEX IF NOT EXISTS idx_ad_accounts_business_id ON ad_accounts(business_id);
CREATE INDEX IF NOT EXISTS idx_pixels_ad_account_id ON pixels(ad_account_id);
CREATE INDEX IF NOT EXISTS idx_pixels_owner_business_id ON pixels(owner_business_id);
CREATE INDEX IF NOT EXISTS idx_business_assets_business_id ON business_assets(business_id);
CREATE INDEX IF NOT EXISTS idx_business_assets_asset_type ON business_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_sync_history_last_synced_at ON sync_history(last_synced_at);
