const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = ['sort_order', 'created_at', 'updated_at', 'name', 'publications', 'years_experience'];
const ALLOWED_UPDATE_FIELDS = [
  'name',
  'slug',
  'position',
  'department',
  'bio',
  'expertise',
  'education',
  'image_url',
  'email',
  'linkedin',
  'publications',
  'years_experience',
  'languages',
  'awards',
  'is_active',
  'sort_order',
];

class TeamMembers {
  static async create(memberData) {
    const {
      name, position, department, bio, expertise = [], education = [],
      image_url, email, linkedin, publications = 0, years_experience = 0,
      languages = [], awards = [], is_active = true, sort_order = 0
    } = memberData;
    
    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
    
    const result = await pool.query(
      `INSERT INTO team_members (name, slug, position, department, bio, expertise, education,
       image_url, email, linkedin, publications, years_experience, languages, awards, 
       is_active, sort_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING *`,
      [name, slug, position, department, bio, JSON.stringify(expertise), JSON.stringify(education),
       image_url, email, linkedin, publications, years_experience, JSON.stringify(languages), 
       JSON.stringify(awards), is_active, sort_order]
    );
    
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { 
      department, is_active, limit, offset, 
      sortBy = 'sort_order', sortOrder = 'ASC' 
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'sort_order',
      defaultSortOrder: 'ASC',
    });
    
    let query = 'SELECT * FROM team_members WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      params.push(department);
    }

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active);
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
    const result = await pool.query('SELECT * FROM team_members WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM team_members WHERE slug = $1', [slug]);
    return result.rows[0];
  }

  static async findByDepartment(department, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const result = await pool.query(
      'SELECT * FROM team_members WHERE department = $1 AND is_active = true ORDER BY sort_order ASC LIMIT $2 OFFSET $3',
      [department, limit, offset]
    );
    
    return result.rows;
  }

  static async update(id, memberData) {
    const safeMemberData = pickAllowedFields(memberData, ALLOWED_UPDATE_FIELDS);

    // Generate new slug if name is being updated
    if (safeMemberData.name) {
      safeMemberData.slug = safeMemberData.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .trim();
    }
    
    const fields = Object.keys(safeMemberData);
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const values = Object.values(safeMemberData).map(value => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);
    
    const result = await pool.query(
      `UPDATE team_members SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async search(searchTerm, options = {}) {
    const { department, limit = 20, offset = 0 } = options;
    
    let query = `
      SELECT * FROM team_members 
      WHERE (name ILIKE $1 OR position ILIKE $1 OR bio ILIKE $1)
      AND is_active = true
    `;
    const params = [`%${searchTerm}%`];
    let paramCount = 1;

    if (department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      params.push(department);
    }

    query += `
      ORDER BY 
        CASE WHEN name ILIKE $1 THEN 1
             WHEN position ILIKE $1 THEN 2
             ELSE 3 END,
        sort_order ASC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getCount(options = {}) {
    const { department, is_active } = options;
    
    let query = 'SELECT COUNT(*) FROM team_members WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      params.push(department);
    }

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = TeamMembers;
