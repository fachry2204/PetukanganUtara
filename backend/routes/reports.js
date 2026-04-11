const express = require('express');
const router = express.Router();
const db = require('../db');
const NodeCache = require('node-cache');

// StdTTL: 60 seconds. Caching reduces database load for heavy read requests.
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// 1. GET ALL REPORTS (Optimized Query & Scalable Caching)
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'all_reports';
        if (cache.has(cacheKey)) {
            return res.json(cache.get(cacheKey));
        }

        const limit = Number(req.query.limit) || 100;
        const [rows] = await db.query('SELECT * FROM reports ORDER BY timestamp DESC LIMIT ?', [limit]);
        
        const reports = rows.map(r => {
            // Helper to parse JSON safely
            const safeParse = (str) => {
                if (!str) return [];
                try { return typeof str === 'string' ? JSON.parse(str) : str; }
                catch (e) { return []; }
            };

            return {
                id: r.id,
                ticketNumber: r.ticket_number,
                judulTugas: r.title, // Mapping title to judulTugas
                deskripsi: r.description, // Mapping description to deskripsi
                kategori: r.category,
                reporterName: r.reporter_name,
                reporterNik: r.reporter_nik,
                reporterPhone: r.reporter_phone,
                lokasi: r.location,
                latitude: r.latitude,
                longitude: r.longitude,
                status: r.status,
                timestamp: r.timestamp,
                photoUrl: r.photo_url,
                priority: r.priority,
                logs: safeParse(r.logs),
                assignedStaffIds: safeParse(r.assigned_staff_ids),
                fotoSebelum: r.foto_sebelum,
                fotoSedang: r.foto_sedang,
                fotoSesudah: r.foto_sesudah,
                rejectionReason: r.rejection_reason,
                estimationTime: r.estimation_time
            };
        });

        cache.set(cacheKey, reports);
        res.json(reports);
    } catch (err) {
        console.error("GET reports error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE REPORT
router.post('/', async (req, res) => {
    const r = req.body;
    try {
        const sql = `
            INSERT INTO reports (id, ticket_number, title, description, category, reporter_name, reporter_nik, reporter_phone, location, latitude, longitude, status, timestamp, photo_url, priority, logs, foto_sebelum, foto_sedang, foto_sesudah)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            r.id, r.ticketNumber, r.judulTugas || r.title, r.deskripsi || r.description, r.kategori || r.category, r.reporterName, r.reporterNik, r.reporterPhone, r.lokasi || r.location, r.latitude, r.longitude, r.status, r.timestamp, r.photoUrl, r.priority, JSON.stringify(r.logs || []),
            r.fotoSebelum, r.fotoSedang, r.fotoSesudah
        ]);
        
        cache.del('all_reports');
        res.status(201).json(r); // Return the object directly
    } catch (err) {
        console.error("POST reports error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE REPORT STATUS
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const r = req.body;
    try {
        const sql = `
            UPDATE reports SET 
            status = ?, logs = ?, photo_arrival = ?, photo_completion = ?, photo_revision = ?, 
            rejection_reason = ?, assigned_staff_ids = ?, estimation_time = ?,
            foto_sebelum = ?, foto_sedang = ?, foto_sesudah = ?
            WHERE id = ?
        `;
        await db.query(sql, [
            r.status, JSON.stringify(r.logs), r.photoArrival, r.photoCompletion, r.photoRevision,
            r.rejectionReason, JSON.stringify(r.assignedStaffIds), r.estimationTime,
            r.fotoSebelum, r.fotoSedang, r.fotoSesudah, id
        ]);
        
        // Invalidate Cache after mutation to ensure real-time accuracy for next read
        cache.del('all_reports');
        res.json({ message: 'Report updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
