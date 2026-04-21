const { Pool } = require('pg');

const migrations = [
  {
    name: 'create_awards_table',
    up: `
      CREATE TABLE IF NOT EXISTS awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        description TEXT,
        year INTEGER NOT NULL,
        category VARCHAR(50) DEFAULT 'recognition' 
          CHECK (category IN ('recognition', 'certification', 'achievement', 'partnership', 'excellence')),
        status VARCHAR(20) DEFAULT 'received' 
          CHECK (status IN ('received', 'nominated', 'pending')),
        image_url VARCHAR(500),
        certificate_url VARCHAR(500),
        featured BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
      
      CREATE INDEX IF NOT EXISTS idx_awards_category ON awards(category);
      CREATE INDEX IF NOT EXISTS idx_awards_year ON awards(year);
      CREATE INDEX IF NOT EXISTS idx_awards_featured ON awards(featured);
    `
  },
  {
    name: 'create_gallery_table',
    up: `
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        category VARCHAR(100),
        tags JSONB DEFAULT '[]',
        date_taken DATE,
        location VARCHAR(255),
        photographer VARCHAR(255),
        featured BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
      
      CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
      CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery(featured);
      CREATE INDEX IF NOT EXISTS idx_gallery_date_taken ON gallery(date_taken);
    `
  },
  {
    name: 'create_videos_table',
    up: `
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        slug VARCHAR(255) UNIQUE,
        category VARCHAR(100),
        duration VARCHAR(20),
        tags JSONB DEFAULT '[]',
        publish_date DATETIME DEFAULT CURRENT_DATETIME,
        featured BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
      
      CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
      CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(featured);
      CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published);
      CREATE INDEX IF NOT EXISTS idx_videos_publish_date ON videos(publish_date);
    `
  },
  {
    name: 'create_press_table',
    up: `
      CREATE TABLE IF NOT EXISTS press (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content TEXT,
        image_url VARCHAR(500),
        slug VARCHAR(255) UNIQUE,
        category VARCHAR(100),
        tags JSONB DEFAULT '[]',
        publish_date DATETIME DEFAULT CURRENT_DATETIME,
        download_url VARCHAR(500),
        featured BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
      
      CREATE INDEX IF NOT EXISTS idx_press_category ON press(category);
      CREATE INDEX IF NOT EXISTS idx_press_featured ON press(featured);
      CREATE INDEX IF NOT EXISTS idx_press_published ON press(is_published);
      CREATE INDEX IF NOT EXISTS idx_press_publish_date ON press(publish_date);
    `
  }
];

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:pass123@localhost:5432/mydb',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Running media content migrations...');

    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      await pool.query(migration.up);
      console.log(`✓ ${migration.name} completed`);
    }

    console.log('All media content migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().catch(console.error);
}

module.exports = { runMigrations, migrations };
