const express = require('express');
const router = express.Router();
const db = require('../db');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// GET USERS
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'all_users';
        if (cache.has(cacheKey)) {
            return res.json(cache.get(cacheKey));
        }

        const [rows] = await db.query('SELECT * FROM users');
        cache.set(cacheKey, rows);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE USER
router.post('/', async (req, res) => {
    const u = req.body;
    try {
        const sql = `
            INSERT INTO users (id, username, name, email, nik, role, avatar, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            u.id, u.username, u.name, u.email, u.nik, u.role, u.avatar, u.password
        ]);
        cache.del('all_users');
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE USER
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const u = req.body;
    try {
        const sql = `
            UPDATE users SET 
            username = ?, name = ?, email = ?, nik = ?, role = ?, avatar = ?, password = ?
            WHERE id = ?
        `;
        await db.query(sql, [
            u.username, u.name, u.email, u.nik, u.role, u.avatar, u.password, id
        ]);
        cache.del('all_users');
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE USER
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        cache.del('all_users');
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
