const { query } = require('../config/database');

class Timeline {
  constructor(data) {
    this.year = data.year;
    this.title = data.title;
    this.description = data.description;
    this.icon = data.icon || 'Flag';
    this.category = data.category;
    this.featured = data.featured !== undefined ? data.featured : true;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.sort_order = data.sort_order || 0;
  }

  // Create new timeline item
  static async create(data) {
    const timeline = new Timeline(data);
    const result = await query(`
      INSERT INTO timeline (year, title, description, icon, category, featured, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      timeline.year,
      timeline.title,
      timeline.description,
      timeline.icon,
      timeline.category,
      timeline.featured,
      timeline.is_active,
      timeline.sort_order
    ]);
    return result.rows[0];
  }

  // Find all timeline items with filters
  static async find(filters = {}, options = {}) {
    let whereClause = 'WHERE is_active = true';
    const values = [];
    let paramCount = 0;

    if (filters.featured !== undefined) {
      whereClause += ` AND featured = $${++paramCount}`;
      values.push(filters.featured);
    }

    if (filters.category) {
      whereClause += ` AND category = $${++paramCount}`;
      values.push(filters.category);
    }

    if (filters.year) {
      whereClause += ` AND year = $${++paramCount}`;
      values.push(filters.year);
    }

    // Sorting
    let orderClause = 'ORDER BY year ASC, sort_order ASC';
    if (options.sort) {
      switch (options.sort) {
        case 'year_desc':
          orderClause = 'ORDER BY year DESC';
          break;
        case 'year_asc':
          orderClause = 'ORDER BY year ASC';
          break;
        case 'created_desc':
          orderClause = 'ORDER BY created_at DESC';
          break;
        default:
          orderClause = 'ORDER BY year ASC, sort_order ASC';
      }
    }

    // Pagination
    let limitClause = '';
    if (options.limit) {
      limitClause = ` LIMIT $${++paramCount}`;
      values.push(options.limit);
      
      if (options.offset) {
        limitClause += ` OFFSET $${++paramCount}`;
        values.push(options.offset);
      }
    }

    const result = await query(`
      SELECT * FROM timeline 
      ${whereClause} 
      ${orderClause}
      ${limitClause}
    `, values);

    return result.rows;
  }

  // Find single timeline item by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM timeline WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0];
  }

  // Find featured items
  static async getFeaturedItems() {
    const result = await query(`
      SELECT * FROM timeline 
      WHERE featured = true AND is_active = true 
      ORDER BY year ASC, sort_order ASC
    `);
    return result.rows;
  }

  // Find items by category
  static async getByCategory(category) {
    const result = await query(`
      SELECT * FROM timeline 
      WHERE category = $1 AND is_active = true 
      ORDER BY year DESC
    `, [category]);
    return result.rows;
  }

  // Update timeline item
  static async updateById(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (data.year !== undefined) {
      updates.push(`year = $${++paramCount}`);
      values.push(data.year);
    }
    if (data.title !== undefined) {
      updates.push(`title = $${++paramCount}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${++paramCount}`);
      values.push(data.description);
    }
    if (data.icon !== undefined) {
      updates.push(`icon = $${++paramCount}`);
      values.push(data.icon);
    }
    if (data.category !== undefined) {
      updates.push(`category = $${++paramCount}`);
      values.push(data.category);
    }
    if (data.featured !== undefined) {
      updates.push(`featured = $${++paramCount}`);
      values.push(data.featured);
    }
    if (data.sort_order !== undefined) {
      updates.push(`sort_order = $${++paramCount}`);
      values.push(data.sort_order);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(`
      UPDATE timeline 
      SET ${updates.join(', ')}
      WHERE id = $${++paramCount} AND is_active = true
      RETURNING *
    `, values);

    return result.rows[0];
  }

  // Soft delete timeline item
  static async deleteById(id) {
    const result = await query(
      'UPDATE timeline SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Count items with filters
  static async count(filters = {}) {
    let whereClause = 'WHERE is_active = true';
    const values = [];
    let paramCount = 0;

    if (filters.featured !== undefined) {
      whereClause += ` AND featured = $${++paramCount}`;
      values.push(filters.featured);
    }

    if (filters.category) {
      whereClause += ` AND category = $${++paramCount}`;
      values.push(filters.category);
    }

    if (filters.year) {
      whereClause += ` AND year = $${++paramCount}`;
      values.push(filters.year);
    }

    const result = await query(`SELECT COUNT(*) FROM timeline ${whereClause}`, values);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Timeline;
