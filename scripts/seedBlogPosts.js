const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mydb',
  password: process.env.DB_PASSWORD || 'pass123',
  port: process.env.DB_PORT || 5432,
});

const blogPosts = [
  {
    title: 'Community Solar Microgrids Are Changing Rural Nepal',
    slug: 'community-solar-microgrids-rural-nepal',
    excerpt: 'How locally owned solar systems are improving energy access, livelihoods, and resilience in off-grid communities.',
    content: '<p>Community-owned solar microgrids are proving to be one of the most effective ways to expand clean energy access in remote parts of Nepal. By keeping ownership local, communities retain control over pricing, maintenance, and long-term benefits.</p><h3>Why microgrids work</h3><p>Unlike large centralized systems, microgrids can be sized for actual local demand and expanded over time. That makes them practical for settlements that are far from the national grid and need reliable power for homes, schools, and small businesses.</p><p>FEED’s recent work shows that the strongest projects combine technical design with community governance and training. When local users are involved from the beginning, systems are more likely to stay operational and financially sustainable.</p><h3>The bigger impact</h3><p>Beyond electricity, these projects support better education, safer health services, and new income opportunities. They also reduce dependence on diesel and kerosene, which lowers household costs and emissions.</p>',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=500&fit=crop',
    publish_date: '2025-03-18',
    author_name: 'Eng. Ram Prasad Shrestha',
    author_title: 'Technical Director',
    author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    category: 'Energy',
    tags: JSON.stringify(['Solar Energy', 'Microgrids', 'Rural Development', 'Community Ownership']),
    status: 'published',
    featured: true,
    read_time: '4 min read'
  },
  {
    title: 'Why Community-Led Climate Adaptation Outperforms Top-Down Models',
    slug: 'community-led-climate-adaptation-models',
    excerpt: 'Local knowledge, local ownership, and local action consistently deliver stronger adaptation outcomes.',
    content: '<p>Community-led climate adaptation is not just a philosophy. It is a practical model that consistently delivers better results because it starts with local realities instead of assumptions made far away.</p><h3>Local knowledge matters</h3><p>Communities know which slopes are unstable, which water sources fail in dry seasons, and which households are most exposed. That knowledge is essential when designing adaptation measures that actually work.</p><p>Projects that include community members in planning and monitoring also build trust faster and create a shared sense of responsibility. That usually leads to better maintenance and stronger long-term outcomes.</p><h3>What the evidence shows</h3><p>Across FEED’s field work, the most successful adaptation projects are those that combine scientific analysis with participatory design. The result is not only more resilient infrastructure, but also more resilient institutions and social networks.</p>',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=500&fit=crop',
    publish_date: '2025-02-10',
    author_name: 'Dr. Maria Rodriguez',
    author_title: 'Research Director',
    author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    category: 'Research',
    tags: JSON.stringify(['Climate Adaptation', 'Community Development', 'Resilience', 'Research']),
    status: 'published',
    featured: true,
    read_time: '5 min read'
  },
  {
    title: 'Young Leaders Are Rewriting the Climate Action Playbook',
    slug: 'young-leaders-climate-action-playbook',
    excerpt: 'FEED’s youth program is turning climate concern into practical leadership and local projects.',
    content: '<p>The most effective climate leaders in many communities are young people who are willing to challenge the old playbook and test new approaches. FEED’s youth program is built around that idea.</p><h3>Training that leads to action</h3><p>Participants do more than attend workshops. They design projects, work with communities, and learn how to turn climate ideas into real implementation plans.</p><p>Several graduates have already launched urban farming initiatives, awareness campaigns, and disaster preparedness programs in their own neighborhoods.</p><h3>Why it matters</h3><p>Climate change is a long-term challenge, but it also needs immediate leadership. Giving young people tools, mentorship, and a platform creates a pipeline of practical climate problem-solvers.</p>',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop',
    publish_date: '2025-01-15',
    author_name: 'Sita Pandey',
    author_title: 'Community Outreach Coordinator',
    author_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    category: 'Leadership',
    tags: JSON.stringify(['Youth', 'Leadership', 'Climate Action', 'Community']),
    status: 'published',
    featured: false,
    read_time: '4 min read'
  },
  {
    title: 'Measuring Real Impact in Community Climate Projects',
    slug: 'measuring-impact-community-climate-projects',
    excerpt: 'Good climate work needs good measurement: not just outputs, but lasting changes in resilience and livelihoods.',
    content: '<p>Impact measurement is often treated as a reporting exercise. In community climate projects, it should be much more than that. It should be a tool for learning, adapting, and improving outcomes.</p><h3>What to measure</h3><p>Project teams should look at environmental, social, and economic indicators together. A solar microgrid, for example, is not just about kilowatts. It is also about household savings, school study time, clinic reliability, and local ownership.</p><h3>Why it matters</h3><p>When communities can see the real effects of a project, they are more likely to support it, maintain it, and improve it over time. Good measurement strengthens accountability and helps successful models scale.</p>',
    image: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=500&fit=crop',
    publish_date: '2024-12-08',
    author_name: 'Dr. Aisha Patel',
    author_title: 'Monitoring & Evaluation Specialist',
    author_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    category: 'Evaluation',
    tags: JSON.stringify(['Impact Measurement', 'Evaluation', 'Climate Projects', 'Learning']),
    status: 'published',
    featured: false,
    read_time: '3 min read'
  }
];

async function seedBlogPosts() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        image VARCHAR(1000),
        publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        author_name VARCHAR(200),
        author_title VARCHAR(200),
        author_avatar VARCHAR(1000),
        category VARCHAR(100),
        tags TEXT,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
        featured BOOLEAN DEFAULT false,
        read_time VARCHAR(20),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('DELETE FROM blog_posts');

    for (const post of blogPosts) {
      await client.query(
        `INSERT INTO blog_posts (
          title, slug, excerpt, content, image, publish_date,
          author_name, author_title, author_avatar,
          category, tags, status, featured, read_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          post.title,
          post.slug,
          post.excerpt,
          post.content,
          post.image,
          post.publish_date,
          post.author_name,
          post.author_title,
          post.author_avatar,
          post.category,
          post.tags,
          post.status,
          post.featured,
          post.read_time
        ]
      );
      console.log(`Seeded blog post: ${post.title}`);
    }

    console.log(`\nCompleted: ${blogPosts.length} sample blog posts inserted.`);
  } catch (error) {
    console.error('Failed to seed blog posts:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedBlogPosts()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedBlogPosts };
