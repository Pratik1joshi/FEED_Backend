const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = ['award_date', 'created_at', 'updated_at', 'title', 'featured', 'category', 'recognition_level'];
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'description',
  'awarding_organization',
  'award_date',
  'category',
  'recognition_level',
  'project_id',
  'team_member_id',
  'image_url',
  'certificate_url',
  'featured',
];

class Awards {
  static async create(awardData) {
    const {
      title,
      description,
      awarding_organization,
      award_date,
      category,
      recognition_level,
      project_id,
      team_member_id,
      image_url,
      certificate_url,
      featured
    } = awardData;

    const query = `
      INSERT INTO awards (
        title, description, awarding_organization, award_date, category, recognition_level,
        project_id, team_member_id, image_url, certificate_url, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      title,
      description,
      awarding_organization,
      award_date || new Date(),
      category || 'recognition',
      recognition_level || 'organizational',
      project_id,
      team_member_id,
      image_url,
      certificate_url,
      featured || false
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const {
      category,
      recognition_level,
      featured,
      project_id,
      team_member_id,
      limit = 50,
      offset = 0,
      sortBy = 'award_date',
      sortOrder = 'DESC'
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'award_date',
      defaultSortOrder: 'DESC',
    });

    let query = `SELECT * FROM awards WHERE 1=1`;
    const values = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(category);
    }

    if (recognition_level) {
      paramCount++;
      query += ` AND recognition_level = $${paramCount}`;
      values.push(recognition_level);
    }

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      values.push(featured);
    }

    if (project_id) {
      paramCount++;
      query += ` AND project_id = $${paramCount}`;
      values.push(project_id);
    }

    if (team_member_id) {
      paramCount++;
      query += ` AND team_member_id = $${paramCount}`;
      values.push(team_member_id);
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
    return result.rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM awards WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findFeatured(limit = 10) {
    const query = `
      SELECT * FROM awards 
      WHERE featured = true 
      ORDER BY award_date DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async findByCategory(category, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const query = `
      SELECT * FROM awards 
      WHERE category = $1 
      ORDER BY award_date DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [category, limit, offset]);
    return result.rows;
  }

  static async findByProject(project_id, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const query = `
      SELECT * FROM awards 
      WHERE project_id = $1 
      ORDER BY award_date DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [project_id, limit, offset]);
    return result.rows;
  }

  static async findByTeamMember(team_member_id, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const query = `
      SELECT * FROM awards 
      WHERE team_member_id = $1 
      ORDER BY award_date DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [team_member_id, limit, offset]);
    return result.rows;
  }

  static async update(id, awardData) {
    const safeAwardData = pickAllowedFields(awardData, ALLOWED_UPDATE_FIELDS);
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.keys(safeAwardData).forEach(key => {
      if (safeAwardData[key] !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(safeAwardData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(id);
    
    const query = `
      UPDATE awards 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const award = await this.findById(id);
    if (!award) return null;

    const query = `DELETE FROM awards WHERE id = $1`;
    await pool.query(query, [id]);
    return award;
  }

  static async getCount(options = {}) {
    const { category, recognition_level, featured, project_id, team_member_id } = options;

    let query = `SELECT COUNT(*) as count FROM awards WHERE 1=1`;
    const values = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(category);
    }

    if (recognition_level) {
      paramCount++;
      query += ` AND recognition_level = $${paramCount}`;
      values.push(recognition_level);
    }

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      values.push(featured);
    }

    if (project_id) {
      paramCount++;
      query += ` AND project_id = $${paramCount}`;
      values.push(project_id);
    }

    if (team_member_id) {
      paramCount++;
      query += ` AND team_member_id = $${paramCount}`;
      values.push(team_member_id);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async search(searchTerm, options = {}) {
    const { category, limit = 20, offset = 0 } = options;
    
    let query = `
      SELECT * FROM awards 
      WHERE (title ILIKE $1 OR awarding_organization ILIKE $2 OR description ILIKE $3)
    `;
    
    const values = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    let paramCount = 3;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(category);
    }

    paramCount++;
    query += ` ORDER BY award_date DESC LIMIT $${paramCount}`;
    values.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getCategories() {
    const query = `SELECT DISTINCT category FROM awards WHERE category IS NOT NULL ORDER BY category`;
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  }

  static async getRecognitionLevels() {
    const query = `SELECT DISTINCT recognition_level FROM awards WHERE recognition_level IS NOT NULL ORDER BY recognition_level`;
    const result = await pool.query(query);
    return result.rows.map(row => row.recognition_level);
  }
}

module.exports = Awards;
