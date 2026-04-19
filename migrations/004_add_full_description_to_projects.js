const { pool } = require('../config/database');

const runMigration = async () => {
  try {
    console.log('🔄 Adding full_description field to projects table...');
    
    // Add full_description field to projects table
    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS full_description TEXT;
    `);
    
    console.log('✅ full_description field added to projects table successfully');
    
    // Update existing projects to move description to full_description
    // and set description to excerpt (if available)
    await pool.query(`
      UPDATE projects 
      SET full_description = description,
          description = COALESCE(excerpt, substring(description, 1, 200) || '...')
      WHERE full_description IS NULL;
    `);
    
    console.log('✅ Existing project data migrated successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🎉 Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
