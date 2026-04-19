const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'title', 'duration', 'category', 'views', 'featured'];
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'description',
  'video_url',
  'thumbnail_url',
  'duration',
  'category',
  'project_id',
  'event_id',
  'youtube_id',
  'vimeo_id',
  'tags',
  'featured',
  'views',
  'is_active',
];

class Videos {
  static async create(videoData) {
    const {
      title,
      description,
      video_url,
      thumbnail_url,
      duration,
      category,
      project_id,
      event_id,
      youtube_id,
      vimeo_id,
      tags,
      featured,
      views,
      is_active
    } = videoData;

    const query = `
      INSERT INTO videos (
        title, description, video_url, thumbnail_url, duration, category, project_id, event_id,
        youtube_id, vimeo_id, tags, featured, views, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      title,
      description,
      video_url,
      thumbnail_url,
      duration,
      category,
      project_id,
      event_id,
      youtube_id,
      vimeo_id,
      JSON.stringify(tags) || '[]',
      featured || false,
      views || 0,
      is_active !== undefined ? is_active : true
    ];

    const result = await pool.query(query, values);
    const video = result.rows[0];
    if (video) {
      video.tags = this.parseTags(video.tags);
    }
    return video;
  }

  static async findAll(options = {}) {
    const {
      category,
      featured,
      is_active = true,
      project_id,
      event_id,
      limit = 50,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'created_at',
      defaultSortOrder: 'DESC',
    });

    let query = `SELECT * FROM videos WHERE 1=1`;
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
    const query = `SELECT * FROM videos WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows[0]) {
      result.rows[0].tags = this.parseTags(result.rows[0].tags);
    }
    
    return result.rows[0] || null;
  }

  static async findFeatured(limit = 10) {
    const query = `
      SELECT * FROM videos 
      WHERE featured = true AND is_active = true
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
  }

  static async findByCategory(category, options = {}) {
    const { limit = 20, offset = 0, is_active = true } = options;
    
    let query = `
      SELECT * FROM videos 
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
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
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
    const { limit = 20, offset = 0, is_active = true } = options;
    
    let query = `
      SELECT * FROM videos 
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
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
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
    const { limit = 20, offset = 0, is_active = true } = options;
    
    let query = `
      SELECT * FROM videos 
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
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
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

  static async findRecent(limit = 10) {
    const query = `
      SELECT * FROM videos 
      WHERE is_active = true
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
  }

  static async incrementViews(id) {
    const query = `
      UPDATE videos 
      SET views = views + 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING views
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0]?.views || 0;
  }

  static async update(id, videoData) {
    const safeVideoData = pickAllowedFields(videoData, ALLOWED_UPDATE_FIELDS);
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.keys(safeVideoData).forEach(key => {
      if (safeVideoData[key] !== undefined) {
        paramCount++;
        if (key === 'tags') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(safeVideoData[key]));
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(safeVideoData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(id);
    
    const query = `
      UPDATE videos 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const video = result.rows[0];
    if (video) {
      video.tags = this.parseTags(video.tags);
    }
    return video;
  }

  static async delete(id) {
    const video = await this.findById(id);
    if (!video) return null;

    const query = `DELETE FROM videos WHERE id = $1`;
    await pool.query(query, [id]);
    return video;
  }

  static async getCount(options = {}) {
    const { category, featured, is_active, project_id, event_id } = options;

    let query = `SELECT COUNT(*) as count FROM videos WHERE 1=1`;
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

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async search(searchTerm, options = {}) {
    const { category, limit = 20, offset = 0 } = options;
    
    let query = `
      SELECT * FROM videos 
      WHERE (title ILIKE $1 OR description ILIKE $2) AND is_active = true
    `;
    
    const values = [`%${searchTerm}%`, `%${searchTerm}%`];
    let paramCount = 2;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(category);
    }

    paramCount++;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
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
    const query = `SELECT DISTINCT category FROM videos WHERE category IS NOT NULL ORDER BY category`;
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  }

  static async getMostViewed(limit = 10) {
    const query = `
      SELECT * FROM videos 
      WHERE is_active = true
      ORDER BY views DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      ...row,
      tags: this.parseTags(row.tags)
    }));
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

module.exports = Videos;
