const { pool } = require('../config/database');

const SETTINGS_FIELDS = [
  'organization_name',
  'tagline',
  'footer_description',
  'contact_heading',
  'contact_description',
  'newsletter_title',
  'newsletter_description',
  'address',
  'city',
  'country',
  'phone_primary',
  'phone_secondary',
  'email_primary',
  'email_secondary',
  'facebook_url',
  'twitter_url',
  'linkedin_url',
  'instagram_url',
  'youtube_url',
  'map_url',
  'mail_from_name',
  'mail_from_email',
  'smtp_host',
  'smtp_port',
  'smtp_secure',
  'smtp_user',
  'smtp_password',
  'contact_form_recipient_email',
  'newsletter_recipient_email',
]

const DEFAULT_SETTINGS = {
  id: 1,
  organization_name: 'FEED',
  tagline: 'Forum for Energy and Environment Development',
  footer_description:
    'Forum for Energy and Environment Development works toward practical, research-driven solutions for climate resilience, energy access, and sustainable development in Nepal.',
  contact_heading: 'Get In Touch',
  contact_description:
    "Have questions or want to collaborate? Reach out to our team and we'll get back to you as soon as possible.",
  newsletter_title: 'Stay in the Loop',
  newsletter_description:
    'Get research highlights, project updates, event announcements, and sustainable development insights delivered directly to your inbox.',
  address: 'Kathmandu, Nepal',
  city: 'Kathmandu',
  country: 'Nepal',
  phone_primary: '+977-1-XXXXXXX',
  phone_secondary: '',
  email_primary: 'info@feed.org.np',
  email_secondary: 'support@feed.org.np',
  facebook_url: '',
  twitter_url: '',
  linkedin_url: '',
  instagram_url: '',
  youtube_url: '',
  map_url:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.9638655399463!2d85.30972257615835!3d27.687511676193928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19bca03b6dd5%3A0x4f3b7763d3a0b37f!2sFEED%20Pvt.%20Ltd.!5e0!3m2!1sen!2snp!4v1748843024752!5m2!1sen!2snp',
  mail_from_name: 'FEED Website',
  mail_from_email: '',
  smtp_host: '',
  smtp_port: '587',
  smtp_secure: 'false',
  smtp_user: '',
  smtp_password: '',
  contact_form_recipient_email: '',
  newsletter_recipient_email: '',
}

const pickSettings = (data = {}) => {
  const settings = {}

  SETTINGS_FIELDS.forEach((field) => {
    if (data[field] !== undefined) {
      settings[field] = data[field]
    }
  })

  return settings
}

const mergeSettings = (settings = {}) => ({
  ...DEFAULT_SETTINGS,
  ...settings,
})

class SiteSettings {
  static async ensureTableExists() {
    await pool.query(`
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
    `)

    await pool.query(`
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
    `)
  }

  static async createDefaultSettings() {
    await this.ensureTableExists()
    return this.upsertSettings(DEFAULT_SETTINGS)
  }

  static async getSettings() {
    await this.ensureTableExists()
    const result = await pool.query('SELECT * FROM site_settings WHERE id = 1 LIMIT 1')

    if (result.rows[0]) {
      return mergeSettings(result.rows[0])
    }

    const created = await this.createDefaultSettings()
    return mergeSettings(created)
  }

  static async upsertSettings(settingsData) {
    await this.ensureTableExists()
    const settings = mergeSettings({
      ...DEFAULT_SETTINGS,
      ...pickSettings(settingsData),
    })

    const insertFields = ['id', ...SETTINGS_FIELDS]
    const values = [1]
    SETTINGS_FIELDS.forEach((field) => {
      values.push(settings[field] ?? '')
    })

    const placeholders = insertFields.map((_, index) => `$${index + 1}`)
    const updateClause = SETTINGS_FIELDS.map((field) => `${field} = EXCLUDED.${field}`).join(', ')

    const result = await pool.query(
      `
        INSERT INTO site_settings (${insertFields.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT (id) DO UPDATE SET
          ${updateClause},
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `,
      values
    )

    return mergeSettings(result.rows[0])
  }

  static async updateSettings(settingsData) {
    const currentSettings = await this.getSettings()
    return this.upsertSettings({
      ...currentSettings,
      ...pickSettings(settingsData),
    })
  }
}

module.exports = SiteSettings
