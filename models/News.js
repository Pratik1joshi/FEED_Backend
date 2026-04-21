const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = ['publication_date', 'created_at', 'updated_at', 'title', 'views', 'featured'];
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'slug',
  'excerpt',
  'content',
  'author',
  'category',
  'publication_date',
  'image_url',
  'images',
  'tags',
  'featured',
  'is_published',
  'views',
  'meta_title',
  'meta_description',
];

class News {
  static async create(newsData) {
    const {
      title, slug, excerpt, content, author, category = 'News',
      publication_date, image_url, images = [], tags = [],
      featured = false, is_published = true, views = 0,
      meta_title, meta_description
    } = newsData;
    
    const result = await pool.query(
      `INSERT INTO news (title, slug, excerpt, content, author, category, 
       publication_date, image_url, images, tags, featured, is_published, 
       views, meta_title, meta_description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       `,
      [title, slug, excerpt, content, author, category, publication_date,
       image_url, JSON.stringify(images), JSON.stringify(tags), featured,
       is_published, views, meta_title, meta_description]
    );
    
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { 
      category, featured, is_published, limit, offset, 
      sortBy = 'publication_date', sortOrder = 'DESC' 
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'publication_date',
      defaultSortOrder: 'DESC',
    });
    
    let query = 'SELECT * FROM news WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      params.push(featured);
    }

    if (is_published !== undefined) {
      paramCount++;
      query += ` AND is_published = $${paramCount}`;
      params.push(is_published);
    }

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
    }

    if (offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
    if (result.rows[0]) {
      // Increment views
      await pool.query('UPDATE news SET views = views + 1 WHERE id = $1', [id]);
      result.rows[0].views = (result.rows[0].views || 0) + 1;
    }
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM news WHERE slug = $1', [slug]);
    if (result.rows[0]) {
      // Increment views
      await pool.query('UPDATE news SET views = views + 1 WHERE slug = $1', [slug]);
      result.rows[0].views = (result.rows[0].views || 0) + 1;
    }
    return result.rows[0];
  }

  static async findByCategory(category, options = {}) {
    const { limit = 10, offset = 0 } = options;
    
    const result = await pool.query(
      'SELECT * FROM news WHERE category = $1 AND is_published = true ORDER BY publication_date DESC LIMIT $2 OFFSET $3',
      [category, limit, offset]
    );
    
    return result.rows;
  }

  static async findFeatured(limit = 5) {
    const result = await pool.query(
      'SELECT * FROM news WHERE featured = true AND is_published = true ORDER BY publication_date DESC LIMIT $1',
      [limit]
    );
    
    return result.rows;
  }

  static async findRecent(limit = 10) {
    const result = await pool.query(
      'SELECT * FROM news WHERE is_published = true ORDER BY publication_date DESC LIMIT $1',
      [limit]
    );
    
    return result.rows;
  }

  static async findPopular(limit = 10) {
    const result = await pool.query(
      'SELECT * FROM news WHERE is_published = true ORDER BY views DESC, publication_date DESC LIMIT $1',
      [limit]
    );
    
    return result.rows;
  }

  static async update(id, newsData) {
    const safeNewsData = pickAllowedFields(newsData, ALLOWED_UPDATE_FIELDS);
    const fields = Object.keys(safeNewsData);
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const values = Object.values(safeNewsData).map(value => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);
    
    const result = await pool.query(
      `UPDATE news SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${values.length} `,
      values
    );
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM news WHERE id = $1 ', [id]);
    return result.rows[0];
  }

  static async search(searchTerm, options = {}) {
    const { category, limit = 20, offset = 0 } = options;
    
    let query = `
      SELECT * FROM news 
      WHERE (title LIKE $1 OR excerpt LIKE $1 OR content LIKE $1)
      AND is_published = true
    `;
    const params = [`%${searchTerm}%`];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    query += `
      ORDER BY 
        CASE WHEN title LIKE $1 THEN 1
             WHEN excerpt LIKE $1 THEN 2
             ELSE 3 END,
        publication_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getCount(options = {}) {
    const { category, featured, is_published } = options;
    
    let query = 'SELECT COUNT(*) FROM news WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      params.push(featured);
    }

    if (is_published !== undefined) {
      paramCount++;
      query += ` AND is_published = $${paramCount}`;
      params.push(is_published);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = News;
