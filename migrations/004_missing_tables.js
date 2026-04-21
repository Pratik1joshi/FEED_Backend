const { Pool } = require('pg');

const runMigration = async () => {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'mydb',
    password: process.env.DB_PASSWORD || 'pass123',
    port: process.env.DB_PORT || 5432,
  });

  try {
    // Timeline table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        year INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(100) DEFAULT 'Flag',
        category VARCHAR(100),
        featured BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Blog table (if needed for blog functionality)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        featured_image VARCHAR(500),
        author_name VARCHAR(255),
        author_bio TEXT,
        author_avatar VARCHAR(500),
        category VARCHAR(100) DEFAULT 'General',
        tags JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'draft',
        publication_date DATE,
        read_time INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT false,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_keywords JSONB DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_timeline_year ON timeline(year);
      CREATE INDEX IF NOT EXISTS idx_timeline_category ON timeline(category);
      CREATE INDEX IF NOT EXISTS idx_timeline_featured ON timeline(featured);
      CREATE INDEX IF NOT EXISTS idx_timeline_active ON timeline(is_active);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog(slug);
      CREATE INDEX IF NOT EXISTS idx_blog_category ON blog(category);
      CREATE INDEX IF NOT EXISTS idx_blog_status ON blog(status);
      CREATE INDEX IF NOT EXISTS idx_blog_published ON blog(is_published);
      CREATE INDEX IF NOT EXISTS idx_blog_featured ON blog(featured);
      CREATE INDEX IF NOT EXISTS idx_blog_publication_date ON blog(publication_date);
    `);

    console.log('Timeline and Blog tables created successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
};

module.exports = runMigration;

// Run migration if called directly
if (require.main === module) {
  runMigration();
}
