const express = require('express');
const router = express.Router();
const db = require('../db');
const NodeCache = require('node-cache');
const bcrypt = require('bcryptjs');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// LOGIN ENDPOINT
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const sql = 'SELECT * FROM users WHERE (username = ? OR email = ? OR nik = ?)';
        const [rows] = await db.query(sql, [identifier, identifier, identifier]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        const user = rows[0];

        // Verifikasi password menggunakan bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            // Fallback for plaintext (if still in migration phase)
            if (user.password === password) {
                console.log('⚠️ Login successful using plaintext fallback for user:', user.username);
            } else {
                return res.status(401).json({ error: 'Password salah.' });
            }
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

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
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(u.password, 10);
        
        const sql = `
            INSERT INTO users (id, username, name, email, nik, role, avatar, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            u.id, u.username, u.name, u.email, u.nik, u.role, u.avatar, hashedPassword
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
        let sql = `
            UPDATE users SET 
            username = ?, name = ?, email = ?, nik = ?, role = ?, avatar = ?
        `;
        const params = [u.username, u.name, u.email, u.nik, u.role, u.avatar];

        // Jika password diisi, hash dan tambahkan ke query
        if (u.password && u.password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(u.password, 10);
            sql += `, password = ?`;
            params.push(hashedPassword);
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);
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
