const { query } = require('../config/database');

const createTables = async () => {
  console.log('Creating unified latest database schema (MySQL)...');

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY,
        organization_name VARCHAR(255) DEFAULT 'FEED'
      )
    `);

    console.log('Unified latest schema created successfully.');
  } catch (error) {
    console.error('Error creating unified latest schema:', error);
    throw error;
  }
};

const dropTables = async () => {
  console.log('Dropping unified latest database schema...');

  try {
    await query('DROP TABLE IF EXISTS site_settings');
    await query('DROP TABLE IF EXISTS admins');

    console.log('Unified latest schema dropped successfully.');
  } catch (error) {
    console.error('Error dropping unified latest schema:', error);
    throw error;
  }
};

module.exports = {
  createTables,
  dropTables,
};
