const { pool } = require('../config/database');
const Projects = require('../models/Projects');

// Detailed projects data
const detailedProjects = [
  {
    slug: "landslide-susceptibility-mapping-dadeldhura",
    title: "Landslide Susceptibility Mapping - Dadeldhura",
    description: `This critical disaster risk reduction project involved detailed mapping of landslide susceptibility zones and conducting preliminary geotechnical assessments for two major landslide sites in Dadeldhura. The study provided essential baseline data for understanding slope stability conditions, identifying vulnerable areas, and developing appropriate mitigation strategies.
    
The assessment included field investigations, laboratory testing of soil samples, and advanced GIS-based susceptibility mapping to support evidence-based decision making for landslide risk management. Our team conducted comprehensive geological surveys, slope stability analyses, and risk assessment protocols.

Key methodologies included detailed topographic mapping, soil sampling and laboratory analysis, landslide inventory mapping, and vulnerability assessment of exposed communities and infrastructure. The project delivered critical insights for disaster preparedness and risk reduction planning in this geologically active region.

The results provide a foundation for implementing targeted mitigation measures and developing early warning systems to protect local communities from landslide hazards.`,
    excerpt: "Comprehensive geotechnical assessment and landslide susceptibility mapping of Balaucha and Owa landslide in Ward no.7, Aalital Rural Municipality, Dadeldhura District.",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop"
    ],
    category: "DRR/Environment",
    type: "Research",
    location: "Dadeldhura District, Nepal",
    province: "Sudurpashchim Province",
    district: "Dadeldhura",
    coordinates: [29.3000, 80.5833],
    status: "Completed",
    duration: "12 months",
    start_date: "2023-01-01",
    completion_date: "2023-12-31",
    client: "Aalital Rural Municipality, Department of Mines and Geology",
    budget: "NPR 2.5 million",
    team_size: "8 specialists",
    featured: true,
    tags: ["Landslide Risk", "GIS Mapping", "Geotechnical", "Disaster Risk Reduction"],
    objectives: [
      "Map landslide susceptibility zones with high accuracy",
      "Conduct preliminary geotechnical assessment of unstable slopes",
      "Identify vulnerable communities and infrastructure",
      "Develop risk mitigation recommendations"
    ],
    outcomes: [
      "Comprehensive landslide susceptibility maps created",
      "Detailed geotechnical assessment reports completed",
      "Risk assessment protocols established",
      "Community awareness programs implemented"
    ],
    challenges: [
      "Difficult terrain access for field investigations",
      "Limited historical landslide data availability",
      "Monsoon weather constraints on fieldwork",
      "Community engagement in remote areas"
    ],
    impact: {
      "Area Mapped": "150 km²",
      "Soil Samples Analyzed": "120+",
      "Landslide Sites Assessed": "25",
      "Communities Covered": "8"
    }
  },
  {
    slug: "glof-modeling-nbs-design",
    title: "GLOF Modeling & NbS Design",
    description: `This groundbreaking project addresses one of Nepal's most pressing climate risks: Glacial Lake Outburst Floods (GLOFs). As climate change accelerates glacial melting, the risk of catastrophic floods from glacial lake breaches has increased significantly across the Nepal Himalaya.

Our comprehensive approach combines advanced hydrodynamic modeling with innovative nature-based solutions to protect downstream communities and infrastructure. The project focused on four critical glacial lakes identified through satellite monitoring and field assessments.

Using state-of-the-art numerical modeling, we simulated potential outburst scenarios to understand flood propagation, peak discharge rates, and inundation patterns. This modeling informed the design of nature-based solutions including strategic vegetation barriers, bio-engineered structures, and natural retention areas.

The project demonstrates how traditional engineering approaches can be enhanced with ecosystem-based solutions to create more resilient and sustainable flood management systems in mountain environments.`,
    excerpt: "Protecting livelihood and assets from climate change induced flooding in glacial river basins. Advanced modeling of GLOF peak flood for four major glacial lakes with nature-based solutions.",
    images: [
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1464822759844-d150baec93c1?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop"
    ],
    category: "Climate Action",
    type: "Research & Development",
    location: "Nepal Himalaya",
    province: "Multiple Provinces",
    district: "Multiple Districts",
    coordinates: [28.0000, 84.0000],
    status: "Completed",
    duration: "24 months",
    start_date: "2022-03-01",
    completion_date: "2024-02-29",
    client: "Department of Hydrology and Meteorology, UNDP, Local Communities",
    budget: "USD 850,000",
    team_size: "15 researchers",
    featured: true,
    tags: ["GLOF", "Climate Change", "Flood Modeling", "Nature-based Solutions"],
    objectives: [
      "Model GLOF scenarios for four critical glacial lakes",
      "Design nature-based flood mitigation solutions",
      "Develop early warning system protocols",
      "Build local capacity for risk management"
    ],
    outcomes: [
      "Comprehensive GLOF risk maps produced",
      "Nature-based solution designs completed",
      "Community early warning systems established",
      "Local technician training programs implemented"
    ],
    challenges: [
      "Extreme altitude and harsh weather conditions",
      "Limited historical data on glacial lake dynamics",
      "Complex hydrodynamic modeling requirements",
      "Integrating traditional knowledge with scientific approaches"
    ],
    impact: {
      "Glacial Lakes Modeled": "4",
      "Communities Protected": "12",
      "Early Warning Stations": "6",
      "Risk Reduction": "60%"
    }
  },
  {
    slug: "marshyangdi-besi-hydropower-project",
    title: "Marshyangdi-Besi Hydropower Project",
    description: `This major hydropower feasibility study evaluated the technical, economic, environmental, and social aspects of developing a 50MW run-of-river hydropower project on the Marshyangdi River. The comprehensive study represents a significant contribution to Nepal's renewable energy development goals.

The project involved detailed hydrological analysis spanning multiple decades of flow data, comprehensive geological and geotechnical investigations, and sophisticated engineering design for the powerhouse, intake, and transmission infrastructure.

Environmental and social impact assessments were conducted using international best practices, including detailed biodiversity surveys, water quality assessments, and extensive community consultation processes. The study evaluated both direct and cumulative impacts on the river ecosystem and local communities.

Economic analysis included detailed cost-benefit modeling, financial projections, and risk assessment scenarios. The project demonstrates the potential for sustainable hydropower development that balances energy production with environmental protection and community benefits.`,
    excerpt: "Detailed feasibility study for 50MW Marshyangdi-Besi Hydropower Project in Lamjung District, contributing to Nepal's renewable energy development infrastructure.",
    images: [
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&h=400&fit=crop"
    ],
    category: "Renewable Energy",
    type: "Feasibility Study",
    location: "Lamjung District, Nepal",
    province: "Gandaki Province",
    district: "Lamjung",
    coordinates: [28.2167, 84.3833],
    status: "Completed",
    duration: "18 months",
    start_date: "2022-06-01",
    completion_date: "2023-11-30",
    client: "Nepal Electricity Authority, Private Developer Consortium",
    budget: "USD 450,000",
    team_size: "12 engineers",
    capacity: "50 MW",
    energy_generation: "280 GWh/year",
    featured: true,
    tags: ["Hydropower", "Renewable Energy", "Feasibility Study", "Environmental Assessment"],
    objectives: [
      "Complete detailed technical feasibility assessment",
      "Conduct comprehensive environmental impact study",
      "Develop optimal engineering design solutions",
      "Establish project economic viability"
    ],
    outcomes: [
      "Detailed feasibility report approved by NEA",
      "Environmental management plan developed",
      "Engineering designs completed to tender level",
      "Financial model validated by international standards"
    ],
    challenges: [
      "Complex river hydrology and seasonal variations",
      "Balancing environmental protection with energy needs",
      "Coordinating multiple stakeholder requirements",
      "Managing technical risks in mountainous terrain"
    ],
    impact: {
      "Power Generation Capacity": "50 MW",
      "Annual Energy Production": "280 GWh",
      "Households Served": "75,000",
      "CO2 Emissions Avoided": "140,000 tons/year"
    }
  },
  {
    slug: "climate-responsive-watershed-management",
    title: "Climate Responsive Watershed Management",
    description: `This pioneering project developed an integrated watershed management plan that specifically addresses climate change impacts in the Likhu River Basin and Sunkosi Canyon. The plan integrates climate science, hydrological modeling, ecosystem assessment, and community engagement to create adaptive management strategies.

The project employed cutting-edge climate modeling to understand future precipitation patterns, temperature changes, and extreme weather events. This climate intelligence informed the development of adaptive management strategies that can evolve with changing conditions.

Key components include flood risk assessment using probabilistic modeling, erosion control measures using bio-engineering techniques, biodiversity conservation strategies, and climate-resilient agricultural practices. The project serves as a model for climate-responsive watershed management in Nepal's mountain regions.

Community participation was central to the planning process, ensuring that local knowledge and needs were integrated with scientific assessments. The resulting plan provides a roadmap for sustainable watershed management that enhances resilience to climate change while supporting local livelihoods.`,
    excerpt: "Preparation of Climate Responsive Integrated Watershed Management Plan (CRIWMP) for Likhu River Basin and Sunkosi Canyon with climate adaptation strategies.",
    images: [
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1573160813959-df4b6b9f47c9?w=600&h=400&fit=crop"
    ],
    category: "Water Management",
    type: "Planning & Strategy",
    location: "Likhu River Basin, Nepal",
    province: "Bagmati Province",
    district: "Ramechhap",
    coordinates: [27.6333, 86.0833],
    status: "Completed",
    duration: "15 months",
    start_date: "2022-08-01",
    completion_date: "2023-10-31",
    client: "Ministry of Forests and Environment, Local Governments, World Bank",
    budget: "USD 320,000",
    team_size: "10 specialists",
    featured: true,
    tags: ["Watershed Management", "Climate Adaptation", "Water Resources", "Community Planning"],
    objectives: [
      "Develop climate-responsive watershed management strategies",
      "Integrate traditional and scientific knowledge systems",
      "Create adaptive management frameworks",
      "Build local institutional capacity for implementation"
    ],
    outcomes: [
      "Comprehensive watershed management plan approved",
      "Climate adaptation strategies developed",
      "Community-based monitoring systems established",
      "Local capacity building programs implemented"
    ],
    challenges: [
      "Integrating multiple scale climate projections",
      "Balancing diverse stakeholder interests",
      "Addressing data limitations in remote areas",
      "Ensuring long-term plan implementation sustainability"
    ],
    impact: {
      "Watershed Area Covered": "450 km²",
      "Communities Involved": "15",
      "Climate Scenarios Modeled": "8",
      "Adaptation Measures Identified": "32"
    }
  }
];

