-- Migration: Create user_tokens table for multiple users
-- Run this migration to enable multi-user support

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_is_active ON user_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_user_tokens_created_at ON user_tokens(created_at);
