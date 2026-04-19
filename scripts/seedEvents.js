const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'pass123',
  port: 5432,
});

const events = [
  {
    slug: "climate-resilience-summit-2024",
    title: "Climate Resilience Summit 2024",
    subtitle: "Building Sustainable Futures in the Himalayas",
    description: "Join leading experts, policymakers, and practitioners for a comprehensive discussion on climate adaptation strategies and innovative solutions for mountain communities.",
    fullDescription: "The Climate Resilience Summit 2024 brings together over 300 participants from across the globe to address the urgent challenges of climate change in mountain ecosystems. This premier event features cutting-edge research presentations, interactive workshops, and strategic planning sessions focused on building resilient communities in the face of climate uncertainty.",
    startDate: "2025-09-15",
    endDate: "2025-09-17",
    eventTime: "09:00 AM - 06:00 PM",
    location: "Kathmandu Valley Convention Center, Nepal",
    venue: "Grand Ballroom & Conference Halls",
    organizer: "FEED in partnership with UNDP and Ministry of Environment",
    category: "Summit",
    status: "upcoming",
    capacity: 300,
    registeredAttendees: 245,
    ticketPrice: "Free Registration",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop"
    ]),
    speakers: JSON.stringify([
      {
        name: "Dr. Sarah Chen",
        title: "Climate Scientist, IPCC",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop",
        bio: "Leading expert in Himalayan climate systems and glacial dynamics"
      },
      {
        name: "Prof. Ram Prasad Shrestha",
        title: "Director, Nepal Academy of Science",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        bio: "Specialist in mountain ecosystem research and biodiversity conservation"
      }
    ]),
    featured: true,
    tags: JSON.stringify(["Climate Change", "Summit", "Research", "Policy", "Adaptation"])
  },
  {
    slug: "youth-leadership-workshop-2024",
    title: "Youth Leadership Workshop 2024",
    subtitle: "Empowering Tomorrow's Environmental Leaders",
    description: "An intensive workshop designed to develop leadership skills among young environmentalists and climate activists, focusing on project management, advocacy, and sustainable development.",
    fullDescription: "The Youth Leadership Workshop 2024 is designed to empower the next generation of environmental leaders with the skills, knowledge, and network needed to drive meaningful change in their communities and beyond.",
    startDate: "2024-06-10",
    endDate: "2024-06-12",
    eventTime: "09:00 AM - 05:00 PM",
    location: "Pokhara Youth Center, Nepal",
    venue: "Training Halls & Outdoor Activity Area",
    organizer: "FEED Youth Network",
    category: "Workshop",
    status: "completed",
    capacity: 50,
    registeredAttendees: 48,
    ticketPrice: "NPR 2,500",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=500&fit=crop"
    ]),
    speakers: JSON.stringify([
      {
        name: "Anil Chitrakar",
        title: "Youth Coordinator, UNDP Nepal",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        bio: "Expert in youth development and environmental advocacy"
      }
    ]),
    featured: true,
    tags: JSON.stringify(["Youth", "Leadership", "Workshop", "Empowerment", "Environment"])
  },
  {
    slug: "disaster-preparedness-training-lalitpur",
    title: "Community Disaster Preparedness Training",
    subtitle: "Lalitpur District Initiative",
    description: "Comprehensive training program for community members on disaster risk reduction, emergency response planning, and building community resilience.",
    fullDescription: "This community-focused training program aims to build local capacity for disaster preparedness and response. Participants will learn practical skills for emergency situations and develop community-based disaster risk reduction plans.",
    startDate: "2024-04-20",
    endDate: "2024-04-21",
    eventTime: "10:00 AM - 04:00 PM",
    location: "Lalitpur Community Center",
    venue: "Main Hall & Training Rooms",
    organizer: "FEED & Local Government",
    category: "Training",
    status: "completed",
    capacity: 100,
    registeredAttendees: 85,
    ticketPrice: "Free",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=500&fit=crop"
    ]),
    speakers: JSON.stringify([
      {
        name: "Sita Pandey",
        title: "Disaster Risk Specialist",
        image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=200&fit=crop",
        bio: "Community disaster preparedness expert"
      }
    ]),
    featured: false,
    tags: JSON.stringify(["Disaster Preparedness", "Community", "Training", "Emergency Response"])
  },
  {
    slug: "sustainable-agriculture-symposium",
    title: "Sustainable Agriculture Symposium",
    subtitle: "Climate-Smart Farming for the Future",
    description: "Exploring innovative agricultural practices, climate adaptation strategies, and sustainable farming technologies for enhanced food security and environmental protection.",
    fullDescription: "The Sustainable Agriculture Symposium brings together farmers, researchers, policymakers, and agricultural extension workers to explore cutting-edge approaches to climate-smart agriculture.",
    startDate: "2024-05-18",
    endDate: "2024-05-19",
    eventTime: "08:00 AM - 06:00 PM",
    location: "Chitwan Agricultural Center",
    venue: "Conference Hall & Demonstration Farms",
    organizer: "FEED & Ministry of Agriculture",
    category: "Symposium",
    status: "upcoming",
    capacity: 200,
    registeredAttendees: 156,
    ticketPrice: "NPR 1,500 (Farmers: Free)",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=500&fit=crop"
    ]),
    speakers: JSON.stringify([
      {
        name: "Dr. Priya Sharma",
        title: "Agricultural Research Scientist",
        image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200&h=200&fit=crop",
        bio: "Specialist in climate-smart agriculture and sustainable farming systems"
      }
    ]),
    featured: true,
    tags: JSON.stringify(["Agriculture", "Sustainability", "Climate Smart", "Farming"])
  },
  {
    slug: "water-resource-management-conference",
    title: "Water Resource Management Conference",
    subtitle: "Sustainable Water Solutions for Nepal",
    description: "A comprehensive conference addressing water scarcity, quality management, and innovative solutions for sustainable water resource management in Nepal's changing climate.",
    fullDescription: "This conference brings together water experts, policy makers, and community leaders to discuss sustainable water management strategies for Nepal's diverse geographical regions.",
    startDate: "2024-08-25",
    endDate: "2024-08-26",
    eventTime: "09:30 AM - 05:30 PM",
    location: "Kathmandu Water Management Institute",
    venue: "Main Auditorium & Workshop Rooms",
    organizer: "FEED & Ministry of Water Resources",
    category: "Conference",
    status: "upcoming",
    capacity: 150,
    registeredAttendees: 89,
    ticketPrice: "NPR 3,000",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop"
    ]),
    speakers: JSON.stringify([
      {
        name: "Dr. Krishna Murthy",
        title: "Water Resource Engineer",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        bio: "Expert in watershed management and water conservation"
      }
    ]),
    featured: false,
    tags: JSON.stringify(["Water Management", "Conference", "Sustainability", "Policy"])
  }
];

async function seedEvents() {
  try {
    console.log('Starting events seeding...');
    
    // Clear existing events
    await pool.query('DELETE FROM events');
    console.log('Cleared existing events');

    // Insert events
    for (const event of events) {
      const query = `
        INSERT INTO events (
          title, subtitle, description, full_description, event_date, end_date,
          event_time, location, venue, organizer, category, status, capacity,
          registered_attendees, ticket_price, images, speakers, featured,
          tags, slug
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      `;
      
      const values = [
        event.title, event.subtitle, event.description, event.fullDescription,
        event.startDate, event.endDate, event.eventTime, event.location, event.venue,
        event.organizer, event.category, event.status, event.capacity,
        event.registeredAttendees, event.ticketPrice, event.images, event.speakers,
        event.featured, event.tags, event.slug
      ];
      
      await pool.query(query, values);
      console.log(`✓ Inserted: ${event.title}`);
    }
    
    console.log(`\n✅ Successfully seeded ${events.length} events!`);
  } catch (error) {
    console.error('Error seeding events:', error);
  } finally {
    await pool.end();
  }
}

seedEvents();
