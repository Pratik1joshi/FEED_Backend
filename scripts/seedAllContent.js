const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'pass123',
  port: 5432,
});

const publications = [
  {
    title: "Climate Resilience Strategies for Mountain Communities",
    slug: "climate-resilience-mountain-communities",
    subtitle: "A Comprehensive Guide for Policy Makers",
    type: "Research Report",
    category: "Climate Change",
    publicationDate: "2024-03-15",
    authors: JSON.stringify([
      { name: "Dr. Sarah Chen", affiliation: "FEED" },
      { name: "Dr. James Wilson", affiliation: "FEED" }
    ]),
    abstract: "This research report presents comprehensive strategies for building climate resilience in mountain communities, focusing on adaptation measures and sustainable development practices.",
    description: "An in-depth analysis of climate challenges facing mountain communities and practical solutions for adaptation.",
    downloadUrl: "/publications/climate-resilience-2024.pdf",
    imageUrl: "https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=600&h=400&fit=crop",
    tags: JSON.stringify(["Climate Change", "Mountain Communities", "Adaptation", "Policy"]),
    pages: 120,
    language: "English",
    featured: true,
    isPublic: true
  },
  {
    title: "Sustainable Energy Solutions for Rural Nepal",
    slug: "sustainable-energy-rural-nepal",
    subtitle: "Case Studies and Best Practices",
    type: "Case Study",
    category: "Renewable Energy",
    publicationDate: "2024-01-20",
    authors: JSON.stringify([
      { name: "Eng. Ram Prasad Shrestha", affiliation: "FEED" },
      { name: "Dr. Maria Rodriguez", affiliation: "FEED" }
    ]),
    abstract: "This publication documents successful renewable energy implementations in rural Nepal, providing practical insights for similar projects.",
    description: "Collection of case studies showcasing renewable energy projects and their impact on rural communities.",
    downloadUrl: "/publications/rural-energy-2024.pdf",
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&h=400&fit=crop",
    tags: JSON.stringify(["Renewable Energy", "Rural Development", "Nepal", "Case Studies"]),
    pages: 95,
    language: "English",
    featured: true,
    isPublic: true
  },
  {
    title: "Disaster Risk Reduction in the Himalayas",
    slug: "disaster-risk-reduction-himalayas",
    subtitle: "Community-Based Approaches",
    type: "Technical Manual",
    category: "Disaster Management",
    publicationDate: "2023-11-10",
    authors: JSON.stringify([
      { name: "Dr. Maria Rodriguez", affiliation: "FEED" },
      { name: "Priya Maharjan", affiliation: "FEED" }
    ]),
    abstract: "A technical manual outlining community-based disaster risk reduction strategies specifically designed for Himalayan regions.",
    description: "Practical guidelines for communities and organizations working on disaster preparedness in mountain areas.",
    downloadUrl: "/publications/disaster-risk-2023.pdf",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&h=400&fit=crop",
    tags: JSON.stringify(["Disaster Risk", "Community", "Himalayas", "Manual"]),
    pages: 78,
    language: "English",
    featured: false,
    isPublic: true
  }
];

const news = [
  {
    title: "FEED Wins International Climate Innovation Award 2024",
    slug: "feed-climate-innovation-award-2024",
    excerpt: "Our innovative approach to climate adaptation in mountain communities has been recognized with a prestigious international award.",
    content: "We are proud to announce that FEED has been awarded the International Climate Innovation Award 2024 for our groundbreaking work in developing climate resilience strategies for mountain communities. This recognition highlights our commitment to creating sustainable solutions that address the unique challenges faced by communities in the Himalayan region.\n\nThe award was presented at the Global Climate Summit in Geneva, where our Executive Director, Dr. Sarah Chen, accepted the honor on behalf of our entire team. The judging panel particularly praised our community-centered approach and the measurable impact of our interventions on local adaptation capacity.\n\nThis achievement would not have been possible without the dedication of our team and the trust of the communities we serve. We remain committed to advancing climate resilience and sustainable development in the region.",
    author: "FEED Communications Team",
    category: "Awards",
    publicationDate: "2024-03-20",
    imageUrl: "https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=800&h=500&fit=crop",
    tags: JSON.stringify(["Awards", "Climate Change", "Innovation", "Recognition"]),
    featured: true,
    isPublished: true,
    views: 1250
  },
  {
    title: "New Partnership with UNDP Nepal Launched",
    slug: "undp-nepal-partnership-2024",
    excerpt: "FEED announces strategic partnership with UNDP Nepal to scale climate adaptation initiatives across the country.",
    content: "We are excited to announce a new strategic partnership with the United Nations Development Programme (UNDP) Nepal that will significantly expand our climate adaptation work across the country. This three-year collaboration will focus on building community resilience and implementing nature-based solutions in vulnerable mountain regions.\n\nThe partnership will leverage FEED's technical expertise and UNDP's extensive network to reach more communities and create greater impact. Together, we will work on capacity building, policy development, and implementing innovative adaptation technologies.\n\nThis collaboration represents a major step forward in our mission to create sustainable, resilient communities that can thrive in the face of climate change.",
    author: "Dr. Sarah Chen",
    category: "Partnerships",
    publicationDate: "2024-02-15",
    imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=500&fit=crop",
    tags: JSON.stringify(["Partnership", "UNDP", "Climate Adaptation", "Collaboration"]),
    featured: true,
    isPublished: true,
    views: 890
  },
  {
    title: "Successful Completion of Renewable Energy Project in Dolakha",
    slug: "dolakha-renewable-energy-completion",
    excerpt: "Our team successfully completes a 2MW micro-hydro project bringing clean energy to 500 households in Dolakha district.",
    content: "We are pleased to announce the successful completion of our micro-hydropower project in Dolakha district, which will provide clean, reliable electricity to over 500 households in the region. The 2MW facility represents a significant milestone in our efforts to expand renewable energy access in rural Nepal.\n\nThe project faced several challenges, including difficult terrain and logistical constraints, but our team's expertise and the strong support of the local community made this achievement possible. The new facility will not only provide electricity but also create local employment opportunities and support economic development in the area.\n\nThis project demonstrates the potential for community-owned renewable energy systems to transform rural livelihoods while contributing to Nepal's clean energy goals.",
    author: "Eng. Ram Prasad Shrestha",
    category: "Project Updates",
    publicationDate: "2024-01-30",
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=500&fit=crop",
    tags: JSON.stringify(["Renewable Energy", "Hydropower", "Rural Development", "Success Story"]),
    featured: false,
    isPublished: true,
    views: 642
  }
];

