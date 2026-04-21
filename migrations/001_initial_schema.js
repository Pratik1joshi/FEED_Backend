const { query } = require('../config/database');

const createTables = async () => {
  console.log('🔧 Creating database tables...');

  try {
    // Create admins table
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
        is_active BOOLEAN DEFAULT true,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      )
    `);
    console.log('✅ Admins table created');

    // Create timeline table
    await query(`
      CREATE TABLE IF NOT EXISTS timeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        year VARCHAR(10) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50) NOT NULL DEFAULT 'Flag' CHECK (
          icon IN ('Flag', 'Award', 'Heart', 'FileText', 'Building', 'Globe', 
                  'Users', 'Target', 'MapPin', 'TrendingUp', 'Star', 'Lightbulb', 
                  'Zap', 'Leaf', 'BookOpen')
        ),
        category VARCHAR(50) NOT NULL CHECK (
          category IN ('Milestone', 'Funding', 'Partnership', 'Policy', 
                      'Infrastructure', 'Achievement', 'Research', 'Community', 
                      'Technology', 'Award', 'Expansion', 'Innovation')
        ),
        featured BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      )
    `);
    console.log('✅ Timeline table created');

    // Create site settings table
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
        created_at DATETIME DEFAULT CURRENT_DATETIME,
        updated_at DATETIME DEFAULT CURRENT_DATETIME
      )
    `);
    console.log('✅ Site settings table created');

    await query(`
      INSERT INTO site_settings (
        id, organization_name, tagline, footer_description, contact_heading, contact_description,
        newsletter_title, newsletter_description, address, city, country, phone_primary,
        phone_secondary, email_primary, email_secondary, facebook_url, twitter_url,
        linkedin_url, instagram_url, youtube_url, map_url, mail_from_name,
        mail_from_email, smtp_host, smtp_port, smtp_secure, smtp_user,
        smtp_password, contact_form_recipient_email, newsletter_recipient_email
      )
      VALUES (
        1,
        'FEED',
        'Forum for Energy and Environment Development',
        'Forum for Energy and Environment Development works toward practical, research-driven solutions for climate resilience, energy access, and sustainable development in Nepal.',
        'Get In Touch',
        'Have questions or want to collaborate? Reach out to our team and we\'ll get back to you as soon as possible.',
        'Stay in the Loop',
        'Get research highlights, project updates, event announcements, and sustainable development insights delivered directly to your inbox.',
        'Kathmandu, Nepal',
        'Kathmandu',
        'Nepal',
        '+977-1-XXXXXXX',
        NULL,
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
    console.log('✅ Site settings seed row created');

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_timeline_year ON timeline(year);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_timeline_featured ON timeline(featured);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_timeline_category ON timeline(category);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_timeline_active ON timeline(is_active);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active);
    `);
    console.log('✅ Database indexes created');

    

    await query(`
      DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
      CREATE TRIGGER update_admins_updated_at 
        BEFORE UPDATE ON admins 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_timeline_updated_at ON timeline;
      CREATE TRIGGER update_timeline_updated_at 
        BEFORE UPDATE ON timeline 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    await query(`
      DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
      CREATE TRIGGER update_site_settings_updated_at 
        BEFORE UPDATE ON site_settings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Database triggers created');

    console.log('🎉 Database schema created successfully!');
  } catch (error) {
    console.error('❌ Error creating database schema:', error);
    throw error;
  }
};

const dropTables = async () => {
  console.log('🗑️ Dropping database tables...');
  
  try {
    await query('DROP TABLE IF EXISTS timeline CASCADE');
    await query('DROP TABLE IF EXISTS site_settings CASCADE');
    await query('DROP TABLE IF EXISTS admins CASCADE');
    await query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
    console.log('✅ Tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  }
};

module.exports = {
  createTables,
  dropTables
};
