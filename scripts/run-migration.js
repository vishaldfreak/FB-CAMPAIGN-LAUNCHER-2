/**
 * Run Database Migration
 * Adds user_name and user_token columns to asset tables
 */

import supabase from '../services/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running migration: Add user_name and user_token columns...\n');

    // Read migration SQL file
    const migrationPath = path.join(__dirname, '../database/migrations/add_user_info_to_assets.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`  [${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
          
          // Use RPC or direct query - Supabase JS client doesn't support raw SQL directly
          // So we'll use the REST API or execute via SQL editor
          // For now, let's use the REST API with rpc or execute SQL
          
          // Actually, we need to use the PostgREST API or execute via SQL editor
          // Let's try using the REST API directly
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // If RPC doesn't exist, try direct execution via REST API
            // Supabase doesn't expose raw SQL execution via JS client for security
            // We'll need to execute this manually or use a different approach
            
            console.warn(`  ⚠️  Could not execute via RPC, trying alternative method...`);
            
            // Alternative: Use the REST API directly
            const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({ sql: statement })
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
          } else {
            console.log(`  ✅ Success`);
          }
        } catch (error) {
          // If exec_sql RPC doesn't exist, we'll need to execute manually
          console.error(`  ❌ Error: ${error.message}`);
          console.log(`\n⚠️  Automatic migration failed. Please run the SQL manually in Supabase SQL Editor:\n`);
          console.log(statement);
          console.log(';\n');
        }
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('\n📋 If automatic execution failed, please run the SQL manually:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of: database/migrations/add_user_info_to_assets.sql');
    console.log('   4. Execute the SQL\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Please run the migration manually in Supabase SQL Editor:');
    console.log('   File: database/migrations/add_user_info_to_assets.sql\n');
    process.exit(1);
  }
}

// Run migration
runMigration();
