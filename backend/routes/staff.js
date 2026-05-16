const express = require('express');
const router = express.Router();
const db = require('../db');
const NodeCache = require('node-cache');
const bcrypt = require('bcryptjs');

// StdTTL: 5 seconds for Staff to ensure status changes (like 'Istirahat') are visible quickly
const cache = new NodeCache({ stdTTL: 5, checkperiod: 10 });

// GET STAFF (Optimized and Cached)
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'all_staff';
        if (cache.has(cacheKey)) {
            return res.json(cache.get(cacheKey));
        }

        const staffList = await db.execute('SELECT * FROM staff').then(res => res[0]);
        const staff = staffList.map(s => ({
            id: s.id,
            nik: s.nik,
            nomorAnggota: s.nomor_anggota,
            namaLengkap: s.nama_lengkap,
            jenisKelamin: s.jenis_kelamin,
            status: s.status,
            fotoProfile: s.foto_profile,
            alamatLengkap: s.alamat_lengkap,
            nomorWhatsapp: s.nomor_whatsapp,
            latitude: s.latitude,
            longitude: s.longitude,
            totalTugasBerhasil: s.total_tugas_berhasil,
            tanggalMasuk: s.tanggal_masuk
        }));

        cache.set(cacheKey, staff);
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE STAFF
router.post('/', async (req, res) => {
    const s = req.body;
    try {
        const hashedPassword = await bcrypt.hash('123', 10);
        const userId = `USER-${Date.now()}`;
        
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            await conn.execute(
                'INSERT INTO staff (id, nik, nomor_anggota, nama_lengkap, jenis_kelamin, status, foto_profile, alamat_lengkap, nomor_whatsapp, latitude, longitude, total_tugas_berhasil, tanggal_masuk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [s.id, s.nik, s.nomorAnggota, s.namaLengkap, s.jenisKelamin, s.status, s.fotoProfile, s.alamatLengkap, s.nomorWhatsapp, s.latitude, s.longitude, s.totalTugasBerhasil, s.tanggalMasuk ? new Date(s.tanggalMasuk) : null]
            );

            await conn.execute(
                'INSERT INTO users (id, username, name, email, nik, role, avatar, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, s.nik, s.namaLengkap, s.email || `${s.nik}@sipetut.local`, s.nik, 'ppsu', s.fotoProfile, hashedPassword]
            );

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        cache.del('all_staff');
        res.status(201).json({ message: 'Staff and User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE STAFF
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const s = req.body;
    try {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            await conn.execute(
                'UPDATE staff SET nik=?, nomor_anggota=?, nama_lengkap=?, jenis_kelamin=?, status=?, foto_profile=?, alamat_lengkap=?, nomor_whatsapp=?, latitude=?, longitude=?, total_tugas_berhasil=? WHERE id=?',
                [s.nik, s.nomorAnggota, s.namaLengkap, s.jenisKelamin, s.status, s.fotoProfile, s.alamatLengkap, s.nomorWhatsapp, s.latitude, s.longitude, s.totalTugasBerhasil, id]
            );

            const [userExists] = await conn.execute('SELECT nik FROM users WHERE nik = ? LIMIT 1', [s.nik]);
            if (userExists.length > 0) {
                await conn.execute(
                    'UPDATE users SET name=?, avatar=? WHERE nik=?',
                    [s.namaLengkap, s.fotoProfile, s.nik]
                );
            }

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        cache.del('all_staff');
        res.json({ message: 'Staff and User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE STAFF
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            const [staff] = await conn.execute('SELECT nik FROM staff WHERE id = ? LIMIT 1', [id]);
            if (staff.length > 0 && staff[0].nik) {
                await conn.execute('DELETE FROM users WHERE nik = ?', [staff[0].nik]);
            }
            await conn.execute('DELETE FROM staff WHERE id = ?', [id]);
            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        cache.del('all_staff');
        res.json({ message: 'Staff and associated User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
