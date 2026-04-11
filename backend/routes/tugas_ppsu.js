const express = require('express');
const router = express.Router();
const db = require('../db');
const NodeCache = require('node-cache');

// StdTTL: 60 seconds. Caching reduces database load for heavy read requests.
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// 1. GET ALL TUGAS PPSU
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'all_tugas_ppsu';
        if (cache.has(cacheKey)) {
            return res.json(cache.get(cacheKey));
        }

        const limit = Number(req.query.limit) || 100;
        
        const [rows] = await db.query('SELECT * FROM tugas_ppsu ORDER BY timestamp DESC LIMIT ?', [limit]);
        
        const tugas = rows.map(r => ({
            ...r,
            judulTugas: r.judul_tugas,
            fotoSebelum: r.foto_sebelum,
            fotoSesudah: r.foto_sesudah,
            staffId: r.staff_id,
            alasanPenolakan: r.alasan_penolakan,
            reporterName: r.reporter_name,
            reporterNik: r.reporter_nik,
            logs: r.logs
        }));

        cache.set(cacheKey, tugas);
        res.json(tugas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE TUGAS PPSU
router.post('/', async (req, res) => {
    const t = req.body;
    try {
        const sql = `
            INSERT INTO tugas_ppsu (id, judul_tugas, deskripsi, kategori, lokasi, latitude, longitude, status, timestamp, foto_sebelum, priority, logs, reporter_name, reporter_nik)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            t.id, t.judulTugas, t.deskripsi, t.kategori, t.lokasi, t.latitude, t.longitude, t.status, t.timestamp, t.fotoSebelum, t.priority, JSON.stringify(t.logs), t.reporterName, t.reporterNik
        ]);
        
        cache.del('all_tugas_ppsu');
        res.status(201).json({ message: 'Tugas PPSU created', data: t });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE TUGAS PPSU
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const t = req.body;
    try {
        const sql = `
            UPDATE tugas_ppsu SET 
            status = ?, logs = ?, foto_sebelum = ?, foto_sesudah = ?, 
            alasan_penolakan = ?, staff_id = ?, priority = ?
            WHERE id = ?
        `;
        await db.query(sql, [
            t.status, JSON.stringify(t.logs), t.fotoSebelum, t.fotoSesudah,
            t.alasanPenolakan, t.staffId, t.priority, id
        ]);
        
        cache.del('all_tugas_ppsu');
        res.json({ message: 'Tugas PPSU updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
