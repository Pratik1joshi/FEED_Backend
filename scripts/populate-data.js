const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mydb',
  password: process.env.DB_PASSWORD || 'pass123',
  port: process.env.DB_PORT || 5432,
});

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Services data population
const populateServices = async () => {
  console.log('🔄 Populating Services...');
  
  const services = [
    {
      title: 'Infrastructure Services',
      description: `We understand the importance of infrastructure in achieving sustainable development. We specialize in creating innovative solutions for planning, designing, and constructing infrastructure that minimizes its impact on the environment, maximizes resource efficiency, and promotes energy efficiency. At Feed, our approach ensures that the infrastructure we create supports the achievement of the Sustainable Development Goals (SDGs), including access to healthcare, education, energy, clean water, and sanitation, while also considering the long-term sustainability of our planet.`,
      icon: 'infrastructure',
      service_type: 'Infrastructure',
      sort_order: 1,
      featured: true,
      status: 'active'
    },
    {
      title: 'Green Energy & Governance',
      description: `We believe that energy, particularly renewable energy technology, plays a vital role in driving rural development and reducing poverty. By decentralizing energy systems and creating jobs through micro-enterprises, we can empower local communities and promote sustainable economic growth. Additionally, Feed focuses on green energy and supports the preservation of functional ecosystems, ensuring long-term environmental health and well-being.`,
      icon: 'energy',
      service_type: 'Energy',
      sort_order: 2,
      featured: true,
      status: 'active'
    },
    {
      title: 'Emerging Frontier Technologies',
      description: `At FEED, we utilize cutting-edge technologies like drones to gain a bird's eye view of complex problems and generate high-resolution images, digital terrain models, and surveillance data. Our team of experts, including innovators, designers, professionals, surveyors, and mappers, work together to plan, design, develop, and implement effective solutions.`,
      icon: 'technology',
      service_type: 'Technology',
      sort_order: 3,
      featured: true,
      status: 'active'
    },
    {
      title: 'Disaster & Ecosystem',
      description: `We understand the importance of ecosystems in supporting human well-being. However, human activities have negatively impacted biodiversity and ecosystem function, leading to increased natural hazards and human-induced disasters. To address these challenges, Feed prioritizes Disaster Risk Reduction and Climate Change Adaptation initiatives.`,
      icon: 'ecosystem',
      service_type: 'Environment',
      sort_order: 4,
      featured: true,
      status: 'active'
    },
    {
      title: 'Policy & Institutional Development',
      description: `We recognize the crucial role that ecosystems play in ensuring human well-being. Our research focuses on finding and implementing solutions that combine cutting-edge technology with a multidisciplinary approach, all while working closely with nature to tackle challenges related to disasters and climate change.`,
      icon: 'policy',
      service_type: 'Policy',
      sort_order: 5,
      featured: true,
      status: 'active'
    },
    {
      title: 'Research, Training & Development',
      description: `FEED emphasizes the importance of research and development in scientific decision-making. We offer training sessions on various topics such as GIS mapping, UAV surveying, Google Earth Engine, crowdsourcing, and geospatial data analysis. Additionally, we provide customized training programs for students, researchers, and government officials.`,
      icon: 'research',
      service_type: 'Research',
      sort_order: 6,
      featured: true,
      status: 'active'
    }
  ];

  let count = 0;
  for (const service of services) {
    const slug = generateSlug(service.title);
    
    try {
      await pool.query(
        `INSERT INTO services (title, slug, description, icon, service_type, status, featured, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug) DO UPDATE SET
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         service_type = EXCLUDED.service_type,
         featured = EXCLUDED.featured,
         sort_order = EXCLUDED.sort_order,
         updated_at = CURRENT_TIMESTAMP`,
        [service.title, slug, service.description, service.icon, service.service_type, service.status, service.featured, service.sort_order]
      );
      count++;
    } catch (error) {
      console.error(`Error inserting service "${service.title}":`, error.message);
    }
  }
  
  console.log(`✅ Services populated: ${count} items`);
};

