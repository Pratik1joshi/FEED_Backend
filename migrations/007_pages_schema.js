const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255),
        subtitle VARCHAR(500),
        content TEXT,
        image_url VARCHAR(255),
        meta_data JSONB DEFAULT '{}',
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_DATETIME,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_DATETIME
      )
    `);

    const initialPages = [
      { slug: 'hero-section', title: 'Homepage Hero', subtitle: 'Main video and hero copy' },
      { slug: 'about-section', title: 'About Us', subtitle: 'Who we are' },
      { slug: 'services-section', title: 'Services Section', subtitle: 'Homepage services content block' },
      { slug: 'events-section', title: 'Events Section', subtitle: 'Homepage events content block' },
      { slug: 'media-section', title: 'Media Section', subtitle: 'Homepage media content block' },
      { slug: 'publications-section', title: 'Publications Section', subtitle: 'Homepage publications content block' },
      { slug: 'timeline-section', title: 'Timeline Section', subtitle: 'Homepage timeline content block' },
      { slug: 'working-areas-section', title: 'Working Areas Section', subtitle: 'Homepage working areas map content block' },
      { slug: 'contact-section', title: 'Contact Section', subtitle: 'Homepage contact content block' },
      { slug: 'newsletter-section', title: 'Newsletter Section', subtitle: 'Homepage newsletter content block' },
      { slug: 'about-page', title: 'Detailed About Page', subtitle: 'Our history and mission' },
      { slug: 'work-with-us', title: 'Work With Us', subtitle: 'Join our team' },
      { slug: 'know-us', title: 'Know Us Better', subtitle: 'Our vision' },
      { slug: 'projects-section', title: 'Projects Section', subtitle: 'Homepage project showcase content' }
    ];

    for (const page of initialPages) {
      await client.query(
        `INSERT INTO pages (slug, title, subtitle, content) 
         VALUES ($1, $2, $3, '') 
         ON CONFLICT (slug) DO NOTHING`,
        [page.slug, page.title, page.subtitle]
      );
    }

    await client.query('COMMIT');
    console.log('Pages migration complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Pages migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
