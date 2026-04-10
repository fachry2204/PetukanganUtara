const express = require('express');
const router = express.Router();
const db = require('../db');
const NodeCache = require('node-cache');

// StdTTL: 60 seconds. Caching reduces database load for heavy read requests.
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// 1. GET ALL REPORTS (Optimized Query & Scalable Caching)
router.get('/', async (req, res) => {
    try {
        // Caching Logic Hit
        const cacheKey = 'all_reports';
        if (cache.has(cacheKey)) {
            return res.json(cache.get(cacheKey));
        }

        // Optimized Query: Only fetch what's needed, although here we fetch all, 
        // in production we add limits and pagination parsing.
        const limit = Number(req.query.limit) || 100; // Scalable defaults
        
        // Use Indexing and Limiting for Query optimization
        const [rows] = await db.query('SELECT * FROM reports ORDER BY timestamp DESC LIMIT ?', [limit]);
        
        // Parse JSON fields safely during mapping
        const reports = rows.map(r => ({
            ...r,
            assignedStaffIds: r.assigned_staff_ids, // Map snake_case db to camelCase js
            logs: r.logs,
            gpsArrival: r.gps_arrival ? JSON.parse(r.gps_arrival) : undefined
        }));

        // Set to Cache before returning
        cache.set(cacheKey, reports);
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE REPORT
router.post('/', async (req, res) => {
    const r = req.body;
    try {
        const sql = `
            INSERT INTO reports (id, ticket_number, title, description, category, reporter_name, reporter_nik, reporter_phone, location, latitude, longitude, status, timestamp, photo_url, priority, logs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            r.id, r.ticketNumber, r.title, r.description, r.category, r.reporterName, r.reporterNik, r.reporterPhone, r.location, r.latitude, r.longitude, r.status, r.timestamp, r.photoUrl, r.priority, JSON.stringify(r.logs)
        ]);
        
        // Invalidate Cache after mutation
        cache.del('all_reports');
        res.status(201).json({ message: 'Report created', data: r });
    } catch (err) {
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
            rejection_reason = ?, assigned_staff_ids = ?, estimation_time = ?
            WHERE id = ?
        `;
        await db.query(sql, [
            r.status, JSON.stringify(r.logs), r.photoArrival, r.photoCompletion, r.photoRevision,
            r.rejectionReason, JSON.stringify(r.assignedStaffIds), r.estimationTime, id
        ]);
        
        // Invalidate Cache after mutation to ensure real-time accuracy for next read
        cache.del('all_reports');
        res.json({ message: 'Report updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
