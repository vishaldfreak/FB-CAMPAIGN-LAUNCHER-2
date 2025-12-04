/**
 * Simple Migration Runner
 * Executes SQL statements directly using Supabase REST API
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration in .env file');
    process.exit(1);
  }

  try {
    console.log('🔄 Running migration: Add user_name and user_token columns...\n');

    // Read migration SQL file
    const migrationPath = path.join(__dirname, '../database/migrations/add_user_info_to_assets.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute SQL using Supabase REST API (PostgREST doesn't support raw SQL)
    // We'll use the management API or provide instructions
    
    console.log('📋 Supabase JS client cannot execute raw SQL for security reasons.');
    console.log('📋 Please run this migration manually in Supabase SQL Editor:\n');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log('\n📝 Steps:');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Navigate to: SQL Editor');
    console.log('   4. Click: New Query');
    console.log('   5. Copy and paste the SQL above');
    console.log('   6. Click: Run\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
