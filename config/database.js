const mysql = require('mysql2/promise');
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

// Create MySQL connection pool
const pool = mysql.createPool({
  uri: databaseUrl || 'mysql://root:admin@localhost:3306/feed_nepal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    // Basic conversion for query parameters from Postgres ($1) to MySQL (?)
    const mysqlText = text.replace(/\$\d+/g, '?');
    const [rows, fields] = await pool.execute(mysqlText, params);
    const duration = Date.now() - start;
    
    // Mimic pg's response structure to minimize breakages
    const res = {
      rows: Array.isArray(rows) ? rows : (rows ? [rows] : []),
      rowCount: rows.length !== undefined ? rows.length : (rows.affectedRows || 0),
      insertId: rows.insertId
    };

    if (isProduction) {
      console.log('Executed query', { duration, rows: res.rowCount });
    } else {
      console.log('Executed query', { text: mysqlText, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Helper function to get client for transactions
const getClient = async () => {
  return await pool.getConnection();
};

module.exports = {
  pool,
  query,
  getClient,
};

