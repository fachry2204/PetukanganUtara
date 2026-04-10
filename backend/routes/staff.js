const express = require('express');
const router = express.Router();
const db = require('../db');
const NodeCache = require('node-cache');

// StdTTL: 300 seconds (5 minutes) for Staff as their data doesn't change every second
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

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
    try {
        const sql = `
            INSERT INTO staff (id, nik, nomor_anggota, nama_lengkap, jenis_kelamin, status, foto_profile, alamat_lengkap, nomor_whatsapp, latitude, longitude, total_tugas_berhasil, tanggal_masuk)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            s.id, s.nik, s.nomorAnggota, s.namaLengkap, s.jenisKelamin, s.status, s.fotoProfile, s.alamatLengkap, s.nomorWhatsapp, s.latitude, s.longitude, s.totalTugasBerhasil, s.tanggalMasuk
        ]);
        cache.del('all_staff'); // Invalidate Cache
        res.status(201).json({ message: 'Staff created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
