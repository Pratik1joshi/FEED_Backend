const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = ['sort_order', 'created_at', 'updated_at', 'title', 'service_type', 'status', 'featured'];
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'slug',
  'description',
  'short_description',
  'icon',
  'service_type',
  'status',
  'featured',
  'sort_order',
  'meta_title',
  'meta_description',
  'long_description',
  'features',
  'case_studies',
  'image',
];

class Services {
  static async create(serviceData) {
    const {
      title, slug, description, short_description, icon, service_type, status = 'active',
      featured = false, sort_order = 0, meta_title, meta_description, long_description,
      features = [], case_studies = [], image
    } = serviceData;
    
    const result = await pool.query(
      `INSERT INTO services (title, slug, description, short_description, icon, service_type, 
       status, featured, sort_order, meta_title, meta_description, long_description, 
       features, case_studies, image) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       `,
      [title, slug, description, short_description, icon, service_type, status, featured, 
       sort_order, meta_title, meta_description, long_description, JSON.stringify(features), 
       JSON.stringify(case_studies), image]
    );
    
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { 
      status, featured, limit, offset, sortBy = 'sort_order', sortOrder = 'ASC' 
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'sort_order',
      defaultSortOrder: 'ASC',
    });
    
    let query = 'SELECT * FROM services WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      params.push(featured);
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
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM services WHERE slug = $1', [slug]);
    return result.rows[0];
  }

  static async update(id, serviceData) {
    const safeServiceData = pickAllowedFields(serviceData, ALLOWED_UPDATE_FIELDS);
    const fields = Object.keys(safeServiceData);
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const values = Object.values(safeServiceData).map((value) => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    values.push(id);
    
    const result = await pool.query(
      `UPDATE services SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${values.length} `,
      values
    );
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM services WHERE id = $1 ', [id]);
    return result.rows[0];
  }

  static async search(searchTerm, options = {}) {
    const { limit = 10, offset = 0 } = options;
    
    const result = await pool.query(
      `SELECT * FROM services 
       WHERE title LIKE $1 OR description LIKE $1 OR short_description LIKE $1 OR long_description LIKE $1
       ORDER BY 
         CASE WHEN title LIKE $1 THEN 1
              WHEN short_description LIKE $1 THEN 2
              WHEN long_description LIKE $1 THEN 3
              ELSE 4 END,
         sort_order ASC
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset]
    );
    
    return result.rows;
  }

  static async getCount(options = {}) {
    const { status, featured } = options;
    
    let query = 'SELECT COUNT(*) FROM services WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      params.push(featured);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Services;
