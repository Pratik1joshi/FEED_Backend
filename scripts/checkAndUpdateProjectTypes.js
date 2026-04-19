const { pool } = require('../config/database');

async function checkAndUpdateProjectTypes() {
  try {
    console.log('🔍 Checking current projects and their types...');
    
    // First, let's see what projects we have
    const result = await pool.query('SELECT id, title, slug, type, category FROM projects ORDER BY created_at DESC');
    const projects = result.rows;
    
    console.log(`Found ${projects.length} projects in database:`);
    console.log('');
    
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title}`);
      console.log(`   - ID: ${project.id}`);
      console.log(`   - Slug: ${project.slug}`);
      console.log(`   - Type: ${project.type || 'NULL'}`);
      console.log(`   - Category: ${project.category}`);
      console.log('');
    });

    // Check how many have 'map' type vs others
    const mapProjects = projects.filter(p => p.type === 'map');
    const detailedProjects = projects.filter(p => p.type !== 'map' && p.type !== null);
    const nullTypeProjects = projects.filter(p => p.type === null || p.type === undefined);
    
    console.log(`📊 Project Type Summary:`);
    console.log(`- Map projects: ${mapProjects.length}`);
    console.log(`- Detailed projects: ${detailedProjects.length}`);
    console.log(`- Projects with NULL/undefined type: ${nullTypeProjects.length}`);
    console.log('');

    // Update projects with NULL type to be 'detailed' projects
    if (nullTypeProjects.length > 0) {
      console.log('🔧 Updating projects with NULL type to "detailed"...');
      
      const updateQuery = `
        UPDATE projects 
        SET type = 'detailed', updated_at = CURRENT_TIMESTAMP 
        WHERE type IS NULL OR type = ''
      `;
      
      const updateResult = await pool.query(updateQuery);
      console.log(`✅ Updated ${updateResult.rowCount} projects to type 'detailed'`);
      
      // Verify the update
      const verifyResult = await pool.query('SELECT type, COUNT(*) as count FROM projects GROUP BY type');
      console.log('');
      console.log('📊 Updated Type Summary:');
      verifyResult.rows.forEach(row => {
        console.log(`- ${row.type || 'NULL'}: ${row.count} projects`);
      });
    }

    console.log('');
    console.log('🎉 Project type check and update completed!');

  } catch (error) {
    console.error('❌ Error checking/updating project types:', error);
    process.exit(1);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  checkAndUpdateProjectTypes()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkAndUpdateProjectTypes };
