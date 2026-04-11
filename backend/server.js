
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Limit besar untuk upload base64 image
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// --- DAFTAR ROUTER MODULAR --- //
const tugasPPSURoutes = require('./routes/tugas_ppsu');
const staffRoutes = require('./routes/staff');
const usersRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');
const announcementsRoutes = require('./routes/announcements');
const sosRoutes = require('./routes/sos');

// API Khusus Waktu Server (Anti-Mock Time)
app.get('/api/time', (req, res) => {
    res.json({ datetime: new Date().toISOString() });
});

// Daftarkan Routes
app.use('/api/reports', tugasPPSURoutes); // Keep endpoint /api/reports for frontend compatibility
app.use('/api/staff', staffRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/sos', sosRoutes);

// Global Error Handler for better monitoring (Scaling)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Terjadi Kesalahan pada Server API.' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server API Berjalan di Port ${PORT}`);
});
