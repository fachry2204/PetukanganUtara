const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL ANNOUNCEMENTS
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM announcements ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE ANNOUNCEMENT
router.post('/', async (req, res) => {
    const a = req.body;
    try {
        const sql = `
            INSERT INTO announcements (id, title, content, target_role, target_user_id, author_name, author_role, date, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            a.id, a.title, a.content, a.targetRole, a.targetUserId, a.authorName, a.authorRole, a.date, a.priority
        ]);
        res.status(201).json({ message: 'Announcement created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
