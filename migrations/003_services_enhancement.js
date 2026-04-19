// Migration to add additional fields to services table for detailed service pages
const { pool } = require('../config/database');

const runMigration = async () => {
  try {
    console.log('Starting services table enhancement migration...');

    // Add new columns to services table
    await pool.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS long_description TEXT,
      ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS case_studies JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS image VARCHAR(500)
    `);

    console.log('Services table enhanced successfully with new fields:');
    console.log('- long_description: TEXT');
    console.log('- features: JSONB array');
    console.log('- case_studies: JSONB array');
    console.log('- image: VARCHAR(500)');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_services_long_description ON services USING gin(to_tsvector('english', long_description));
      CREATE INDEX IF NOT EXISTS idx_services_features ON services USING gin(features);
      CREATE INDEX IF NOT EXISTS idx_services_case_studies ON services USING gin(case_studies);
    `);

    console.log('Indexes created for new fields');
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

module.exports = { runMigration };
