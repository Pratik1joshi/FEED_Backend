const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = ['publication_date', 'created_at', 'updated_at', 'title', 'downloads', 'citations', 'featured'];
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'slug',
  'subtitle',
  'type',
  'category',
  'publication_date',
  'authors',
  'abstract',
  'description',
  'full_content',
  'download_url',
  'image_url',
  'tags',
  'pages',
  'language',
  'doi',
  'citations',
  'downloads',
  'featured',
  'is_public',
];

class Publications {
  static async create(publicationData) {
    const {
      title, slug, subtitle, type, category, publication_date, authors = [],
      abstract, description, full_content, download_url, image_url, tags = [],
      pages, language = 'English', doi, citations = 0, downloads = 0,
      featured = false, is_public = true
    } = publicationData;
    
    const result = await pool.query(
      `INSERT INTO publications (title, slug, subtitle, type, category, publication_date, 
       authors, abstract, description, full_content, download_url, image_url, tags, 
       pages, language, doi, citations, downloads, featured, is_public) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) 
       RETURNING *`,
      [title, slug, subtitle, type, category, publication_date, JSON.stringify(authors),
       abstract, description, full_content, download_url, image_url, JSON.stringify(tags),
       pages, language, doi, citations, downloads, featured, is_public]
    );
    
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { 
      type, category, featured, is_public, limit, offset, 
      sortBy = 'publication_date', sortOrder = 'DESC' 
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'publication_date',
      defaultSortOrder: 'DESC',
    });
    
    let query = 'SELECT * FROM publications WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

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

    if (is_public !== undefined) {
      paramCount++;
      query += ` AND is_public = $${paramCount}`;
      params.push(is_public);
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
    const result = await pool.query('SELECT * FROM publications WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM publications WHERE slug = $1', [slug]);
    return result.rows[0];
  }

  static async findByType(type, options = {}) {
    const { limit = 10, offset = 0 } = options;
    
    const result = await pool.query(
      'SELECT * FROM publications WHERE type = $1 AND is_public = true ORDER BY publication_date DESC LIMIT $2 OFFSET $3',
      [type, limit, offset]
    );
    
    return result.rows;
  }

  static async findByCategory(category, options = {}) {
    const { limit = 10, offset = 0 } = options;
    
    const result = await pool.query(
      'SELECT * FROM publications WHERE category = $1 AND is_public = true ORDER BY publication_date DESC LIMIT $2 OFFSET $3',
      [category, limit, offset]
    );
    
    return result.rows;
  }

  static async findByAuthor(authorName, options = {}) {
    const { limit = 10, offset = 0 } = options;
    
    const result = await pool.query(
      `SELECT * FROM publications 
       WHERE authors::text ILIKE $1 AND is_public = true
       ORDER BY publication_date DESC 
       LIMIT $2 OFFSET $3`,
      [`%${authorName}%`, limit, offset]
    );
    
    return result.rows;
  }

  static async findByDateRange(startDate, endDate, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const result = await pool.query(
      `SELECT * FROM publications 
       WHERE publication_date BETWEEN $1 AND $2 AND is_public = true
       ORDER BY publication_date DESC 
       LIMIT $3 OFFSET $4`,
      [startDate, endDate, limit, offset]
    );
    
    return result.rows;
  }

  static async update(id, publicationData) {
    const safePublicationData = pickAllowedFields(publicationData, ALLOWED_UPDATE_FIELDS);
    const fields = Object.keys(safePublicationData);
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const values = Object.values(safePublicationData).map(value => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);
    
    const result = await pool.query(
      `UPDATE publications SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM publications WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async incrementDownload(id) {
    const result = await pool.query(
      'UPDATE publications SET downloads = downloads + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows[0];
  }

  static async updateCitations(id, citationCount) {
    const result = await pool.query(
      'UPDATE publications SET citations = $1 WHERE id = $2 RETURNING *',
      [citationCount, id]
    );
    
    return result.rows[0];
  }

  static async search(searchTerm, options = {}) {
    const { type, category, limit = 20, offset = 0 } = options;
    
    let query = `
      SELECT * FROM publications 
      WHERE (title ILIKE $1 OR abstract ILIKE $1 OR description ILIKE $1 OR authors::text ILIKE $1)
      AND is_public = true
    `;
    const params = [`%${searchTerm}%`];
    let paramCount = 1;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    query += `
      ORDER BY 
        CASE WHEN title ILIKE $1 THEN 1
             WHEN abstract ILIKE $1 THEN 2
             WHEN authors::text ILIKE $1 THEN 3
             ELSE 4 END,
        publication_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_publications,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_publications,
        COUNT(CASE WHEN is_public = true THEN 1 END) as public_publications,
        SUM(downloads) as total_downloads,
        SUM(citations) as total_citations,
        COUNT(DISTINCT type) as publication_types,
        COUNT(DISTINCT category) as categories
      FROM publications
    `);
    
    return result.rows[0];
  }

  static async getPopular(limit = 10) {
    const result = await pool.query(
      `SELECT * FROM publications 
       WHERE is_public = true
       ORDER BY (downloads * 0.7 + citations * 0.3) DESC, publication_date DESC 
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  }

  static async getRecent(limit = 10) {
    const result = await pool.query(
      'SELECT * FROM publications WHERE is_public = true ORDER BY publication_date DESC LIMIT $1',
      [limit]
    );
    
    return result.rows;
  }

  static async getCount(options = {}) {
    const { type, category, featured, is_public } = options;
    
    let query = 'SELECT COUNT(*) FROM publications WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

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

    if (is_public !== undefined) {
      paramCount++;
      query += ` AND is_public = $${paramCount}`;
      params.push(is_public);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Publications;
