const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ACTIVE SOS ALERTS
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sos_alerts WHERE is_resolved = FALSE ORDER BY time DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE SOS ALERT
router.post('/', async (req, res) => {
    const s = req.body;
    try {
        const sql = `
            INSERT INTO sos_alerts (alert_key, nik, name, time, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            s.key, s.nik, s.name, s.time, s.latitude, s.longitude
        ]);
        res.status(201).json({ message: 'SOS alert created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RESOLVE SOS ALERT
router.put('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        await db.query('UPDATE sos_alerts SET is_resolved = TRUE WHERE alert_key = ?', [key]);
        res.json({ message: 'SOS alert resolved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
