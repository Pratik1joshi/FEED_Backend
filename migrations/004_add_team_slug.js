const { pool } = require('../config/database');

const addTeamSlugColumn = async () => {
  try {
    console.log('Adding slug column to team_members table...');
    
    // Add slug column
    await pool.query(`
      ALTER TABLE team_members 
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
    `);
    
    // Create index for slug
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_team_slug ON team_members(slug);
    `);
    
    // Generate slugs for existing team members
    await pool.query(`
      UPDATE team_members 
      SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', ''))
      WHERE slug IS NULL;
    `);
    
    console.log('Successfully added slug column to team_members table');
  } catch (error) {
    console.error('Error adding slug column:', error);
    throw error;
  }
};

if (require.main === module) {
  addTeamSlugColumn()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addTeamSlugColumn };
