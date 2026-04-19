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

        const [rows] = await db.query('SELECT * FROM staff'); // Assuming table size is small, otherwise add LIMIT
        const staff = rows.map(s => ({
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
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert into staff table
        const sqlStaff = `
            INSERT INTO staff (id, nik, nomor_anggota, nama_lengkap, jenis_kelamin, status, foto_profile, alamat_lengkap, nomor_whatsapp, latitude, longitude, total_tugas_berhasil, tanggal_masuk)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(sqlStaff, [
            s.id, s.nik, s.nomorAnggota, s.namaLengkap, s.jenisKelamin, s.status, s.fotoProfile, s.alamatLengkap, s.nomorWhatsapp, s.latitude, s.longitude, s.totalTugasBerhasil, s.tanggalMasuk
        ]);

        // 2. Automatically create User account for this staff
        // Password standard "123"
        const hashedPassword = await bcrypt.hash('123', 10);
        const userId = `USER-${Date.now()}`;
        
        const sqlUser = `
            INSERT INTO users (id, username, name, email, nik, role, avatar, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(sqlUser, [
            userId, s.nik, s.namaLengkap, s.email || `${s.nik}@sipetut.local`, s.nik, 'ppsu', s.fotoProfile, hashedPassword
        ]);

        await connection.commit();
        cache.del('all_staff');
        res.status(201).json({ message: 'Staff and User created' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// UPDATE STAFF
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const s = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update staff table
        const sqlStaff = `
            UPDATE staff SET 
            nik = ?, nomor_anggota = ?, nama_lengkap = ?, jenis_kelamin = ?, 
            status = ?, foto_profile = ?, alamat_lengkap = ?, nomor_whatsapp = ?, 
            latitude = ?, longitude = ?, total_tugas_berhasil = ?
            WHERE id = ?
        `;
        await connection.query(sqlStaff, [
            s.nik, s.nomorAnggota, s.namaLengkap, s.jenisKelamin, 
            s.status, s.fotoProfile, s.alamatLengkap, s.nomorWhatsapp, 
            s.latitude, s.longitude, s.totalTugasBerhasil, id
        ]);

        // 2. Update corresponding user table
        const sqlUser = `
            UPDATE users SET name = ?, avatar = ?
            WHERE nik = ?
        `;
        await connection.query(sqlUser, [s.namaLengkap, s.fotoProfile, s.nik]);

        await connection.commit();
        cache.del('all_staff');
        res.json({ message: 'Staff and User updated' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// DELETE STAFF
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get NIK before deleting staff to also delete the user
        const [staffRows] = await connection.query('SELECT nik FROM staff WHERE id = ?', [id]);
        if (staffRows.length > 0) {
            const nik = staffRows[0].nik;
            // Delete from users table using nik
            await connection.query('DELETE FROM users WHERE nik = ?', [nik]);
        }

        // Delete from staff table
        await connection.query('DELETE FROM staff WHERE id = ?', [id]);

        await connection.commit();
        cache.del('all_staff');
        res.json({ message: 'Staff and associated User deleted' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