const blogs = [
  {
    title: 'Community Solar Microgrids Are Changing Rural Nepal',
    slug: 'community-solar-microgrids-rural-nepal',
    excerpt: 'How locally owned solar systems are improving energy access, livelihoods, and resilience in off-grid communities.',
    content: `
      <p>Community-owned solar microgrids are proving to be one of the most effective ways to expand clean energy access in remote parts of Nepal. By keeping ownership local, communities retain control over pricing, maintenance, and long-term benefits.</p>

      <h3>Why microgrids work</h3>
      <p>Unlike large centralized systems, microgrids can be sized for actual local demand and expanded over time. That makes them practical for settlements that are far from the national grid and need reliable power for homes, schools, and small businesses.</p>

      <p>FEED’s recent work shows that the strongest projects combine technical design with community governance and training. When local users are involved from the beginning, systems are more likely to stay operational and financially sustainable.</p>

      <h3>The bigger impact</h3>
      <p>Beyond electricity, these projects support better education, safer health services, and new income opportunities. They also reduce dependence on diesel and kerosene, which lowers household costs and emissions.</p>
    `,
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=500&fit=crop',
    publishDate: '2025-03-18',
    authorName: 'Eng. Ram Prasad Shrestha',
    authorTitle: 'Technical Director',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    category: 'Energy',
    tags: ['Solar Energy', 'Microgrids', 'Rural Development', 'Community Ownership'],
    status: 'published',
    featured: true,
    readTime: '4 min read'
  },
  {
    title: 'Why Community-Led Climate Adaptation Outperforms Top-Down Models',
    slug: 'community-led-climate-adaptation-models',
    excerpt: 'Local knowledge, local ownership, and local action consistently deliver stronger adaptation outcomes.',
    content: `
      <p>Community-led climate adaptation is not just a philosophy. It is a practical model that consistently delivers better results because it starts with local realities instead of assumptions made far away.</p>

      <h3>Local knowledge matters</h3>
      <p>Communities know which slopes are unstable, which water sources fail in dry seasons, and which households are most exposed. That knowledge is essential when designing adaptation measures that actually work.</p>

      <p>Projects that include community members in planning and monitoring also build trust faster and create a shared sense of responsibility. That usually leads to better maintenance and stronger long-term outcomes.</p>

      <h3>What the evidence shows</h3>
      <p>Across FEED’s field work, the most successful adaptation projects are those that combine scientific analysis with participatory design. The result is not only more resilient infrastructure, but also more resilient institutions and social networks.</p>
    `,
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=500&fit=crop',
    publishDate: '2025-02-10',
    authorName: 'Dr. Maria Rodriguez',
    authorTitle: 'Research Director',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    category: 'Research',
    tags: ['Climate Adaptation', 'Community Development', 'Resilience', 'Research'],
    status: 'published',
    featured: true,
    readTime: '5 min read'
  },
  {
    title: 'Young Leaders Are Rewriting the Climate Action Playbook',
    slug: 'young-leaders-climate-action-playbook',
    excerpt: 'FEED’s youth program is turning climate concern into practical leadership and local projects.',
    content: `
      <p>The most effective climate leaders in many communities are young people who are willing to challenge the old playbook and test new approaches. FEED’s youth program is built around that idea.</p>

      <h3>Training that leads to action</h3>
      <p>Participants do more than attend workshops. They design projects, work with communities, and learn how to turn climate ideas into real implementation plans.</p>

      <p>Several graduates have already launched urban farming initiatives, awareness campaigns, and disaster preparedness programs in their own neighborhoods.</p>

      <h3>Why it matters</h3>
      <p>Climate change is a long-term challenge, but it also needs immediate leadership. Giving young people tools, mentorship, and a platform creates a pipeline of practical climate problem-solvers.</p>
    `,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop',
    publishDate: '2025-01-15',
    authorName: 'Sita Pandey',
    authorTitle: 'Community Outreach Coordinator',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    category: 'Leadership',
    tags: ['Youth', 'Leadership', 'Climate Action', 'Community'],
    status: 'published',
    featured: false,
    readTime: '4 min read'
  },
  {
    title: 'Measuring Real Impact in Community Climate Projects',
    slug: 'measuring-impact-community-climate-projects',
    excerpt: 'Good climate work needs good measurement: not just outputs, but lasting changes in resilience and livelihoods.',
    content: `
      <p>Impact measurement is often treated as a reporting exercise. In community climate projects, it should be much more than that. It should be a tool for learning, adapting, and improving outcomes.</p>

      <h3>What to measure</h3>
      <p>Project teams should look at environmental, social, and economic indicators together. A solar microgrid, for example, is not just about kilowatts. It is also about household savings, school study time, clinic reliability, and local ownership.</p>

      <h3>Why it matters</h3>
      <p>When communities can see the real effects of a project, they are more likely to support it, maintain it, and improve it over time. Good measurement strengthens accountability and helps successful models scale.</p>
    `,
    image: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=500&fit=crop',
    publishDate: '2024-12-08',
    authorName: 'Dr. Aisha Patel',
    authorTitle: 'Monitoring & Evaluation Specialist',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    category: 'Evaluation',
    tags: ['Impact Measurement', 'Evaluation', 'Climate Projects', 'Learning'],
    status: 'published',
    featured: false,
    readTime: '3 min read'
  }
];

