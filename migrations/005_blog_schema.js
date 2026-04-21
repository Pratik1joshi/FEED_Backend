// Migration: Add blog_posts table
// File: 005_blog_schema.js

const { Pool } = require('pg');

const migration = {
  up: async (db) => {
    // Create blog_posts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        image VARCHAR(1000),
        publish_date DATETIME DEFAULT CURRENT_DATETIME,
        author_name VARCHAR(200),
        author_title VARCHAR(200),
        author_avatar VARCHAR(1000),
        category VARCHAR(100),
        tags TEXT,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
        featured BOOLEAN DEFAULT false,
        read_time VARCHAR(20),
        views INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON blog_posts(publish_date);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
    `);

    console.log('Blog posts table created successfully');
  },

  down: async (db) => {
    await db.query('DROP TABLE IF EXISTS blog_posts CASCADE;');
    console.log('Blog posts table dropped successfully');
  }
};

module.exports = migration;
