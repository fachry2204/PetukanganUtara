const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL JADWAL
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT j.*, s.nama_lengkap, s.nomor_anggota 
            FROM jadwal_ppsu j 
            JOIN staff s ON j.staff_id = s.id 
            ORDER BY j.timestamp DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE JADWAL
router.post('/', async (req, res) => {
    const j = req.body;
    try {
        const sql = `
            INSERT INTO jadwal_ppsu (id, staff_id, day, shift, start_time, end_time, area, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            j.id, j.staffId, j.day, j.shift, j.startTime, j.endTime, j.area, new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]);
        res.status(201).json({ message: 'Jadwal created', id: j.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE JADWAL
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM jadwal_ppsu WHERE id = ?', [req.params.id]);
        res.json({ message: 'Jadwal deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
