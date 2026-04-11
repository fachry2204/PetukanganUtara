const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL ATTENDANCE
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM attendance ORDER BY timestamp DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE ATTENDANCE RECORD
router.post('/', async (req, res) => {
    const a = req.body;
    try {
        const sql = `
            INSERT INTO attendance (id, staff_id, type, timestamp, latitude, longitude, photo_url, nik, staff_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            a.id, a.staffId, a.type, a.timestamp, a.latitude, a.longitude, a.photoUrl, a.nik, a.staffName
        ]);
        res.status(201).json({ message: 'Attendance recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
