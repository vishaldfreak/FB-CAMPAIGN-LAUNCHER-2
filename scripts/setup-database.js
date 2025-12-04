/**
 * Database Setup Script
 * Creates tables in Supabase
 */

import supabase from '../services/supabase.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  console.log('Setting up database tables...\n');

  try {
    // Read SQL schema
    const schemaPath = join(__dirname, '../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 10) continue; // Skip very short statements

      try {
        // Note: Supabase doesn't support executing raw SQL directly from client
        // This would need to be run via Supabase SQL editor or migrations
        console.log(`[${i + 1}/${statements.length}] ${statement.substring(0, 60)}...`);
        
        // For now, just log - actual execution needs to be done in Supabase dashboard
        // or via Supabase migrations
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message);
      }
    }

    console.log('\n✅ Database setup script completed.');
    console.log('⚠️  Note: Please run the SQL schema in Supabase SQL Editor:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of database/schema.sql');
    console.log('   3. Execute the SQL');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
