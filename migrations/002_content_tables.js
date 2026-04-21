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
    // Services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        icon VARCHAR(100),
        service_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        meta_title VARCHAR(255),
        meta_description TEXT,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        excerpt TEXT,
        category VARCHAR(100) NOT NULL,
        sector VARCHAR(100),
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
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Team members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        bio TEXT,
        expertise JSONB DEFAULT '[]',
        education JSONB DEFAULT '[]',
        image_url VARCHAR(500),
        email VARCHAR(255),
        linkedin VARCHAR(500),
        publications INTEGER DEFAULT 0,
        years_experience INTEGER DEFAULT 0,
        languages JSONB DEFAULT '[]',
        awards JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        subtitle VARCHAR(255),
        description TEXT NOT NULL,
        full_description TEXT,
        event_date DATE NOT NULL,
        end_date DATE,
        event_time VARCHAR(100),
        location VARCHAR(255) NOT NULL,
        venue VARCHAR(255),
        organizer VARCHAR(255),
        category VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'upcoming',
        capacity INTEGER,
        registered_attendees INTEGER DEFAULT 0,
        ticket_price VARCHAR(100),
        images JSONB DEFAULT '[]',
        speakers JSONB DEFAULT '[]',
        agenda JSONB DEFAULT '[]',
        registration_url VARCHAR(500),
        contact_info JSONB DEFAULT '{}',
        featured BOOLEAN DEFAULT false,
        tags JSONB DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Publications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS publications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        subtitle VARCHAR(255),
        type VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        publication_date DATE NOT NULL,
        authors JSONB DEFAULT '[]',
        abstract TEXT,
        description TEXT,
        full_content TEXT,
        download_url VARCHAR(500),
        image_url VARCHAR(500),
        tags JSONB DEFAULT '[]',
        pages INTEGER,
        language VARCHAR(50) DEFAULT 'English',
        doi VARCHAR(255),
        citations INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // News/Blog table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        author VARCHAR(255),
        category VARCHAR(100) DEFAULT 'News',
        publication_date DATE NOT NULL,
        image_url VARCHAR(500),
        images JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        featured BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT true,
        views INTEGER DEFAULT 0,
        meta_title VARCHAR(255),
        meta_description TEXT,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Gallery table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        category VARCHAR(100) DEFAULT 'General',
        project_id INTEGER REFERENCES projects(id),
        event_id INTEGER REFERENCES events(id),
        alt_text VARCHAR(255),
        photographer VARCHAR(255),
        location VARCHAR(255),
        taken_date DATE,
        tags JSONB DEFAULT '[]',
        featured BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Videos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        duration VARCHAR(50),
        category VARCHAR(100) DEFAULT 'General',
        project_id INTEGER REFERENCES projects(id),
        event_id INTEGER REFERENCES events(id),
        youtube_id VARCHAR(100),
        vimeo_id VARCHAR(100),
        tags JSONB DEFAULT '[]',
        featured BOOLEAN DEFAULT false,
        views INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Awards table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        awarding_organization VARCHAR(255) NOT NULL,
        award_date DATE NOT NULL,
        category VARCHAR(100),
        project_id INTEGER REFERENCES projects(id),
        team_member_id INTEGER REFERENCES team_members(id),
        image_url VARCHAR(500),
        certificate_url VARCHAR(500),
        recognition_level VARCHAR(100),
        featured BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    // Press releases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS press_releases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        release_date DATE NOT NULL,
        contact_person VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        images JSONB DEFAULT '[]',
        attachments JSONB DEFAULT '[]',
        is_published BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      );
    `);

    console.log('All content tables created successfully');
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
