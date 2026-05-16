const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET ACTIVE SOS ALERTS
router.get('/', async (req, res) => {
    try {
        const rows = await prisma.$queryRawUnsafe('SELECT * FROM sos_alerts WHERE is_resolved = FALSE ORDER BY time DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE SOS ALERT
router.post('/', async (req, res) => {
    const s = req.body;
    try {
        await prisma.$executeRawUnsafe(`
            INSERT INTO sos_alerts (alert_key, nik, name, time, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        `, s.key, s.nik, s.name, s.time ? new Date(s.time) : null, s.latitude, s.longitude);
        res.status(201).json({ message: 'SOS alert created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RESOLVE SOS ALERT
router.put('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        await prisma.$executeRawUnsafe('UPDATE sos_alerts SET is_resolved = TRUE WHERE alert_key = ?', key);
        res.json({ message: 'SOS alert resolved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
