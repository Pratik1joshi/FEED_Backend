const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = ['taken_date', 'created_at', 'updated_at', 'sort_order', 'title', 'featured'];
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'description',
  'image_url',
  'thumbnail_url',
  'category',
  'project_id',
  'event_id',
  'alt_text',
  'photographer',
  'location',
  'taken_date',
  'tags',
  'featured',
  'sort_order',
  'is_active',
];

class Gallery {
  static async create(galleryData) {
    const {
      title,
      description,
      image_url,
      thumbnail_url,
      category,
      project_id,
      event_id,
      alt_text,
      photographer,
      location,
      taken_date,
      tags,
      featured,
      sort_order,
      is_active
    } = galleryData;

    const query = `
      INSERT INTO gallery (
        title, description, image_url, thumbnail_url, category, project_id, event_id,
        alt_text, photographer, location, taken_date, tags, featured, sort_order, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      
    `;

    const values = [
      title,
      description,
      image_url,
      thumbnail_url,
      category,
      project_id,
      event_id,
      alt_text,
      photographer,
      location,
      taken_date,
      JSON.stringify(tags) || '[]',
      featured || false,
      sort_order || 0,
      is_active !== undefined ? is_active : true
    ];

    const result = await pool.query(query, values);
    const image = result.rows[0];
    if (image) {
      image.tags = this.parseTags(image.tags);
    }
    return image;
  }

  static async findAll(options = {}) {
    const {
      category,
      featured,
      is_active = true,
      project_id,
      event_id,
      photographer,
      limit = 50,
      offset = 0,
      sortBy = 'taken_date',
      sortOrder = 'DESC'
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'taken_date',
      defaultSortOrder: 'DESC',
    });

    let query = `SELECT * FROM gallery WHERE 1=1`;
    const values = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(category);
    }

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      values.push(featured);
    }

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      values.push(is_active);
    }

    if (project_id) {
      paramCount++;
      query += ` AND project_id = $${paramCount}`;
      values.push(project_id);
    }

    if (event_id) {
      paramCount++;
      query += ` AND event_id = $${paramCount}`;
      values.push(event_id);
    }

    if (photographer) {
      paramCount++;
      query += ` AND photographer = $${paramCount}`;
      values.push(photographer);
    }

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;
    
    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(parseInt(limit));
      
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(parseInt(offset));
    }

    const result = await pool.query(query, values);
    
    // Parse tags JSON for each row
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
  }

  static async findById(id) {
    const query = `SELECT * FROM gallery WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows[0]) {
      result.rows[0].tags = this.parseTags(result.rows[0].tags);
    }
    
    return result.rows[0] || null;
  }

  static async findFeatured(limit = 20) {
    const query = `
      SELECT * FROM gallery 
      WHERE featured = true AND is_active = true
      ORDER BY sort_order ASC, taken_date DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
  }

  static async findByCategory(category, options = {}) {
    const { limit = 30, offset = 0, is_active = true } = options;
    
    let query = `
      SELECT * FROM gallery 
      WHERE category = $1
    `;
    const values = [category];
    let paramCount = 1;
    
    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      values.push(is_active);
    }
    
    paramCount++;
    query += ` ORDER BY taken_date DESC, sort_order ASC LIMIT $${paramCount}`;
    values.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(offset);
    
    const result = await pool.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
  }

  static async findByProject(project_id, options = {}) {
    const { limit = 30, offset = 0, is_active = true } = options;
    
    let query = `
      SELECT * FROM gallery 
      WHERE project_id = $1
    `;
    const values = [project_id];
    let paramCount = 1;
    
    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      values.push(is_active);
    }
    
    paramCount++;
    query += ` ORDER BY taken_date DESC, sort_order ASC LIMIT $${paramCount}`;
    values.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(offset);
    
    const result = await pool.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
  }

  static async findByEvent(event_id, options = {}) {
    const { limit = 30, offset = 0, is_active = true } = options;
    
    let query = `
      SELECT * FROM gallery 
      WHERE event_id = $1
    `;
    const values = [event_id];
    let paramCount = 1;
    
    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      values.push(is_active);
    }
    
    paramCount++;
    query += ` ORDER BY taken_date DESC, sort_order ASC LIMIT $${paramCount}`;
    values.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(offset);
    
    const result = await pool.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
  }

  static async findRecent(limit = 20) {
    const query = `
      SELECT * FROM gallery 
      WHERE is_active = true
      ORDER BY taken_date DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
  }

  static async update(id, galleryData) {
    const safeGalleryData = pickAllowedFields(galleryData, ALLOWED_UPDATE_FIELDS);
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.keys(safeGalleryData).forEach(key => {
      if (safeGalleryData[key] !== undefined) {
        paramCount++;
        if (key === 'tags') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(safeGalleryData[key]));
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(safeGalleryData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(id);
    
    const query = `
      UPDATE gallery 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount}
      
    `;

    const result = await pool.query(query, values);
    const image = result.rows[0];
    if (image) {
      image.tags = this.parseTags(image.tags);
    }
    return image;
  }

  static async delete(id) {
    const image = await this.findById(id);
    if (!image) return null;

    const query = `DELETE FROM gallery WHERE id = $1`;
    await pool.query(query, [id]);
    return image;
  }

  static async getCount(options = {}) {
    const { category, featured, is_active, project_id, event_id, photographer } = options;

    let query = `SELECT COUNT(*) as count FROM gallery WHERE 1=1`;
    const values = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(category);
    }

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      values.push(featured);
    }

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      values.push(is_active);
    }

    if (project_id) {
      paramCount++;
      query += ` AND project_id = $${paramCount}`;
      values.push(project_id);
    }

    if (event_id) {
      paramCount++;
      query += ` AND event_id = $${paramCount}`;
      values.push(event_id);
    }

    if (photographer) {
      paramCount++;
      query += ` AND photographer = $${paramCount}`;
      values.push(photographer);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async search(searchTerm, options = {}) {
    const { category, limit = 30, offset = 0 } = options;
    
    let query = `
      SELECT * FROM gallery 
      WHERE (title LIKE $1 OR description LIKE $2 OR alt_text LIKE $3 OR photographer LIKE $4 OR location LIKE $5) 
      AND is_active = true
    `;
    
    const values = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    let paramCount = 5;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(category);
    }

    paramCount++;
    query += ` ORDER BY taken_date DESC, sort_order ASC LIMIT $${paramCount}`;
    values.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(offset);

    const result = await pool.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
  }

  static async getCategories() {
    const query = `SELECT DISTINCT category FROM gallery WHERE category IS NOT NULL ORDER BY category`;
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  }

  static async getPhotographers() {
    const query = `SELECT DISTINCT photographer FROM gallery WHERE photographer IS NOT NULL ORDER BY photographer`;
    const result = await pool.query(query);
    return result.rows.map(row => row.photographer);
  }

  static parseTags(tagsJson) {
    try {
      if (typeof tagsJson === 'object') return tagsJson || [];
      return JSON.parse(tagsJson || '[]');
    } catch {
      return [];
    }
  }
}

module.exports = Gallery;
