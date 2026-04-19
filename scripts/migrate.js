const { createTables, dropTables } = require('../migrations/008_unified_latest_schema');
const { pool } = require('../config/database');
require('dotenv').config();

async function runMigration(command) {
  try {
    console.log(`🔧 Running migration: ${command}`);
    
    if (command === 'up') {
      await createTables();
      console.log('✅ Migration completed successfully!');
    } else if (command === 'down') {
      await dropTables();
      console.log('✅ Migration rollback completed!');
    } else {
      console.log('❌ Invalid command. Use "up" or "down"');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔐 Database connection closed');
  }
}

// Get command from arguments
const command = process.argv[2];
if (!command) {
  console.log('Usage: node scripts/migrate.js [up|down]');
  process.exit(1);
}

runMigration(command);
