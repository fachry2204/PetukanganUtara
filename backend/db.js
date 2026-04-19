const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config(); // Fallback to current directory .env if root not enough

// Buat koneksi pool agar lebih efisien
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'sipetut_db',
  password: process.env.DB_PASSWORD || 'Bangbens220488!',
  database: process.env.DB_NAME || 'sipetut_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00'
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
