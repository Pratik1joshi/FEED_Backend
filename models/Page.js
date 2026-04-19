const { pool } = require('../config/database');

class Page {
  static async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM pages WHERE slug = $1', [slug]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM pages ORDER BY id ASC');
    return result.rows;
  }

  static async update(slug, data) {
    const { title, subtitle, content, image_url, meta_data, is_published } = data;
    
    const result = await pool.query(
      `INSERT INTO pages (slug, title, subtitle, content, image_url, meta_data, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (slug)
       DO UPDATE SET
         title = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         content = EXCLUDED.content,
         image_url = EXCLUDED.image_url,
         meta_data = EXCLUDED.meta_data,
         is_published = EXCLUDED.is_published,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [slug, title, subtitle, content, image_url, meta_data || {}, is_published ?? true]
    );
    return result.rows[0];
  }
}

module.exports = Page;
