const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Kita akan menggunakan DATABASE_URL jika ada, atau menggunakan parameter terpisah.
// Menghilangkan ?connect_timeout=10 dari string jika menggunakan createPool
let connectionUri = process.env.DATABASE_URL;
if (connectionUri && connectionUri.includes('?')) {
    connectionUri = connectionUri.split('?')[0];
}

const pool = mysql.createPool(connectionUri || {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'sipetut_db',
    password: process.env.DB_PASSWORD || 'Bangbens220488!',
    database: process.env.DB_NAME || 'sipetut_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // 10 detik agar tidak hang
});

// Test koneksi saat startup
pool.getConnection()
    .then(connection => {
        console.log('✅ Koneksi MySQL2 (Pool) Berhasil ke database!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Gagal terkoneksi ke MySQL:', err.message);
    });

module.exports = pool;