async function seedAllContent() {
  try {
    console.log('🌱 Starting comprehensive content seeding...\n');
    
    // Seed Publications
    console.log('📚 Seeding Publications...');
    await pool.query('DELETE FROM publications');
    
    for (const publication of publications) {
      const query = `
        INSERT INTO publications (
          title, slug, subtitle, type, category, publication_date, authors,
          abstract, description, download_url, image_url, tags, pages,
          language, featured, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `;
      
      const values = [
        publication.title, publication.slug, publication.subtitle, publication.type,
        publication.category, publication.publicationDate, publication.authors,
        publication.abstract, publication.description, publication.downloadUrl,
        publication.imageUrl, publication.tags, publication.pages, publication.language,
        publication.featured, publication.isPublic
      ];
      
      await pool.query(query, values);
      console.log(`  ✓ ${publication.title}`);
    }
    console.log(`  📚 Successfully seeded ${publications.length} publications!\n`);
    
    // Seed News
    console.log('📰 Seeding News Articles...');
    await pool.query('DELETE FROM news');
    
    for (const article of news) {
      const query = `
        INSERT INTO news (
          title, slug, excerpt, content, author, category, publication_date,
          image_url, tags, featured, is_published, views
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;
      
      const values = [
        article.title, article.slug, article.excerpt, article.content,
        article.author, article.category, article.publicationDate,
        article.imageUrl, article.tags, article.featured, article.isPublished,
        article.views
      ];
      
      await pool.query(query, values);
      console.log(`  ✓ ${article.title}`);
    }
    console.log(`  📰 Successfully seeded ${news.length} news articles!\n`);

    console.log('📝 Seeding Blog Posts...');
    await pool.query('DELETE FROM blog_posts');

    for (const post of blogs) {
      const query = `
        INSERT INTO blog_posts (
          title, slug, excerpt, content, image, publish_date,
          author_name, author_title, author_avatar,
          category, tags, status, featured, read_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `;

      const values = [
        post.title,
        post.slug,
        post.excerpt,
        post.content,
        post.image,
        post.publishDate,
        post.authorName,
        post.authorTitle,
        post.authorAvatar,
        post.category,
        JSON.stringify(post.tags),
        post.status,
        post.featured,
        post.readTime
      ];

      await pool.query(query, values);
      console.log(`  ✓ ${post.title}`);
    }
    console.log(`  📝 Successfully seeded ${blogs.length} blog posts!\n`);
    
    console.log('🎉 All content seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Publications: ${publications.length}`);
    console.log(`  - News Articles: ${news.length}`);
    console.log(`  - Blog Posts: ${blogs.length}`);
    console.log('\n✅ Database is now fully populated with sample content!');
    
  } catch (error) {
    console.error('❌ Error seeding content:', error);
  } finally {
    await pool.end();
  }
}

seedAllContent();
