const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = ['release_date', 'created_at', 'updated_at', 'title', 'featured'];
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'slug',
  'content',
  'release_date',
  'contact_person',
  'contact_email',
  'contact_phone',
  'images',
  'attachments',
  'is_published',
  'featured',
];

class Press {
  static async create(pressData) {
    const {
      title,
      slug,
      content,
      release_date,
      contact_person,
      contact_email,
      contact_phone,
      images,
      attachments,
      is_published,
      featured
    } = pressData;

    const query = `
      INSERT INTO press_releases (
        title, slug, content, release_date, contact_person, contact_email, contact_phone,
        images, attachments, is_published, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      
    `;

    const values = [
      title,
      slug || this.generateSlug(title),
      content,
      release_date || new Date(),
      contact_person,
      contact_email,
      contact_phone,
      JSON.stringify(images) || '[]',
      JSON.stringify(attachments) || '[]',
      is_published !== undefined ? is_published : true,
      featured || false
    ];

    const result = await pool.query(query, values);
    const press = result.rows[0];
    if (press) {
      press.images = this.parseJSON(press.images);
      press.attachments = this.parseJSON(press.attachments);
    }
    return press;
  }

  static async findAll(options = {}) {
    const {
      featured,
      is_published = true,
      limit = 50,
      offset = 0,
      sortBy = 'release_date',
      sortOrder = 'DESC'
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'release_date',
      defaultSortOrder: 'DESC',
    });

    let query = `SELECT * FROM press_releases WHERE 1=1`;
    const values = [];
    let paramCount = 0;

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      values.push(featured);
    }

    if (is_published !== undefined) {
      paramCount++;
      query += ` AND is_published = $${paramCount}`;
      values.push(is_published);
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
    
    // Parse JSON fields for each row
    return result.rows.map(row => ({
      ...row,
      images: this.parseJSON(row.images),
      attachments: this.parseJSON(row.attachments)
    }));
  }

  static async findById(id) {
    const query = `SELECT * FROM press_releases WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows[0]) {
      result.rows[0].images = this.parseJSON(result.rows[0].images);
      result.rows[0].attachments = this.parseJSON(result.rows[0].attachments);
    }
    
    return result.rows[0] || null;
  }

  static async findBySlug(slug) {
    const query = `SELECT * FROM press_releases WHERE slug = $1`;
    const result = await pool.query(query, [slug]);
    
    if (result.rows[0]) {
      result.rows[0].images = this.parseJSON(result.rows[0].images);
      result.rows[0].attachments = this.parseJSON(result.rows[0].attachments);
    }
    
    return result.rows[0] || null;
  }

  static async findFeatured(limit = 10) {
    const query = `
      SELECT * FROM press_releases 
      WHERE featured = true AND is_published = true
      ORDER BY release_date DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      ...row,
      images: this.parseJSON(row.images),
      attachments: this.parseJSON(row.attachments)
    }));
  }

  static async findRecent(limit = 10) {
    const query = `
      SELECT * FROM press_releases 
      WHERE is_published = true
      ORDER BY release_date DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      ...row,
      images: this.parseJSON(row.images),
      attachments: this.parseJSON(row.attachments)
    }));
  }

  static async findPublished(options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const query = `
      SELECT * FROM press_releases 
      WHERE is_published = true
      ORDER BY release_date DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    
    return result.rows.map(row => ({
      ...row,
      images: this.parseJSON(row.images),
      attachments: this.parseJSON(row.attachments)
    }));
  }

  static async update(id, pressData) {
    const safePressData = pickAllowedFields(pressData, ALLOWED_UPDATE_FIELDS);
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.keys(safePressData).forEach(key => {
      if (safePressData[key] !== undefined) {
        paramCount++;
        if (key === 'images' || key === 'attachments') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(safePressData[key]));
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(safePressData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(id);
    
    const query = `
      UPDATE press_releases 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount}
      
    `;

    const result = await pool.query(query, values);
    const press = result.rows[0];
    if (press) {
      press.images = this.parseJSON(press.images);
      press.attachments = this.parseJSON(press.attachments);
    }
    return press;
  }

  static async delete(id) {
    const press = await this.findById(id);
    if (!press) return null;

    const query = `DELETE FROM press_releases WHERE id = $1`;
    await pool.query(query, [id]);
    return press;
  }

  static async getCount(options = {}) {
    const { featured, is_published } = options;

    let query = `SELECT COUNT(*) as count FROM press_releases WHERE 1=1`;
    const values = [];
    let paramCount = 0;

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      values.push(featured);
    }

    if (is_published !== undefined) {
      paramCount++;
      query += ` AND is_published = $${paramCount}`;
      values.push(is_published);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async search(searchTerm, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    let query = `
      SELECT * FROM press_releases 
      WHERE (title LIKE $1 OR content LIKE $2) AND is_published = true
    `;
    
    const values = [`%${searchTerm}%`, `%${searchTerm}%`];
    let paramCount = 2;

    paramCount++;
    query += ` ORDER BY release_date DESC LIMIT $${paramCount}`;
    values.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(offset);

    const result = await pool.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      images: this.parseJSON(row.images),
      attachments: this.parseJSON(row.attachments)
    }));
  }

  static async findByContact(contact_person, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const query = `
      SELECT * FROM press_releases 
      WHERE contact_person = $1 AND is_published = true
      ORDER BY release_date DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [contact_person, limit, offset]);
    
    return result.rows.map(row => ({
      ...row,
      images: this.parseJSON(row.images),
      attachments: this.parseJSON(row.attachments)
    }));
  }

  static async getContactPersons() {
    const query = `SELECT DISTINCT contact_person FROM press_releases WHERE contact_person IS NOT NULL ORDER BY contact_person`;
    const result = await pool.query(query);
    return result.rows.map(row => row.contact_person);
  }

  static generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static parseJSON(jsonString) {
    try {
      if (typeof jsonString === 'object') return jsonString || [];
      return JSON.parse(jsonString || '[]');
    } catch {
      return [];
    }
  }
}

module.exports = Press;
