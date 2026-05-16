const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const NodeCache = require('node-cache');
const bcrypt = require('bcryptjs');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// LOGIN ENDPOINT
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await prisma.users.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { email: identifier },
                    { nik: identifier }
                ]
            }
        });

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

        const users = await prisma.users.findMany();
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
        
        await prisma.users.create({
            data: {
                id: u.id,
                username: u.username,
                name: u.name,
                email: u.email,
                nik: u.nik,
                role: u.role,
                avatar: u.avatar,
                password: hashedPassword
            }
        });
        
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

        await prisma.$transaction(async (tx) => {
            await tx.users.update({
                where: { id: id },
                data: updateData
            });

            if (u.nik) {
                // Check if staff exists before updating to avoid errors if missing
                const staffExists = await tx.staff.findFirst({ where: { nik: u.nik } });
                if (staffExists) {
                    await tx.staff.updateMany({
                        where: { nik: u.nik },
                        data: {
                            nama_lengkap: u.name,
                            foto_profile: u.avatar
                        }
                    });
                }
            }
        });

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
        await prisma.$transaction(async (tx) => {
            const user = await tx.users.findUnique({
                where: { id: id },
                select: { nik: true }
            });

            if (user && user.nik) {
                await tx.staff.deleteMany({
                    where: { nik: user.nik }
                });
            }

            await tx.users.delete({
                where: { id: id }
            });
        });

        cache.del('all_users');
        res.json({ message: 'User and associated Staff deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
