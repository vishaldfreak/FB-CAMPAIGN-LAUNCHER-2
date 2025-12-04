-- Migration: Add user_name and user_token columns to asset tables
-- Run this migration to add user tracking to existing tables

-- Add columns to pages table
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_token TEXT;

-- Add columns to ad_accounts table
ALTER TABLE ad_accounts 
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_token TEXT;

-- Add columns to business_managers table
ALTER TABLE business_managers 
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_token TEXT;

-- Add columns to pixels table
ALTER TABLE pixels 
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_token TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pages_user_name ON pages(user_name);
CREATE INDEX IF NOT EXISTS idx_ad_accounts_user_name ON ad_accounts(user_name);
CREATE INDEX IF NOT EXISTS idx_business_managers_user_name ON business_managers(user_name);
CREATE INDEX IF NOT EXISTS idx_pixels_user_name ON pixels(user_name);