// Team data population
const populateTeam = async () => {
  console.log('🔄 Populating Team...');
  
  const teamMembers = [
    {
      name: 'Dr. Khadga Bahadur Basnet',
      position: 'Chairman & Principal Researcher',
      department: 'Leadership',
      bio: 'Dr. Basnet is a distinguished researcher and leader in sustainable development with over 20 years of experience in renewable energy, rural development, and policy formulation.',
      expertise: ['Renewable Energy', 'Rural Development', 'Policy Development', 'Research Management'],
      education: [
        { degree: 'PhD in Environmental Science', institution: 'Tribhuvan University', year: '2010' },
        { degree: 'MSc in Renewable Energy', institution: 'Kathmandu University', year: '2005' }
      ],
      years_experience: 22,
      publications: 45,
      languages: ['English', 'Nepali', 'Hindi'],
      is_active: true,
      sort_order: 1
    },
    {
      name: 'Eng. Prakash Sharma',
      position: 'Chief Technical Officer',
      department: 'Engineering',
      bio: 'Eng. Sharma leads our technical initiatives with expertise in infrastructure development, green energy systems, and emerging technologies.',
      expertise: ['Infrastructure Development', 'Green Energy Systems', 'Project Management', 'Technical Innovation'],
      education: [
        { degree: 'MEng in Civil Engineering', institution: 'IOE, Tribhuvan University', year: '2012' },
        { degree: 'BE in Civil Engineering', institution: 'IOE, Tribhuvan University', year: '2008' }
      ],
      years_experience: 16,
      publications: 23,
      languages: ['English', 'Nepali'],
      is_active: true,
      sort_order: 2
    },
    {
      name: 'Dr. Sunita Regmi',
      position: 'Research Director',
      department: 'Research',
      bio: 'Dr. Regmi oversees our research initiatives, focusing on disaster risk reduction, climate change adaptation, and ecosystem management.',
      expertise: ['Climate Change', 'Disaster Risk Reduction', 'Ecosystem Management', 'Research Methodology'],
      education: [
        { degree: 'PhD in Environmental Management', institution: 'Asian Institute of Technology', year: '2015' },
        { degree: 'MSc in Environmental Science', institution: 'Tribhuvan University', year: '2009' }
      ],
      years_experience: 14,
      publications: 38,
      languages: ['English', 'Nepali'],
      is_active: true,
      sort_order: 3
    },
    {
      name: 'Bijay Thapa',
      position: 'GIS & Remote Sensing Specialist',
      department: 'Technology',
      bio: 'Bijay specializes in geospatial technologies, drone surveying, and data analysis, bringing cutting-edge technical expertise to our projects.',
      expertise: ['GIS Mapping', 'Remote Sensing', 'Drone Technology', 'Geospatial Analysis'],
      education: [
        { degree: 'MSc in Geomatics Engineering', institution: 'Kathmandu University', year: '2018' },
        { degree: 'BE in Geomatics Engineering', institution: 'Kathmandu University', year: '2014' }
      ],
      years_experience: 8,
      publications: 15,
      languages: ['English', 'Nepali'],
      is_active: true,
      sort_order: 4
    }
  ];

  let count = 0;
  for (const member of teamMembers) {
    try {
      await pool.query(
        `INSERT INTO team_members (name, position, department, bio, expertise, education, years_experience, publications, languages, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          member.name, member.position, member.department, member.bio,
          JSON.stringify(member.expertise), JSON.stringify(member.education),
          member.years_experience, member.publications, JSON.stringify(member.languages),
          member.is_active, member.sort_order
        ]
      );
      count++;
    } catch (error) {
      if (error.code !== '23505') { // Not a duplicate key error
        console.error(`Error inserting team member "${member.name}":`, error.message);
      }
    }
  }
  
  console.log(`✅ Team members populated: ${count} items`);
};

// Sample projects data
const populateProjects = async () => {
  console.log('🔄 Populating Sample Projects...');
  
  const projects = [
    {
      title: 'Rural Solar Electrification Program',
      description: 'A comprehensive solar electrification initiative bringing clean energy access to remote villages across Nepal, impacting over 500 households.',
      excerpt: 'Bringing clean solar energy to 500+ rural households across Nepal.',
      category: 'Renewable Energy',
      type: 'Infrastructure',
      location: 'Dolakha District, Nepal',
      province: 'Province 3',
      district: 'Dolakha',
      status: 'completed',
      duration: '18 months',
      completion_date: '2024-03-15',
      start_date: '2022-09-01',
      client: 'Ministry of Energy, Water Resources and Irrigation',
      budget: 'NPR 2.5 Crores',
      team_size: '12 members',
      capacity: '250 kW',
      energy_generation: '2,500 kWh/month',
      images: ['/projects/solar-1.jpg', '/projects/solar-2.jpg'],
      technologies: ['Solar PV', 'Battery Storage', 'Smart Grid', 'IoT Monitoring'],
      objectives: [
        'Provide electricity access to 500+ households',
        'Reduce dependency on fossil fuels',
        'Create local employment opportunities',
        'Establish maintenance training programs'
      ],
      outcomes: [
        '523 households connected to clean energy',
        '78% reduction in kerosene usage',
        '45 local technicians trained',
        '12 micro-enterprises established'
      ],
      challenges: [
        'Remote geographical locations',
        'Weather-dependent installation',
        'Local technical capacity building',
        'Community engagement and awareness'
      ],
      impact: {
        economic: 'NPR 1.8 Crores annual savings on fuel costs',
        social: '2,100+ people benefited, improved quality of life',
        environmental: '150 tons CO2 emissions reduced annually'
      },
      featured: true,
      tags: ['Solar Energy', 'Rural Development', 'Clean Energy', 'Sustainability']
    },
    {
      title: 'Climate-Smart Agriculture Initiative',
      description: 'Implementing climate-resilient agricultural practices and technologies to enhance food security and farmer livelihoods in vulnerable communities.',
      excerpt: 'Climate-resilient farming practices for 200+ farmers.',
      category: 'Agriculture',
      type: 'Development',
      location: 'Sindhupalchok District, Nepal',
      province: 'Province 3',
      district: 'Sindhupalchok',
      status: 'ongoing',
      duration: '24 months',
      start_date: '2024-01-15',
      client: 'FAO Nepal',
      budget: 'NPR 1.8 Crores',
      team_size: '8 members',
      images: ['/projects/agriculture-1.jpg'],
      technologies: ['Precision Agriculture', 'Weather Monitoring', 'Crop Management Systems'],
      objectives: [
        'Introduce climate-smart farming techniques',
        'Improve crop yields and resilience',
        'Build farmer capacity on new technologies',
        'Establish market linkages'
      ],
      outcomes: [
        '220 farmers trained on climate-smart practices',
        '35% increase in crop productivity',
        '15 farmer groups formed',
        '8 weather monitoring stations installed'
      ],
      challenges: [
        'Changing weather patterns',
        'Limited access to modern farming inputs',
        'Traditional farming mindset',
        'Market access constraints'
      ],
      impact: {
        economic: '40% increase in farmer income',
        social: '220 farming families benefited',
        environmental: 'Improved soil health and water conservation'
      },
      featured: true,
      tags: ['Climate Change', 'Agriculture', 'Food Security', 'Capacity Building']
    },
    {
      title: 'Community-Based Disaster Preparedness',
      description: 'Strengthening community resilience through comprehensive disaster risk reduction and early warning systems in earthquake-prone areas.',
      excerpt: 'Building community resilience in earthquake-prone regions.',
      category: 'Disaster Management',
      type: 'Capacity Building',
      location: 'Gorkha District, Nepal',
      province: 'Province 4',
      district: 'Gorkha',
      status: 'completed',
      duration: '12 months',
      completion_date: '2023-12-30',
      start_date: '2023-01-01',
      client: 'UNDP Nepal',
      budget: 'NPR 95 Lakhs',
      team_size: '6 members',
      images: ['/projects/disaster-1.jpg', '/projects/disaster-2.jpg'],
      technologies: ['Early Warning Systems', 'Mobile Apps', 'Community Radio'],
      objectives: [
        'Establish community early warning systems',
        'Train local disaster response teams',
        'Develop evacuation and response plans',
        'Build community awareness on disaster risks'
      ],
      outcomes: [
        '15 communities covered with early warning systems',
        '120 community volunteers trained',
        '8 evacuation centers established',
        '5,000+ people reached through awareness campaigns'
      ],
      challenges: [
        'Remote and difficult terrain',
        'Limited communication infrastructure',
        'Varying levels of community participation',
        'Coordination with multiple stakeholders'
      ],
      impact: {
        economic: 'Reduced potential disaster losses by 60%',
        social: '5,000+ people better prepared for disasters',
        environmental: 'Improved natural resource management'
      },
      featured: true,
      tags: ['Disaster Management', 'Community Resilience', 'Early Warning', 'Capacity Building']
    }
  ];

  let count = 0;
  for (const project of projects) {
    const slug = generateSlug(project.title);
    
    try {
      await pool.query(
        `INSERT INTO projects (title, slug, description, excerpt, category, type, location, 
         province, district, status, duration, completion_date, start_date, client, budget, 
         team_size, capacity, energy_generation, images, technologies, objectives, outcomes, 
         challenges, impact, featured, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
         $19, $20, $21, $22, $23, $24, $25, $26)
         ON CONFLICT (slug) DO UPDATE SET
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         status = EXCLUDED.status,
         updated_at = CURRENT_TIMESTAMP`,
        [
          project.title, slug, project.description, project.excerpt, project.category,
          project.type, project.location, project.province, project.district, project.status,
          project.duration, project.completion_date, project.start_date, project.client,
          project.budget, project.team_size, project.capacity, project.energy_generation,
          JSON.stringify(project.images), JSON.stringify(project.technologies),
          JSON.stringify(project.objectives), JSON.stringify(project.outcomes),
          JSON.stringify(project.challenges), JSON.stringify(project.impact),
          project.featured, JSON.stringify(project.tags)
        ]
      );
      count++;
    } catch (error) {
      console.error(`Error inserting project "${project.title}":`, error.message);
    }
  }
  
  console.log(`✅ Projects populated: ${count} items`);
};

// Events data population
const populateEvents = async () => {
  console.log('🔄 Populating Sample Events...');
  
  const events = [
    {
      title: 'Renewable Energy Summit 2024',
      subtitle: 'Accelerating Clean Energy Transition in Nepal',
      description: 'A comprehensive summit bringing together renewable energy experts, policymakers, and stakeholders to discuss Nepal\'s clean energy future.',
      full_description: 'Join us for Nepal\'s premier renewable energy event featuring keynote speeches, panel discussions, and networking opportunities with leading experts in the field.',
      event_date: '2024-04-15',
      end_date: '2024-04-16',
      event_time: '9:00 AM - 5:00 PM',
      location: 'Kathmandu, Nepal',
      venue: 'Hotel Yak & Yeti',
      organizer: 'FEED Nepal',
      category: 'Conference',
      status: 'upcoming',
      capacity: 200,
      registered_attendees: 125,
      ticket_price: 'NPR 2,500',
      images: ['/events/summit-1.jpg'],
      speakers: [
        {
          name: 'Dr. Khadga Bahadur Basnet',
          title: 'Chairman, FEED Nepal',
          topic: 'Future of Renewable Energy in Nepal'
        },
        {
          name: 'Ms. Sunita Narain',
          title: 'Director General, Centre for Science and Environment',
          topic: 'Policy Framework for Clean Energy'
        }
      ],
      agenda: [
        { time: '9:00 AM', item: 'Registration and Networking' },
        { time: '10:00 AM', item: 'Opening Keynote' },
        { time: '11:30 AM', item: 'Panel: Solar Energy Potential' },
        { time: '2:00 PM', item: 'Workshop: Financing Clean Energy' }
      ],
      registration_url: 'https://feed.org.np/register/summit2024',
      contact_info: {
        email: 'events@feed.org.np',
        phone: '+977-1-4567890'
      },
      featured: true,
      tags: ['Renewable Energy', 'Summit', 'Policy', 'Innovation']
    },
    {
      title: 'GIS and Remote Sensing Workshop',
      subtitle: 'Advanced Mapping Techniques for Development',
      description: 'A hands-on workshop covering advanced GIS techniques, remote sensing applications, and drone mapping for sustainable development projects.',
      event_date: '2024-03-20',
      end_date: '2024-03-22',
      event_time: '9:00 AM - 4:00 PM',
      location: 'Pokhara, Nepal',
      venue: 'FEED Training Center',
      organizer: 'FEED Nepal',
      category: 'Workshop',
      status: 'upcoming',
      capacity: 30,
      registered_attendees: 28,
      ticket_price: 'NPR 5,000',
      images: ['/events/gis-workshop.jpg'],
      speakers: [
        {
          name: 'Bijay Thapa',
          title: 'GIS Specialist, FEED Nepal',
          topic: 'Advanced GIS Techniques'
        }
      ],
      agenda: [
        { time: '9:00 AM', item: 'Introduction to GIS' },
        { time: '11:00 AM', item: 'Remote Sensing Applications' },
        { time: '2:00 PM', item: 'Hands-on Drone Mapping' }
      ],
      contact_info: {
        email: 'training@feed.org.np',
        phone: '+977-61-123456'
      },
      featured: true,
      tags: ['GIS', 'Remote Sensing', 'Workshop', 'Training']
    }
  ];

  let count = 0;
  for (const event of events) {
    const slug = generateSlug(event.title);
    
    try {
      await pool.query(
        `INSERT INTO events (title, slug, subtitle, description, full_description, event_date, 
         end_date, event_time, location, venue, organizer, category, status, capacity, 
         registered_attendees, ticket_price, images, speakers, agenda, registration_url, 
         contact_info, featured, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
         ON CONFLICT (slug) DO UPDATE SET
         description = EXCLUDED.description,
         event_date = EXCLUDED.event_date,
         status = EXCLUDED.status,
         updated_at = CURRENT_TIMESTAMP`,
        [
          event.title, slug, event.subtitle, event.description, event.full_description,
          event.event_date, event.end_date, event.event_time, event.location, event.venue,
          event.organizer, event.category, event.status, event.capacity, event.registered_attendees,
          event.ticket_price, JSON.stringify(event.images || []), JSON.stringify(event.speakers || []),
          JSON.stringify(event.agenda || []), event.registration_url, JSON.stringify(event.contact_info || {}),
          event.featured, JSON.stringify(event.tags || [])
        ]
      );
      count++;
    } catch (error) {
      console.error(`Error inserting event "${event.title}":`, error.message);
    }
  }
  
  console.log(`✅ Events populated: ${count} items`);
};

// Publications data population
const populatePublications = async () => {
  console.log('🔄 Populating Sample Publications...');
  
  const publications = [
    {
      title: 'Renewable Energy Potential Assessment in Rural Nepal',
      subtitle: 'A Comprehensive Study of Solar and Micro-hydro Resources',
      type: 'Research Report',
      category: 'Energy',
      publication_date: '2024-01-15',
      authors: [
        { name: 'Dr. Khadga Bahadur Basnet', affiliation: 'FEED Nepal' },
        { name: 'Eng. Prakash Sharma', affiliation: 'FEED Nepal' }
      ],
      abstract: 'This comprehensive study assesses the renewable energy potential in rural areas of Nepal, focusing on solar photovoltaic and micro-hydro power systems. The research provides valuable insights for policymakers and developers.',
      description: 'A detailed analysis of renewable energy resources available in rural Nepal, including technical, economic, and social feasibility studies.',
      pages: 125,
      language: 'English',
      downloads: 1250,
      citations: 8,
      featured: true,
      is_public: true,
      tags: ['Renewable Energy', 'Rural Development', 'Nepal', 'Assessment']
    },
    {
      title: 'Climate Change Adaptation Strategies for Agriculture',
      type: 'Policy Brief',
      category: 'Climate',
      publication_date: '2023-11-20',
      authors: [
        { name: 'Dr. Sunita Regmi', affiliation: 'FEED Nepal' }
      ],
      abstract: 'This policy brief outlines key adaptation strategies for agricultural communities facing climate change challenges in Nepal.',
      description: 'Evidence-based recommendations for building climate resilience in Nepal\'s agricultural sector.',
      pages: 24,
      language: 'English',
      downloads: 856,
      citations: 15,
      featured: true,
      is_public: true,
      tags: ['Climate Change', 'Agriculture', 'Policy', 'Adaptation']
    },
    {
      title: 'GIS-Based Disaster Risk Mapping Manual',
      type: 'Technical Manual',
      category: 'Disaster Management',
      publication_date: '2023-08-10',
      authors: [
        { name: 'Bijay Thapa', affiliation: 'FEED Nepal' },
        { name: 'Research Team', affiliation: 'FEED Nepal' }
      ],
      abstract: 'A practical manual for creating disaster risk maps using GIS technology, designed for practitioners and local governments.',
      description: 'Step-by-step guide for disaster risk mapping using open-source GIS tools.',
      pages: 89,
      language: 'English',
      downloads: 2100,
      citations: 12,
      featured: true,
      is_public: true,
      tags: ['GIS', 'Disaster Management', 'Risk Mapping', 'Manual']
    }
  ];

  let count = 0;
  for (const publication of publications) {
    const slug = generateSlug(publication.title);
    
    try {
      await pool.query(
        `INSERT INTO publications (title, slug, subtitle, type, category, publication_date, 
         authors, abstract, description, pages, language, downloads, citations, featured, 
         is_public, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (slug) DO UPDATE SET
         abstract = EXCLUDED.abstract,
         downloads = EXCLUDED.downloads,
         citations = EXCLUDED.citations,
         updated_at = CURRENT_TIMESTAMP`,
        [
          publication.title, slug, publication.subtitle, publication.type, publication.category,
          publication.publication_date, JSON.stringify(publication.authors), publication.abstract,
          publication.description, publication.pages, publication.language, publication.downloads,
          publication.citations, publication.featured, publication.is_public, JSON.stringify(publication.tags)
        ]
      );
      count++;
    } catch (error) {
      console.error(`Error inserting publication "${publication.title}":`, error.message);
    }
  }
  
  console.log(`✅ Publications populated: ${count} items`);
};

// News data population
const populateNews = async () => {
  console.log('🔄 Populating Sample News...');
  
  const newsArticles = [
    {
      title: 'FEED Nepal Wins National Sustainability Award',
      excerpt: 'FEED Nepal has been recognized for its outstanding contributions to sustainable development and renewable energy initiatives.',
      content: 'FEED Nepal has been honored with the National Sustainability Award 2024 for its exceptional work in promoting renewable energy solutions and sustainable development practices across rural Nepal. The award recognizes our innovative approaches to community-based energy projects and capacity building initiatives.',
      author: 'Communications Team',
      category: 'Awards',
      publication_date: '2024-02-10',
      image_url: '/news/award-ceremony.jpg',
      featured: true,
      is_published: true,
      views: 1250,
      tags: ['Award', 'Recognition', 'Sustainability']
    },
    {
      title: 'New Solar Project Launches in Remote Village',
      excerpt: 'A groundbreaking solar electrification project has begun in one of Nepal\'s most remote villages, bringing clean energy to 150 households.',
      content: 'FEED Nepal has launched a new solar electrification project in Humla district, one of Nepal\'s most remote regions. This initiative will provide clean, reliable electricity to 150 households, improving quality of life and creating opportunities for local economic development. The project includes community training programs and long-term maintenance support.',
      author: 'Project Team',
      category: 'Projects',
      publication_date: '2024-01-25',
      image_url: '/news/solar-project.jpg',
      featured: true,
      is_published: true,
      views: 890,
      tags: ['Solar Energy', 'Rural Development', 'Clean Energy']
    },
    {
      title: 'Climate Adaptation Workshop Series Announced',
      excerpt: 'FEED Nepal announces a series of workshops on climate adaptation strategies for agricultural communities.',
      content: 'FEED Nepal is pleased to announce a comprehensive workshop series focused on climate adaptation strategies for agricultural communities. These workshops will cover practical techniques for climate-resilient farming, water management, and crop diversification. The series will reach over 500 farmers across five districts.',
      author: 'Training Department',
      category: 'Training',
      publication_date: '2024-01-12',
      featured: false,
      is_published: true,
      views: 456,
      tags: ['Climate Adaptation', 'Agriculture', 'Training']
    }
  ];

  let count = 0;
  for (const article of newsArticles) {
    const slug = generateSlug(article.title);
    
    try {
      await pool.query(
        `INSERT INTO news (title, slug, excerpt, content, author, category, publication_date, 
         image_url, featured, is_published, views, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (slug) DO UPDATE SET
         content = EXCLUDED.content,
         views = EXCLUDED.views,
         updated_at = CURRENT_TIMESTAMP`,
        [
          article.title, slug, article.excerpt, article.content, article.author,
          article.category, article.publication_date, article.image_url, article.featured,
          article.is_published, article.views, JSON.stringify(article.tags)
        ]
      );
      count++;
    } catch (error) {
      console.error(`Error inserting news article "${article.title}":`, error.message);
    }
  }
  
  console.log(`✅ News articles populated: ${count} items`);
};

// Main population function
const populateAllData = async () => {
  console.log('🚀 Starting data population...\n');
  
  try {
    await populateServices();
    await populateTeam();
    await populateProjects();
    await populateEvents();
    await populatePublications();
    await populateNews();
    
    console.log('\n🎉 All data populated successfully!');
  } catch (error) {
    console.error('❌ Error during data population:', error);
  } finally {
    await pool.end();
  }
};

// Run the population if this file is executed directly
if (require.main === module) {
  populateAllData();
}

module.exports = { populateAllData };
