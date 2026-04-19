const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'pass123',
  port: 5432,
});

const services = [
  {
    slug: 'infrastructure-services',
    title: 'Infrastructure Services',
    description: 'We understand the importance of infrastructure in achieving sustainable development. We specialize in creating innovative solutions for planning, designing, and constructing infrastructure that minimizes its impact on the environment, maximizes resource efficiency, and promotes energy efficiency.',
    shortDescription: 'Sustainable infrastructure solutions for development.',
    icon: 'Building',
    serviceType: 'Engineering',
    status: 'active',
    featured: true,
    sortOrder: 1
  },
  {
    slug: 'green-energy-governance',
    title: 'Green Energy & Governance',
    description: 'We believe that energy, particularly renewable energy technology, plays a vital role in driving rural development and reducing poverty. By decentralizing energy systems and creating jobs through micro-enterprises, we can empower local communities and promote sustainable economic growth.',
    shortDescription: 'Renewable energy solutions for rural development.',
    icon: 'Zap',
    serviceType: 'Energy',
    status: 'active',
    featured: true,
    sortOrder: 2
  },
  {
    slug: 'emerging-frontier-technologies',
    title: 'Emerging Frontier Technologies',
    description: 'At FEED, we utilize cutting-edge technologies like drones to gain a bird\'s eye view of complex problems and generate high-resolution images, digital terrain models, and surveillance data. Our team of experts work together to plan, design, develop, and implement effective solutions.',
    shortDescription: 'Cutting-edge technology solutions using drones and AI.',
    icon: 'Cpu',
    serviceType: 'Technology',
    status: 'active',
    featured: true,
    sortOrder: 3
  },
  {
    slug: 'disaster-ecosystem',
    title: 'Disaster & Ecosystem',
    description: 'We understand the importance of ecosystems in supporting human well-being. Our research and interventions focus on identifying and implementing nature-based solutions that incorporate technical analysis and multi-disciplinary approaches for Disaster Risk Reduction and Climate Change Adaptation.',
    shortDescription: 'Nature-based disaster risk reduction solutions.',
    icon: 'Leaf',
    serviceType: 'Environmental',
    status: 'active',
    featured: true,
    sortOrder: 4
  },
  {
    slug: 'policy-institutional-development',
    title: 'Policy & Institutional Development',
    description: 'We work on policy development and institutional strengthening to support sustainable development initiatives. Our expertise includes policy analysis, institutional capacity building, and governance frameworks that promote effective implementation of development programs.',
    shortDescription: 'Policy development and institutional strengthening services.',
    icon: 'Users',
    serviceType: 'Governance',
    status: 'active',
    featured: false,
    sortOrder: 5
  },
  {
    slug: 'research-development',
    title: 'Research & Development',
    description: 'Our R&D services focus on innovative solutions for sustainable development challenges. We conduct applied research, feasibility studies, and technology assessments to support evidence-based decision making and implementation of effective development interventions.',
    shortDescription: 'Applied research for sustainable development solutions.',
    icon: 'Search',
    serviceType: 'Research',
    status: 'active',
    featured: false,
    sortOrder: 6
  }
];

async function seedServices() {
  try {
    console.log('Starting services seeding...');
    
    // Clear existing services
    await pool.query('DELETE FROM services');
    console.log('Cleared existing services');

    // Insert services
    for (const service of services) {
      const query = `
        INSERT INTO services (
          title, slug, description, short_description, icon, service_type,
          status, featured, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      
      const values = [
        service.title, service.slug, service.description, service.shortDescription,
        service.icon, service.serviceType, service.status, service.featured,
        service.sortOrder
      ];
      
      await pool.query(query, values);
      console.log(`✓ Inserted: ${service.title}`);
    }
    
    console.log(`\n✅ Successfully seeded ${services.length} services!`);
  } catch (error) {
    console.error('Error seeding services:', error);
  } finally {
    await pool.end();
  }
}

seedServices();
