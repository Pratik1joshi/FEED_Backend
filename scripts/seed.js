const { pool } = require('../config/database');
const { createTables } = require('../migrations/001_initial_schema');
const Admin = require('../models/Admin');
const Timeline = require('../models/Timeline');
require('dotenv').config();

// Sample timeline data
const sampleTimelineData = [
  {
    year: "2015",
    title: "Foundation",
    description: "FEED was established with a vision to bridge the gap between energy development and environmental conservation.",
    icon: "Flag",
    category: "Milestone",
    featured: true,
    sort_order: 1
  },
  {
    year: "2017",
    title: "First Major Research Grant",
    description: "Secured $5M in funding for renewable energy integration research across developing regions.",
    icon: "Award",
    category: "Funding",
    featured: true,
    sort_order: 2
  },
  {
    year: "2019",
    title: "Global Partnership Launch",
    description: "Formed strategic alliances with 15 international organizations to expand our impact worldwide.",
    icon: "Heart",
    category: "Partnership",
    featured: true,
    sort_order: 3
  },
  {
    year: "2021",
    title: "Policy Impact Achievement",
    description: "Our research directly influenced renewable energy policies in 12 countries.",
    icon: "FileText",
    category: "Policy",
    featured: true,
    sort_order: 4
  },
  {
    year: "2023",
    title: "Innovation Center Opening",
    description: "Launched state-of-the-art research facility focused on sustainable technology development.",
    icon: "Building",
    category: "Infrastructure",
    featured: true,
    sort_order: 5
  },
  {
    year: "2025",
    title: "Global Impact Milestone",
    description: "Successfully implemented 100+ sustainable energy projects across 30 countries.",
    icon: "Globe",
    category: "Achievement",
    featured: true,
    sort_order: 6
  }
];

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔗 Connected to PostgreSQL');
    
    // Create database schema
    await createTables();

    // Clear existing data
    await client.query('DELETE FROM timeline');
    await client.query('DELETE FROM admins');
    await client.query('ALTER SEQUENCE timeline_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE admins_id_seq RESTART WITH 1');
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminData = {
      name: 'FEED Admin',
      email: process.env.ADMIN_EMAIL || 'admin@feed.org.np',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'super_admin',
      is_active: true
    };

    const admin = await Admin.create(adminData);
    console.log('👤 Admin user created:', admin.email);

    // Create timeline items
    const timelinePromises = sampleTimelineData.map(item => Timeline.create(item));
    const timelineItems = await Promise.all(timelinePromises);
    console.log(`📅 Created ${timelineItems.length} timeline items`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Admin Login Credentials:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('\n🚨 Remember to change the admin password in production!');
    console.log('\n🌐 Test your API:');
    console.log('Health Check: GET /health');
    console.log('Timeline: GET /api/timeline/featured');
    console.log('Admin Login: POST /api/auth/login');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('🔐 Database connection closed');
  }
}

// Handle script execution
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
