const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'pass123',
  port: 5432,
});

const teamMembers = [
  {
    name: "Dr. Sarah Chen",
    position: "Executive Director & Chief Scientist",
    department: "Leadership",
    bio: "Dr. Sarah Chen brings over 15 years of experience in environmental science and sustainable development. She holds a PhD in Environmental Engineering from MIT and has led numerous international climate adaptation projects across Asia and Africa.",
    expertise: JSON.stringify(["Climate Science", "Environmental Policy", "International Development", "Research Strategy"]),
    education: JSON.stringify([
      "PhD Environmental Engineering, MIT",
      "MS Environmental Science, Stanford University", 
      "BS Chemical Engineering, UC Berkeley"
    ]),
    imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
    email: "sarah.chen@feed.org.np",
    linkedin: "https://linkedin.com/in/sarahchen",
    publications: 45,
    yearsExperience: 15,
    languages: JSON.stringify(["English", "Mandarin", "Nepali"]),
    awards: JSON.stringify([
      "International Climate Leadership Award 2023",
      "Environmental Excellence Award 2021",
      "Outstanding Research Contribution 2019"
    ]),
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Eng. Ram Prasad Shrestha",
    position: "Technical Director",
    department: "Engineering",
    bio: "Ram Prasad Shrestha is a seasoned engineer specializing in renewable energy systems and sustainable infrastructure. With over 12 years of hands-on experience, he has designed and implemented clean energy solutions across the Himalayan region.",
    expertise: JSON.stringify(["Renewable Energy", "Hydropower Systems", "Grid Integration", "Project Management"]),
    education: JSON.stringify([
      "MS Electrical Engineering, Tribhuvan University",
      "BS Mechanical Engineering, IOE Pulchowk",
      "Renewable Energy Certification, ICIMOD"
    ]),
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    email: "ram.shrestha@feed.org.np",
    linkedin: "https://linkedin.com/in/ramshrestha",
    publications: 28,
    yearsExperience: 12,
    languages: JSON.stringify(["Nepali", "English", "Hindi"]),
    awards: JSON.stringify([
      "Best Engineering Project Award 2022",
      "Innovation in Renewable Energy 2020"
    ]),
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Dr. Maria Rodriguez",
    position: "Research Coordinator",
    department: "Research",
    bio: "Dr. Maria Rodriguez is a dedicated researcher focusing on climate adaptation and community resilience. Her work spans disaster risk reduction, sustainable agriculture, and ecosystem restoration across developing nations.",
    expertise: JSON.stringify(["Climate Adaptation", "Disaster Risk Reduction", "Community Development", "Ecosystem Restoration"]),
    education: JSON.stringify([
      "PhD Geography, University of Cambridge",
      "MS Environmental Studies, Oxford University",
      "BS Biology, Universidad Complutense Madrid"
    ]),
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    email: "maria.rodriguez@feed.org.np",
    linkedin: "https://linkedin.com/in/mariarodriguez",
    publications: 32,
    yearsExperience: 10,
    languages: JSON.stringify(["Spanish", "English", "Portuguese", "Nepali"]),
    awards: JSON.stringify([
      "Excellence in Climate Research 2023",
      "Community Impact Award 2021"
    ]),
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Priya Maharjan",
    position: "Project Manager",
    department: "Operations",
    bio: "Priya Maharjan is an experienced project manager with expertise in coordinating complex development projects. She specializes in stakeholder engagement, community mobilization, and ensuring project delivery within scope and timeline.",
    expertise: JSON.stringify(["Project Management", "Community Engagement", "Stakeholder Relations", "Program Coordination"]),
    education: JSON.stringify([
      "MBA Project Management, Kathmandu University",
      "BS Development Studies, Tribhuvan University"
    ]),
    imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop",
    email: "priya.maharjan@feed.org.np",
    linkedin: "https://linkedin.com/in/priyamaharjan",
    publications: 12,
    yearsExperience: 8,
    languages: JSON.stringify(["Nepali", "English", "Newari"]),
    awards: JSON.stringify([
      "Outstanding Project Leadership 2022",
      "Community Excellence Award 2020"
    ]),
    isActive: true,
    sortOrder: 4
  },
  {
    name: "Dr. James Wilson",
    position: "Senior Environmental Consultant",
    department: "Consulting",
    bio: "Dr. James Wilson brings international expertise in environmental assessment and sustainable development planning. He has worked with major development agencies across South Asia and Africa.",
    expertise: JSON.stringify(["Environmental Impact Assessment", "Sustainable Planning", "Policy Development", "International Development"]),
    education: JSON.stringify([
      "PhD Environmental Science, University of Edinburgh",
      "MS Environmental Management, Imperial College London",
      "BS Environmental Engineering, University of Leeds"
    ]),
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    email: "james.wilson@feed.org.np",
    linkedin: "https://linkedin.com/in/jameswilson",
    publications: 38,
    yearsExperience: 14,
    languages: JSON.stringify(["English", "French", "Swahili"]),
    awards: JSON.stringify([
      "International Environmental Excellence 2023",
      "Sustainable Development Leadership 2021"
    ]),
    isActive: true,
    sortOrder: 5
  },
  {
    name: "Anjali Thapa",
    position: "GIS & Remote Sensing Specialist",
    department: "Technology",
    bio: "Anjali Thapa specializes in geographic information systems and remote sensing technologies for environmental monitoring and disaster management. She leads our digital mapping and spatial analysis initiatives.",
    expertise: JSON.stringify(["GIS Analysis", "Remote Sensing", "Spatial Data", "Environmental Monitoring"]),
    education: JSON.stringify([
      "MS GIS & Remote Sensing, Tribhuvan University",
      "BS Geography, Prithvi Narayan Campus"
    ]),
    imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop",
    email: "anjali.thapa@feed.org.np",
    linkedin: "https://linkedin.com/in/anjalithapa",
    publications: 15,
    yearsExperience: 6,
    languages: JSON.stringify(["Nepali", "English", "Hindi"]),
    awards: JSON.stringify([
      "Best Technology Implementation 2022",
      "Innovation Award 2021"
    ]),
    isActive: true,
    sortOrder: 6
  }
];

async function seedTeamMembers() {
  try {
    console.log('Starting team members seeding...');
    
    // Clear existing team members
    await pool.query('DELETE FROM team_members');
    console.log('Cleared existing team members');

    // Insert team members
    for (const member of teamMembers) {
      const query = `
        INSERT INTO team_members (
          name, position, department, bio, expertise, education, image_url,
          email, linkedin, publications, years_experience, languages, awards,
          is_active, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `;
      
      const values = [
        member.name, member.position, member.department, member.bio,
        member.expertise, member.education, member.imageUrl, member.email,
        member.linkedin, member.publications, member.yearsExperience,
        member.languages, member.awards, member.isActive, member.sortOrder
      ];
      
      await pool.query(query, values);
      console.log(`✓ Inserted: ${member.name}`);
    }
    
    console.log(`\n✅ Successfully seeded ${teamMembers.length} team members!`);
  } catch (error) {
    console.error('Error seeding team members:', error);
  } finally {
    await pool.end();
  }
}

seedTeamMembers();
