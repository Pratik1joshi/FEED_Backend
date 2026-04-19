const { pool } = require('../config/database');
const Projects = require('../models/Projects');
const { projects } = require('../../frontend/src/data/projects');
const { detailedProjects } = require('../../frontend/src/data/detailedProjects');
require('dotenv').config();

// Function to transform coordinates from array to PostgreSQL POINT
const transformCoordinates = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return null;
  }
  return `(${coordinates[1]}, ${coordinates[0]})`; // PostgreSQL POINT format: (longitude, latitude)
};

// Helper function to parse various date formats
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Handle various date formats
  const cleaned = dateString.toLowerCase().replace(/^expected\s+/, '');
  
  const monthMap = {
    january: '01', february: '02', march: '03', april: '04',
    may: '05', june: '06', july: '07', august: '08',
    september: '09', october: '10', november: '11', december: '12',
    jan: '01', feb: '02', mar: '03', apr: '04',
    jun: '06', jul: '07', aug: '08', sep: '09',
    oct: '10', nov: '11', dec: '12'
  };
  
  // Handle "Month YYYY" format
  const monthYear = cleaned.match(/^(\w+)\s+(\d{4})$/);
  if (monthYear) {
    const month = monthMap[monthYear[1]];
    if (month) {
      return `${monthYear[2]}-${month}-01`;
    }
  }
  
  // Handle just year
  if (/^\d{4}$/.test(cleaned)) {
    return `${cleaned}-01-01`;
  }
  
  // Try parsing as standard date
  const date = new Date(cleaned);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  // Default to current date if can't parse
  return new Date().toISOString().split('T')[0];
};

// Transform project data for database insertion
const transformProjectData = (project, isDetailed = false) => {
  return {
    title: project.title,
    slug: project.slug,
    description: project.description || project.fullDescription || '',
    excerpt: project.excerpt || project.description?.substring(0, 200) + '...' || '',
    category: project.category,
    type: isDetailed ? 'detailed' : 'map',
    location: project.location,
    province: project.province,
    district: project.district,
    coordinates: transformCoordinates(project.coordinates),
    status: project.status,
    duration: project.duration,
    completion_date: parseDate(project.completionDate || project.completion_date),
    start_date: parseDate(project.startDate || project.start_date),
    client: project.client || project.clientPartners,
    budget: project.budget,
    team_size: project.teamSize || project.team_size,
    capacity: project.capacity,
    energy_generation: project.energyGeneration || project.energy_generation,
    images: Array.isArray(project.images) ? project.images : [],
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    objectives: Array.isArray(project.objectives) ? project.objectives : Array.isArray(project.goals) ? project.goals : [],
    outcomes: Array.isArray(project.outcomes) ? project.outcomes : [],
    challenges: Array.isArray(project.challenges) ? project.challenges : [],
    impact: typeof project.impact === 'object' && project.impact !== null ? project.impact : {},
    featured: project.featured || false,
    tags: Array.isArray(project.tags) ? project.tags : []
  };
};

async function seedProjects() {
  const client = await pool.connect();
  
  try {
    console.log('🔗 Connected to PostgreSQL');
    console.log('🌱 Starting projects database seeding...');

    // Clear existing projects data
    await client.query('DELETE FROM projects');
    await client.query('ALTER SEQUENCE projects_id_seq RESTART WITH 1');
    console.log('🧹 Cleared existing projects data');

    let totalInserted = 0;

    // 1. Insert detailed projects
    console.log('\n📝 Inserting detailed projects...');
    for (const project of detailedProjects) {
      try {
        const transformedData = transformProjectData(project, true);
        const insertedProject = await Projects.create(transformedData);
        console.log(`✅ Inserted detailed project: ${insertedProject.title}`);
        totalInserted++;
      } catch (error) {
        console.error(`❌ Failed to insert detailed project "${project.title}":`, error.message);
      }
    }

    // 2. Insert map projects (regular projects from projects.js)
    console.log('\n🗺️  Inserting map projects...');
    for (const project of projects.slice(0, 50)) { // Limit to first 50 for demo
      try {
        const transformedData = transformProjectData(project, false);
        const insertedProject = await Projects.create(transformedData);
        console.log(`✅ Inserted map project: ${insertedProject.title}`);
        totalInserted++;
      } catch (error) {
        console.error(`❌ Failed to insert map project "${project.title}":`, error.message);
      }
    }

    // Get some statistics
    const stats = await Projects.getStats();
    
    console.log('\n📊 Projects Seeding Summary:');
    console.log(`✅ Total projects inserted: ${totalInserted}`);
    console.log(`📈 Database statistics:`);
    console.log(`   - Total projects: ${stats.total_projects}`);
    console.log(`   - Completed projects: ${stats.completed_projects}`);
    console.log(`   - Ongoing projects: ${stats.ongoing_projects}`);
    console.log(`   - Featured projects: ${stats.featured_projects}`);
    console.log(`   - Provinces covered: ${stats.provinces_covered}`);
    console.log(`   - Categories: ${stats.categories}`);

    console.log('\n✅ Projects database seeding completed successfully!');
    console.log('\n🌐 Test your Projects API:');
    console.log('All Projects: GET /api/projects');
    console.log('Featured Projects: GET /api/projects/featured');
    console.log('Project Stats: GET /api/projects/stats');
    console.log('Search Projects: GET /api/projects/search?q=hydropower');
    console.log('By Category: GET /api/projects/category/Renewable Energy');
    
  } catch (error) {
    console.error('❌ Projects database seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('🔐 Database connection closed');
  }
}

// Handle script execution
if (require.main === module) {
  seedProjects()
    .then(() => {
      console.log('🎉 Projects seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Projects seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProjects };
