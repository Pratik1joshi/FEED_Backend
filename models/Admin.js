const bcrypt = require('bcryptjs');
const { query, getClient } = require('../config/database');

class Admin {
  constructor(data) {
    this.name = data.name;
    this.email = data.email.toLowerCase().trim();
    this.password = data.password;
    this.role = data.role || 'admin';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.last_login = data.last_login || null;
  }

  // Hash password before saving
  async hashPassword() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Compare passwords
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Create new admin
  static async create(data) {
    const admin = new Admin(data);
    await admin.hashPassword();
    
    const result = await query(`
      INSERT INTO admins (name, email, password, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      
    `, [admin.name, admin.email, admin.password, admin.role, admin.is_active]);
    
    return result.rows[0];
  }

  // Find admin by email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM admins WHERE email = $1 AND is_active = true',
      [email.toLowerCase().trim()]
    );
    return result.rows[0];
  }

  // Find admin by ID
  static async findById(id) {
    const result = await query(
      'SELECT id, name, email, role, is_active, last_login, created_at, updated_at FROM admins WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0];
  }

  // Find admin by ID with password (for password comparison)
  static async findByIdWithPassword(id) {
    const result = await query(
      'SELECT * FROM admins WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0];
  }

  // Update last login
  static async updateLastLogin(id) {
    const result = await query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1 ',
      [id]
    );
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const result = await query(
      'UPDATE admins SET password = $1 WHERE id = $2 ',
      [hashedPassword, id]
    );
    return result.rows[0];
  }

  // Update admin profile
  static async updateProfile(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (data.name !== undefined) {
      updates.push(`name = $${++paramCount}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${++paramCount}`);
      values.push(data.email.toLowerCase().trim());
    }
    if (data.role !== undefined) {
      updates.push(`role = $${++paramCount}`);
      values.push(data.role);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(`
      UPDATE admins 
      SET ${updates.join(', ')}
      WHERE id = $${++paramCount} AND is_active = true
      
    `, values);

    return result.rows[0];
  }

  // Get all admins
  static async findAll() {
    const result = await query(`
      SELECT id, name, email, role, is_active, last_login, created_at, updated_at 
      FROM admins 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  // Deactivate admin (soft delete)
  static async deactivate(id) {
    const result = await query(
      'UPDATE admins SET is_active = false WHERE id = $1 ',
      [id]
    );
    return result.rows[0];
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    let queryText = 'SELECT id FROM admins WHERE email = $1 AND is_active = true';
    let queryParams = [email.toLowerCase().trim()];

    if (excludeId) {
      queryText += ' AND id != $2';
      queryParams.push(excludeId);
    }

    const result = await query(queryText, queryParams);
    return result.rows.length > 0;
  }

  static async ensurePasswordResetTable() {
    await query(`
      CREATE TABLE IF NOT EXISTS admin_password_resets (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        token_hash VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_admin_password_resets_admin_id
      ON admin_password_resets(admin_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_admin_password_resets_expires_at
      ON admin_password_resets(expires_at)
    `);
  }

  static async createPasswordResetToken(adminId, tokenHash, expiresAt) {
    await this.ensurePasswordResetTable();

    await query(
      `
        UPDATE admin_password_resets
        SET used_at = CURRENT_TIMESTAMP
        WHERE admin_id = $1 AND used_at IS NULL
      `,
      [adminId]
    );

    const result = await query(
      `
        INSERT INTO admin_password_resets (admin_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
        
      `,
      [adminId, tokenHash, expiresAt]
    );

    return result.rows[0];
  }

  static async consumePasswordResetToken(tokenHash) {
    await this.ensurePasswordResetTable();
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const tokenResult = await client.query(
        `
          SELECT apr.id, apr.admin_id, apr.expires_at
          FROM admin_password_resets apr
          INNER JOIN admins a ON a.id = apr.admin_id
          WHERE apr.token_hash = $1
            AND apr.used_at IS NULL
            AND apr.expires_at > CURRENT_TIMESTAMP
            AND a.is_active = true
          FOR UPDATE
        `,
        [tokenHash]
      );

      if (!tokenResult.rows[0]) {
        await client.query('ROLLBACK');
        return null;
      }

      const tokenRow = tokenResult.rows[0];

      await client.query(
        `
          UPDATE admin_password_resets
          SET used_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [tokenRow.id]
      );

      await client.query('COMMIT');
      return tokenRow;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async invalidatePasswordResetTokens(adminId) {
    await this.ensurePasswordResetTable();
    await query(
      `
        UPDATE admin_password_resets
        SET used_at = CURRENT_TIMESTAMP
        WHERE admin_id = $1 AND used_at IS NULL
      `,
      [adminId]
    );
  }
}

module.exports = Admin;
