const { pool } = require('../config/database');
const { sanitizeSort, pickAllowedFields } = require('../utils/sqlGuard');

const ALLOWED_SORT_FIELDS = [
  'event_date',
  'end_date',
  'created_at',
  'updated_at',
  'title',
  'featured',
  'registered_attendees',
];

const ALLOWED_UPDATE_FIELDS = [
  'title',
  'slug',
  'subtitle',
  'description',
  'full_description',
  'event_date',
  'end_date',
  'event_time',
  'location',
  'venue',
  'organizer',
  'category',
  'status',
  'capacity',
  'registered_attendees',
  'ticket_price',
  'images',
  'speakers',
  'agenda',
  'registration_url',
  'contact_info',
  'featured',
  'tags',
];

class Events {
  static async create(eventData) {
    const {
      title, slug, subtitle, description, full_description, event_date, end_date,
      event_time, location, venue, organizer, category, status = 'upcoming',
      capacity, registered_attendees = 0, ticket_price, images = [], speakers = [],
      agenda = [], registration_url, contact_info = {}, featured = false, tags = []
    } = eventData;
    
    const result = await pool.query(
      `INSERT INTO events (title, slug, subtitle, description, full_description, event_date, 
       end_date, event_time, location, venue, organizer, category, status, capacity, 
       registered_attendees, ticket_price, images, speakers, agenda, registration_url, 
       contact_info, featured, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
       $17, $18, $19, $20, $21, $22, $23) 
       RETURNING *`,
      [title, slug, subtitle, description, full_description, event_date, end_date,
       event_time, location, venue, organizer, category, status, capacity,
       registered_attendees, ticket_price, JSON.stringify(images), JSON.stringify(speakers),
       JSON.stringify(agenda), registration_url, JSON.stringify(contact_info), featured, JSON.stringify(tags)]
    );
    
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { 
      category, status, featured, upcoming, limit, offset, 
      sortBy = 'event_date', sortOrder = 'ASC' 
    } = options;

    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = sanitizeSort({
      sortBy,
      sortOrder,
      allowedFields: ALLOWED_SORT_FIELDS,
      defaultSortBy: 'event_date',
      defaultSortOrder: 'ASC',
    });
    
    let query = 'SELECT * FROM events WHERE 1=1';
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

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      params.push(featured);
    }

    if (upcoming) {
      query += ` AND event_date >= CURRENT_DATE`;
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
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM events WHERE slug = $1', [slug]);
    return result.rows[0];
  }

  static async findUpcoming(options = {}) {
    const { limit = 10, offset = 0, category } = options;
    
    let query = `SELECT * FROM events 
                 WHERE event_date >= CURRENT_DATE`;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    query += ` ORDER BY event_date ASC`;

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

  static async findPast(options = {}) {
    const { limit = 10, offset = 0, category } = options;
    
    let query = `SELECT * FROM events 
                 WHERE event_date < CURRENT_DATE`;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    query += ` ORDER BY event_date DESC`;

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

  static async findByDateRange(startDate, endDate, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE event_date BETWEEN $1 AND $2 
       ORDER BY event_date ASC 
       LIMIT $3 OFFSET $4`,
      [startDate, endDate, limit, offset]
    );
    
    return result.rows;
  }

  static async update(id, eventData) {
    const safeEventData = pickAllowedFields(eventData, ALLOWED_UPDATE_FIELDS);
    const fields = Object.keys(safeEventData);
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const values = Object.values(safeEventData).map(value => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);
    
    const result = await pool.query(
      `UPDATE events SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async search(searchTerm, options = {}) {
    const { category, status, limit = 20, offset = 0 } = options;
    
    let query = `
      SELECT * FROM events 
      WHERE (title ILIKE $1 OR description ILIKE $1 OR location ILIKE $1 OR venue ILIKE $1)
    `;
    const params = [`%${searchTerm}%`];
    let paramCount = 1;

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

    query += `
      ORDER BY 
        CASE WHEN title ILIKE $1 THEN 1
             WHEN description ILIKE $1 THEN 2
             WHEN location ILIKE $1 THEN 3
             ELSE 4 END,
        event_date ASC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async registerAttendee(eventId) {
    const result = await pool.query(
      `UPDATE events 
       SET registered_attendees = registered_attendees + 1 
       WHERE id = $1 AND (capacity IS NULL OR registered_attendees < capacity)
       RETURNING *`,
      [eventId]
    );
    
    return result.rows[0];
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN event_date >= CURRENT_DATE THEN 1 END) as upcoming_events,
        COUNT(CASE WHEN event_date < CURRENT_DATE THEN 1 END) as past_events,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_events,
        SUM(registered_attendees) as total_attendees,
        COUNT(DISTINCT category) as categories
      FROM events
    `);
    
    return result.rows[0];
  }

  static async getCount(options = {}) {
    const { category, status, featured, upcoming } = options;
    
    let query = 'SELECT COUNT(*) FROM events WHERE 1=1';
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

    if (featured !== undefined) {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      params.push(featured);
    }

    if (upcoming) {
      query += ` AND event_date >= CURRENT_DATE`;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Events;
