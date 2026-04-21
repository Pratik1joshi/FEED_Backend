const db = require('../config/database');

async function up() {
  const connection = await db.getClient();
  try {
    await connection.query('BEGIN');

    // Create departments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create team_roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS team_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query('COMMIT');
    console.log('Migration 009: Team roles and departments schema created successfully.');
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Migration 009 failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

async function down() {
  const connection = await db.getClient();
  try {
    await connection.query('BEGIN');
    await connection.query('DROP TABLE IF EXISTS team_roles;');
    await connection.query('DROP TABLE IF EXISTS departments;');
    await connection.query('COMMIT');
    console.log('Migration 009: Rolled back successfully.');
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Rollback 009 failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { up, down };
