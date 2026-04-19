const { query } = require('../config/database');

const runMigration = async () => {
  console.log('🔧 Adding sector column to projects table...');

  try {
    // Add sector column to projects table
    await query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS sector VARCHAR(100);
    `);

    console.log('✅ Sector column added to projects table');

    // Create index for sector column
    await query(`
      CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
    `);

    console.log('✅ Index created for sector column');
    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  }
};

const rollbackMigration = async () => {
  console.log('🔄 Rolling back sector column migration...');

  try {
    // Drop index first
    await query('DROP INDEX IF EXISTS idx_projects_sector;');

    // Drop column
    await query('ALTER TABLE projects DROP COLUMN IF EXISTS sector;');

    console.log('✅ Sector column removed from projects table');
    console.log('🎉 Rollback completed successfully!');

  } catch (error) {
    console.error('❌ Error rolling back migration:', error);
    throw error;
  }
};

module.exports = {
  runMigration,
  rollbackMigration
};

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
