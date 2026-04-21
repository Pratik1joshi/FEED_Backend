const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = [
  'created_at',
  'updated_at',
  'title',
  'category',
  'type',
  'province',
  'status',
  'featured',
  'completion_date',
  'start_date',
];

const ALLOWED_UPDATE_FIELDS = [
  'title',
  'slug',
  'description',
  'full_description',
  'excerpt',
  'category',
  'type',
  'location',
  'province',
  'district',
  'coordinates',
  'status',
  'duration',
  'completion_date',
  'start_date',
  'client',
  'budget',
  'team_size',
  'capacity',
  'energy_generation',
  'images',
  'technologies',
  'objectives',
  'outcomes',
  'challenges',
  'impact',
  'featured',
  'tags',
];

class Projects {
  static async create(projectData) {
    const {
      title, slug, description, full_description, excerpt, category, type, location, province, district,
      coordinates, status, duration, completion_date, start_date, client, budget,
      team_size, capacity, energy_generation, images = [], technologies = [],
      objectives = [], outcomes = [], challenges = [], impact = {}, featured = false, tags = []
    } = projectData;
    
    // Sanitize date fields - convert empty strings to null to avoid PostgreSQL errors
    const sanitizedStartDate = start_date && start_date.trim() !== '' ? start_date : null;
    const sanitizedCompletionDate = completion_date && completion_date.trim() !== '' ? completion_date : null;
    
    // Convert coordinates from {lat, lng} or {x, y} to PostgreSQL POINT format
    let coordinatesValue = null;
    if (coordinates) {
      // Handle both {lat, lng} and {x, y} formats
      const lat = coordinates.lat || coordinates.y;
      const lng = coordinates.lng || coordinates.x;
      if (lat !== undefined && lng !== undefined) {
        // PostgreSQL POINT format: (longitude, latitude)
        coordinatesValue = `(${lng}, ${lat})`;
        console.log('Converting coordinates:', coordinates, 'to PostgreSQL format:', coordinatesValue);
      }
    } else {
      console.log('No valid coordinates provided:', coordinates);
    }
    
    const result = await pool.query(
      `INSERT INTO projects (title, slug, description, full_description, excerpt, category, type, location, 
       province, district, coordinates, status, duration, completion_date, start_date, 
       client, budget, team_size, capacity, energy_generation, images, technologies, 
       objectives, outcomes, challenges, impact, featured, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
       $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28) 
       `,
      [title, slug, description, full_description, excerpt, category, type, location, province, district,
       coordinatesValue, status, duration, sanitizedCompletionDate, sanitizedStartDate, client, budget,
       team_size, capacity, energy_generation, JSON.stringify(images), JSON.stringify(technologies),
       JSON.stringify(objectives), JSON.stringify(outcomes), JSON.stringify(challenges), 
       JSON.stringify(impact), featured, JSON.stringify(tags)]
    );
    
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { 
      category, status, province, type, featured, limit, offset, 
      sortBy = 'created_at', sortOrder = 'DESC' 
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'created_at',
      defaultSortOrder: 'DESC',
    });
    
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (province) {
      paramCount++;
      query += ` AND province = $${paramCount}`;
      params.push(province);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
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
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM projects WHERE slug = $1', [slug]);
    return result.rows[0];
  }

  static async findByCategory(category, options = {}) {
    const { limit = 10, offset = 0 } = options;
    
    const result = await pool.query(
      'SELECT * FROM projects WHERE category = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [category, limit, offset]
    );
    
    return result.rows;
  }

  static async findByProvince(province, options = {}) {
    const { limit = 10, offset = 0 } = options;
    
    const result = await pool.query(
      'SELECT * FROM projects WHERE province = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [province, limit, offset]
    );
    
    return result.rows;
  }

