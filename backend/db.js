
const mysql = require('mysql2');
require('dotenv').config();

// Buat koneksi pool agar lebih efisien
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sipetut',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test koneksi
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.code);
  } else {
    console.log('✅ Connected to MySQL Database');
    connection.release();
  }
});

module.exports = pool.promise();
