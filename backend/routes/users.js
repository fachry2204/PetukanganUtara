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
        let user;
        try {
            // Coba menggunakan mysql2 langsung untuk bypass Prisma Engine (yang sering hang di Plesk)
            const mysql = require('mysql2/promise');
            const connection = await mysql.createConnection(process.env.DATABASE_URL.replace('?connect_timeout=10', ''));
            const [rows] = await connection.execute(
                'SELECT * FROM users WHERE username = ? OR email = ? OR nik = ? LIMIT 1',
                [identifier, identifier, identifier]
            );
            await connection.end();
            if (rows.length > 0) {
                user = rows[0];
            }
        } catch (mysqlErr) {
            console.error('MySQL2 Fallback Error:', mysqlErr.message);
            // Jika mysql2 gagal, biarkan error (berarti database benar-benar tidak bisa dihubungi)
            throw new Error('Database connection failed: ' + mysqlErr.message);
        }

        if (!user) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

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
        console.error('CRITICAL Login Error:', err.message);
        console.error('Error Details:', err);
        res.status(500).json({ 
            error: 'Terjadi kesalahan pada server database.',
            message: err.message,
            code: err.code
        });
    }
});

// GET USERS
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'all_users';
        if (cache.has(cacheKey)) {
            return res.json(cache.get(cacheKey));
        }

        const users = await db.execute('SELECT * FROM users').then(res => res[0]);
        cache.set(cacheKey, users);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE USER
router.post('/', async (req, res) => {
    const u = req.body;
    try {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        
        await db.execute(
            'INSERT INTO users (id, username, name, email, nik, role, avatar, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [u.id, u.username, u.name, u.email, u.nik, u.role, u.avatar, hashedPassword]
        );
        
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
        const updateData = {
            username: u.username,
            name: u.name,
            email: u.email,
            nik: u.nik,
            role: u.role,
            avatar: u.avatar
        };

        if (u.password && u.password.trim() !== '') {
            updateData.password = await bcrypt.hash(u.password, 10);
        }

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            let updateQuery = 'UPDATE users SET username=?, name=?, email=?, nik=?, role=?, avatar=?';
            let updateParams = [u.username, u.name, u.email, u.nik, u.role, u.avatar];

            if (u.password && u.password.trim() !== '') {
                updateQuery += ', password=?';
                updateParams.push(updateData.password);
            }
            updateQuery += ' WHERE id=?';
            updateParams.push(id);

            await conn.execute(updateQuery, updateParams);

            if (u.nik) {
                const [staffExists] = await conn.execute('SELECT nik FROM staff WHERE nik = ? LIMIT 1', [u.nik]);
                if (staffExists.length > 0) {
                    await conn.execute(
                        'UPDATE staff SET nama_lengkap=?, foto_profile=? WHERE nik=?',
                        [u.name, u.avatar, u.nik]
                    );
                }
            }

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        cache.del('all_users');
        res.json({ message: 'User and Staff updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE USER
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const [userRows] = await conn.execute('SELECT nik FROM users WHERE id = ? LIMIT 1', [id]);
            
            if (userRows.length > 0 && userRows[0].nik) {
                await conn.execute('DELETE FROM staff WHERE nik = ?', [userRows[0].nik]);
            }

            await conn.execute('DELETE FROM users WHERE id = ?', [id]);

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        cache.del('all_users');
        res.json({ message: 'User and associated Staff deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
