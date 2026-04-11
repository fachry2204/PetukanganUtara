const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL ATTENDANCE
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM attendance ORDER BY timestamp DESC');
        const mapped = rows.map(r => ({
            id: r.id,
            staffId: r.staff_id,
            type: r.type,
            timestamp: r.timestamp,
            latitude: r.latitude,
            longitude: r.longitude,
            photo: r.photo_url,
            userNik: r.nik,
            userName: r.staff_name,
            address: r.address || 'Alamat tidak tercatat'
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE ATTENDANCE RECORD
router.post('/', async (req, res) => {
    const a = req.body;
    try {
        const sql = `
            INSERT INTO attendance (id, staff_id, type, timestamp, latitude, longitude, photo_url, nik, staff_name, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            a.id, a.staffId, a.type, a.timestamp, a.latitude, a.longitude, a.photoUrl, a.nik, a.staffName, a.address
        ]);

        // Mapping status berdasarkan tipe absen
        let newStatus = 'Online';
        if (a.type === 'Istirahat') {
            newStatus = 'Istirahat';
        } else if (a.type === 'Absen Pulang') {
            newStatus = 'Offline';
        } else if (a.type === 'Absen Masuk' || a.type === 'Selesai Istirahat') {
            newStatus = 'Online';
        }

        // Update status dan lokasi terakhir di tabel staff
        await db.query(
            'UPDATE staff SET status = ?, latitude = ?, longitude = ? WHERE nik = ?',
            [newStatus, a.latitude, a.longitude, a.nik]
        );

        res.status(201).json({ message: 'Attendance recorded and staff status updated' });
    } catch (err) {
        console.error("Attendance POST error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