async function uploadDetailedProjects() {
  try {
    console.log('🚀 Starting to upload detailed projects...');
    
    // First, let's check if the projects table exists and create it if it doesn't
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        excerpt TEXT,
        category VARCHAR(100) NOT NULL,
        type VARCHAR(100),
        location VARCHAR(255),
        province VARCHAR(100),
        district VARCHAR(100),
        coordinates POINT,
        status VARCHAR(50) NOT NULL,
        duration VARCHAR(100),
        completion_date DATE,
        start_date DATE,
        client VARCHAR(255),
        budget VARCHAR(100),
        team_size VARCHAR(50),
        capacity VARCHAR(100),
        energy_generation VARCHAR(100),
        images JSONB DEFAULT '[]',
        technologies JSONB DEFAULT '[]',
        objectives JSONB DEFAULT '[]',
        outcomes JSONB DEFAULT '[]',
        challenges JSONB DEFAULT '[]',
        impact JSONB DEFAULT '{}',
        featured BOOLEAN DEFAULT false,
        tags JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes if they don't exist
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
      CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
      CREATE INDEX IF NOT EXISTS idx_projects_province ON projects(province);
    `);

    console.log('✅ Projects table and indexes are ready');

    let successCount = 0;
    let errorCount = 0;

    for (const project of detailedProjects) {
      try {
        // Check if project already exists
        const existingProject = await Projects.findBySlug(project.slug);
        
        if (existingProject) {
          console.log(`⚠️  Project "${project.title}" already exists, skipping...`);
          continue;
        }

        // Convert coordinates array to POINT format if provided
        let coordinates = null;
        if (project.coordinates && Array.isArray(project.coordinates)) {
          coordinates = `POINT(${project.coordinates[1]} ${project.coordinates[0]})`; // PostgreSQL format: lng, lat
        }

        // Prepare project data for database insertion
        const projectData = {
          title: project.title,
          slug: project.slug,
          description: project.description,
          excerpt: project.excerpt,
          category: project.category,
          type: project.type || 'Project',
          location: project.location,
          province: project.province,
          district: project.district,
          coordinates: coordinates,
          status: project.status,
          duration: project.duration,
          completion_date: project.completion_date,
          start_date: project.start_date,
          client: project.client,
          budget: project.budget,
          team_size: project.team_size,
          capacity: project.capacity,
          energy_generation: project.energy_generation,
          images: project.images || [],
          objectives: project.objectives || [],
          outcomes: project.outcomes || [],
          challenges: project.challenges || [],
          impact: project.impact || {},
          featured: project.featured || false,
          tags: project.tags || []
        };

        const createdProject = await Projects.create(projectData);
        console.log(`✅ Successfully uploaded: "${project.title}" (ID: ${createdProject.id})`);
        successCount++;

      } catch (projectError) {
        console.error(`❌ Error uploading "${project.title}":`, projectError.message);
        errorCount++;
      }
    }

    console.log('\n📊 Upload Summary:');
    console.log(`✅ Successfully uploaded: ${successCount} projects`);
    console.log(`❌ Errors: ${errorCount} projects`);
    console.log(`📊 Total projects in database: ${await Projects.getCount()}`);

    // Display some sample data
    console.log('\n🔍 Sample of uploaded projects:');
    const sampleProjects = await Projects.findAll({ limit: 3 });
    sampleProjects.forEach(project => {
      console.log(`- ${project.title} (${project.category}) - ${project.status}`);
    });

    console.log('\n🎉 Detailed projects upload completed successfully!');

  } catch (error) {
    console.error('❌ Fatal error during upload:', error);
    process.exit(1);
  }
}

// Run the upload if this script is executed directly
if (require.main === module) {
  uploadDetailedProjects()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadDetailedProjects };
