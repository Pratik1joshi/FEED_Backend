const { query } = require('../config/database');

const createUpdateTimestampFunction = async () => {
  await query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);
};

const createUpdatedAtTrigger = async (tableName) => {
  const triggerName = `update_${tableName}_updated_at`;

  await query(`
    DROP TRIGGER IF EXISTS ${triggerName} ON ${tableName};
    CREATE TRIGGER ${triggerName}
      BEFORE UPDATE ON ${tableName}
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
};

const createTables = async () => {
  console.log('Creating unified latest database schema...');

  try {
    await createUpdateTimestampFunction();

    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS timeline (
        id SERIAL PRIMARY KEY,
        year VARCHAR(10) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50) NOT NULL DEFAULT 'Flag' CHECK (
          icon IN (
            'Flag', 'Award', 'Heart', 'FileText', 'Building', 'Globe',
            'Users', 'Target', 'MapPin', 'TrendingUp', 'Star', 'Lightbulb',
            'Zap', 'Leaf', 'BookOpen'
          )
        ),
        category VARCHAR(50) NOT NULL CHECK (
          category IN (
            'Milestone', 'Funding', 'Partnership', 'Policy',
            'Infrastructure', 'Achievement', 'Research', 'Community',
            'Technology', 'Award', 'Expansion', 'Innovation'
          )
        ),
        featured BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY,
        organization_name VARCHAR(255) DEFAULT 'FEED',
        tagline TEXT DEFAULT 'Forum for Energy and Environment Development',
        footer_description TEXT,
        contact_heading VARCHAR(255) DEFAULT 'Get In Touch',
        contact_description TEXT,
        newsletter_title VARCHAR(255) DEFAULT 'Stay in the Loop',
        newsletter_description TEXT,
        address TEXT,
        city VARCHAR(120),
        country VARCHAR(120),
        phone_primary VARCHAR(50),
        phone_secondary VARCHAR(50),
        email_primary VARCHAR(255),
        email_secondary VARCHAR(255),
        facebook_url TEXT,
        twitter_url TEXT,
        linkedin_url TEXT,
        instagram_url TEXT,
        youtube_url TEXT,
        map_url TEXT,
        mail_from_name VARCHAR(255) DEFAULT 'FEED Website',
        mail_from_email VARCHAR(255),
        smtp_host VARCHAR(255),
        smtp_port VARCHAR(20) DEFAULT '587',
        smtp_secure VARCHAR(10) DEFAULT 'false',
        smtp_user VARCHAR(255),
        smtp_password TEXT,
        contact_form_recipient_email VARCHAR(255),
        newsletter_recipient_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      INSERT INTO site_settings (
        id,
        organization_name,
        tagline,
        footer_description,
        contact_heading,
        contact_description,
        newsletter_title,
        newsletter_description,
        address,
        city,
        country,
        phone_primary,
        phone_secondary,
        email_primary,
        email_secondary,
        facebook_url,
        twitter_url,
        linkedin_url,
        instagram_url,
        youtube_url,
        map_url,
        mail_from_name,
        mail_from_email,
        smtp_host,
        smtp_port,
        smtp_secure,
        smtp_user,
        smtp_password,
        contact_form_recipient_email,
        newsletter_recipient_email
      )
      VALUES (
        1,
        'FEED',
        'Forum for Energy and Environment Development',
        'Forum for Energy and Environment Development works toward practical, research-driven solutions for climate resilience, energy access, and sustainable development in Nepal.',
        'Get In Touch',
        'Have questions or want to collaborate? Reach out to our team and we''ll get back to you as soon as possible.',
        'Stay in the Loop',
        'Get research highlights, project updates, event announcements, and sustainable development insights delivered directly to your inbox.',
        'Kathmandu, Nepal',
        'Kathmandu',
        'Nepal',
        '+977-1-XXXXXXX',
        '',
        'info@feed.org.np',
        'support@feed.org.np',
        '',
        '',
        '',
        '',
        '',
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.9638655399463!2d85.30972257615835!3d27.687511676193928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19bca03b6dd5%3A0x4f3b7763d3a0b37f!2sFEED%20Pvt.%20Ltd.!5e0!3m2!1sen!2snp!4v1748843024752!5m2!1sen!2snp',
        'FEED Website',
        '',
        '',
        '587',
        'false',
        '',
        '',
        '',
        ''
      )
      ON CONFLICT (id) DO NOTHING
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
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
        long_description TEXT,
        features JSONB DEFAULT '[]',
        case_studies JSONB DEFAULT '[]',
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        full_description TEXT,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS publications (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS press_releases (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
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
        status VARCHAR(20) DEFAULT 'draft' CHECK (
          status IN ('draft', 'published', 'scheduled', 'archived')
        ),
        featured BOOLEAN DEFAULT false,
        read_time VARCHAR(20),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255),
        subtitle VARCHAR(500),
        content TEXT,
        image_url VARCHAR(255),
        meta_data JSONB DEFAULT '{}',
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS awards (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS admin_password_resets (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        token_hash VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS mail_from_name VARCHAR(255) DEFAULT 'FEED Website',
      ADD COLUMN IF NOT EXISTS mail_from_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255),
      ADD COLUMN IF NOT EXISTS smtp_port VARCHAR(20) DEFAULT '587',
      ADD COLUMN IF NOT EXISTS smtp_secure VARCHAR(10) DEFAULT 'false',
      ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255),
      ADD COLUMN IF NOT EXISTS smtp_password TEXT,
      ADD COLUMN IF NOT EXISTS contact_form_recipient_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS newsletter_recipient_email VARCHAR(255)
    `);

    await query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS long_description TEXT,
      ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS case_studies JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS image VARCHAR(500)
    `);

    await query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS full_description TEXT,
      ADD COLUMN IF NOT EXISTS sector VARCHAR(100)
    `);

    await query(`
      UPDATE projects
      SET full_description = description,
          description = COALESCE(excerpt, substring(description, 1, 200) || '...')
      WHERE full_description IS NULL
    `);

    await query(`
      ALTER TABLE team_members
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255)
    `);

    await query(`
      UPDATE team_members
      SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', ''))
      WHERE slug IS NULL
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_admin_password_resets_admin_id ON admin_password_resets(admin_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_admin_password_resets_expires_at ON admin_password_resets(expires_at);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_timeline_year ON timeline(year);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_timeline_featured ON timeline(featured);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_timeline_category ON timeline(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_timeline_active ON timeline(is_active);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_services_featured ON services(featured);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_services_long_description ON services USING gin(to_tsvector('english', long_description));`);
    await query(`CREATE INDEX IF NOT EXISTS idx_services_features ON services USING gin(features);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_services_case_studies ON services USING gin(case_studies);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_province ON projects(province);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_team_slug ON team_members(slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_team_active ON team_members(is_active);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_team_department ON team_members(department);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_team_sort_order ON team_members(sort_order);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_publications_slug ON publications(slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_publications_type ON publications(type);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_publications_category ON publications(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_publications_featured ON publications(featured);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_publications_public ON publications(is_public);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_publications_date ON publications(publication_date);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_news_featured ON news(featured);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_news_date ON news(publication_date);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_press_slug ON press_releases(slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_press_published ON press_releases(is_published);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_press_date ON press_releases(release_date);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON blog_posts(publish_date);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery(featured);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_gallery_project_id ON gallery(project_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_gallery_event_id ON gallery(event_id);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(featured);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_videos_active ON videos(is_active);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_videos_project_id ON videos(project_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_videos_event_id ON videos(event_id);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_awards_date ON awards(award_date);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_awards_featured ON awards(featured);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_awards_category ON awards(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_awards_recognition_level ON awards(recognition_level);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_awards_project_id ON awards(project_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_awards_team_member_id ON awards(team_member_id);`);

    const tablesWithUpdatedAt = [
      'admins',
      'timeline',
      'site_settings',
      'services',
      'projects',
      'team_members',
      'events',
      'publications',
      'news',
      'press_releases',
      'blog_posts',
      'pages',
      'gallery',
      'videos',
      'awards',
    ];

    for (const tableName of tablesWithUpdatedAt) {
      await createUpdatedAtTrigger(tableName);
    }

    console.log('Unified latest schema created successfully.');
  } catch (error) {
    console.error('Error creating unified latest schema:', error);
    throw error;
  }
};

const dropTables = async () => {
  console.log('Dropping unified latest database schema...');

  try {
    await query('DROP TABLE IF EXISTS admin_password_resets CASCADE');
    await query('DROP TABLE IF EXISTS awards CASCADE');
    await query('DROP TABLE IF EXISTS videos CASCADE');
    await query('DROP TABLE IF EXISTS gallery CASCADE');
    await query('DROP TABLE IF EXISTS pages CASCADE');
    await query('DROP TABLE IF EXISTS blog_posts CASCADE');
    await query('DROP TABLE IF EXISTS press_releases CASCADE');
    await query('DROP TABLE IF EXISTS news CASCADE');
    await query('DROP TABLE IF EXISTS publications CASCADE');
    await query('DROP TABLE IF EXISTS events CASCADE');
    await query('DROP TABLE IF EXISTS team_members CASCADE');
    await query('DROP TABLE IF EXISTS projects CASCADE');
    await query('DROP TABLE IF EXISTS services CASCADE');
    await query('DROP TABLE IF EXISTS timeline CASCADE');
    await query('DROP TABLE IF EXISTS site_settings CASCADE');
    await query('DROP TABLE IF EXISTS admins CASCADE');
    await query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');

    console.log('Unified latest schema dropped successfully.');
  } catch (error) {
    console.error('Error dropping unified latest schema:', error);
    throw error;
  }
};

module.exports = {
  createTables,
  dropTables,
};
