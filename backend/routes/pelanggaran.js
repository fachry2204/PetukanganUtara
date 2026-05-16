const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET ALL VIOLATIONS
router.get('/', async (req, res) => {
    try {
        const rows = await prisma.$queryRawUnsafe('SELECT * FROM pelanggaran ORDER BY timestamp DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOG A VIOLATION
router.post('/', async (req, res) => {
    const v = req.body;
    try {
        await prisma.$executeRawUnsafe(`
            INSERT INTO pelanggaran (user_id, ppsu_name, device_info, violation_type)
            VALUES (?, ?, ?, ?)
        `, v.userId, v.ppsuName, v.deviceInfo, v.violationType);
        res.status(201).json({ message: 'Violation logged' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE A VIOLATION
router.delete('/:id', async (req, res) => {
    try {
        await prisma.$executeRawUnsafe('DELETE FROM pelanggaran WHERE id = ?', req.params.id);
        res.json({ message: 'Violation deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
