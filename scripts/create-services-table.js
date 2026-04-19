const { pool } = require('../config/database');
require('dotenv').config();

async function createServicesTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔗 Connected to PostgreSQL');
    
    // Create services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        icon VARCHAR(100),
        service_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        meta_title VARCHAR(255),
        meta_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Services table created');

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_services_featured ON services(featured)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_services_status ON services(status)');
    console.log('✅ Services indexes created');

    // Create update trigger
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_services_updated_at ON services;
      CREATE TRIGGER update_services_updated_at 
        BEFORE UPDATE ON services 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Services trigger created');

    // Insert some sample services
    const sampleServices = [
      {
        title: 'Infrastructure Services',
        slug: 'infrastructure-services',
        description: 'We understand the importance of infrastructure in achieving sustainable development. We specialize in creating innovative solutions for planning, designing, and constructing infrastructure that minimizes its impact on the environment, maximizes resource efficiency, and promotes energy efficiency.',
        icon: 'Building',
        service_type: 'Infrastructure',
        featured: true,
        sort_order: 1
      },
      {
        title: 'Green Energy & Governance',
        slug: 'green-energy-governance',
        description: 'We believe that energy, particularly renewable energy technology, plays a vital role in driving rural development and reducing poverty. By decentralizing energy systems and creating jobs through micro-enterprises, we can empower local communities and promote sustainable economic growth.',
        icon: 'Zap',
        service_type: 'Energy',
        featured: true,
        sort_order: 2
      },
      {
        title: 'Emerging Frontier Technologies',
        slug: 'emerging-frontier-technologies',
        description: 'At FEED, we utilize cutting-edge technologies like drones, satellite imagery, and artificial intelligence to provide innovative solutions for environmental monitoring, disaster management, and sustainable development.',
        icon: 'Cpu',
        service_type: 'Technology',
        featured: true,
        sort_order: 3
      },
      {
        title: 'Disaster & Ecosystem',
        slug: 'disaster-ecosystem',
        description: 'We understand the importance of ecosystems in supporting human well-being and environmental health. Our disaster management and ecosystem services focus on building resilience and promoting sustainable practices.',
        icon: 'Leaf',
        service_type: 'Environment',
        featured: true,
        sort_order: 4
      },
      {
        title: 'Policy & Institutional Development',
        slug: 'policy-institutional-development',
        description: 'We recognize the crucial role that effective policies and strong institutions play in achieving sustainable development goals. Our services focus on policy research, analysis, and institutional capacity building.',
        icon: 'FileText',
        service_type: 'Policy',
        featured: true,
        sort_order: 5
      },
      {
        title: 'Research, Training & Development',
        slug: 'research-training-development',
        description: 'FEED emphasizes the importance of research and development in driving innovation and creating sustainable solutions. We offer comprehensive training programs and conduct cutting-edge research in various fields.',
        icon: 'BookOpen',
        service_type: 'Research',
        featured: true,
        sort_order: 6
      }
    ];

    for (const service of sampleServices) {
      await client.query(
        `INSERT INTO services (title, slug, description, icon, service_type, featured, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (slug) DO NOTHING`,
        [service.title, service.slug, service.description, service.icon, service.service_type, service.featured, service.sort_order]
      );
    }
    console.log(`✅ Inserted ${sampleServices.length} sample services`);

    console.log('\n🎉 Services table setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Services table setup failed:', error);
    throw error;
  } finally {
    client.release();
    console.log('🔐 Database connection closed');
  }
}

// Handle script execution
if (require.main === module) {
  createServicesTable()
    .then(() => {
      console.log('🎉 Services table created successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Services table creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createServicesTable };