  static async findByLocation(location, radius = 50) {
    const result = await pool.query(
      `SELECT *, 
       ST_Distance(coordinates::geometry, ST_Point($1, $2)::geometry) as distance 
       FROM projects 
       WHERE coordinates IS NOT NULL 
       AND ST_DWithin(coordinates::geometry, ST_Point($1, $2)::geometry, $3)
       ORDER BY distance`,
      [location.longitude, location.latitude, radius * 1000] // Convert km to meters
    );
    
    return result.rows;
  }

  static async update(id, projectData) {
    console.log('=== PROJECTS MODEL UPDATE DEBUG ===');
    console.log('Update ID:', id);
    console.log('Project data keys:', Object.keys(projectData));
    console.log('Project data full_description:', projectData.full_description ? 'Present' : 'Missing');
    // Normalize keys: accept camelCase from frontend and convert to snake_case for DB
    const camelToSnake = (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase();
    const normalizedData = {};
    Object.keys(projectData).forEach(k => {
      const targetKey = k.includes('_') ? k : camelToSnake(k);
      normalizedData[targetKey] = projectData[k];
    });

    const safeProjectData = pickAllowedFields(normalizedData, ALLOWED_UPDATE_FIELDS);

    const fields = Object.keys(safeProjectData);
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const values = Object.values(safeProjectData).map((value, index) => {
      const fieldName = fields[index];
      
      // Sanitize date fields - convert empty strings to null
      if ((fieldName === 'start_date' || fieldName === 'completion_date') && 
          typeof value === 'string' && value.trim() === '') {
        return null;
      }
      
      // Special handling for coordinates (both camelCase and snake_case handled above)
      if (fieldName === 'coordinates' && value && typeof value === 'object') {
        // Handle both {lat, lng} and {x, y} formats
        const lat = value.lat || value.y;
        const lng = value.lng || value.x;
        if (lat !== undefined && lng !== undefined) {
          return `(${lng}, ${lat})`;
        }
      }

      // JSON stringify for other object fields
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }

      return value;
    });
    
    console.log('Fields to update:', fields);
    console.log('Values (first 100 chars each):', values.map(v => 
      typeof v === 'string' && v.length > 100 ? v.substring(0, 100) + '...' : v
    ));
    
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);
    
    console.log('SQL SET clause:', setClause);
    console.log('Final query values count:', values.length);
    
    const result = await pool.query(
      `UPDATE projects SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${values.length} `,
      values
    );
    
    console.log('Update result:', result.rows[0] ? 'Success' : 'No rows returned');
    console.log('=== END PROJECTS MODEL DEBUG ===');
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 ', [id]);
    return result.rows[0];
  }

  static async search(searchTerm, options = {}) {
    const { category, province, limit = 20, offset = 0 } = options;
    
    let query = `
      SELECT * FROM projects 
      WHERE (title LIKE $1 OR description LIKE $1 OR excerpt LIKE $1 OR location LIKE $1)
    `;
    const params = [`%${searchTerm}%`];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (province) {
      paramCount++;
      query += ` AND province = $${paramCount}`;
      params.push(province);
    }

    query += `
      ORDER BY 
        CASE WHEN title LIKE $1 THEN 1
             WHEN excerpt LIKE $1 THEN 2
             WHEN location LIKE $1 THEN 3
             ELSE 4 END,
        created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing_projects,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_projects,
        COUNT(DISTINCT province) as provinces_covered,
        COUNT(DISTINCT category) as categories
      FROM projects
    `);
    
    return result.rows[0];
  }

  static async getProjectsByStatus() {
    const result = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM projects 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    return result.rows;
  }

  static async getProjectsByProvince() {
    const result = await pool.query(`
      SELECT province, COUNT(*) as count 
      FROM projects 
      WHERE province IS NOT NULL 
      GROUP BY province 
      ORDER BY count DESC
    `);
    
    return result.rows;
  }

  static async getCount(options = {}) {
    const { category, status, province, type, featured } = options;
    
    let query = 'SELECT COUNT(*) FROM projects WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (province) {
      paramCount++;
      query += ` AND province = $${paramCount}`;
      params.push(province);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
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

module.exports = Projects;
