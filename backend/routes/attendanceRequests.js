const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET ALL REQUESTS
router.get('/', async (req, res) => {
    try {
        const rows = await prisma.$queryRawUnsafe('SELECT * FROM attendance_requests ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET REQUESTS FOR SPECIFIC NIK
router.get('/my/:nik', async (req, res) => {
    try {
        const rows = await prisma.$queryRawUnsafe('SELECT * FROM attendance_requests WHERE nik = ? ORDER BY created_at DESC', req.params.nik);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE NEW REQUEST
router.post('/', async (req, res) => {
    const { staff_id, nik, staff_name, request_date } = req.body;
    try {
        const existing = await prisma.$queryRawUnsafe(
            'SELECT id FROM attendance_requests WHERE nik = ? AND request_date = ? AND status = "PENDING"',
            nik, request_date
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Anda sudah mengirim permintaan untuk tanggal ini dan sedang menunggu verifikasi.' });
        }

        await prisma.$executeRawUnsafe(
            'INSERT INTO attendance_requests (staff_id, nik, staff_name, request_date) VALUES (?, ?, ?, ?)',
            staff_id, nik, staff_name, request_date ? new Date(request_date) : null
        );
        res.status(201).json({ message: 'Request submitted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE REQUEST STATUS (APPROVE/REJECT)
router.put('/:id', async (req, res) => {
    const { status, approved_by } = req.body;
    try {
        await prisma.$executeRawUnsafe(
            'UPDATE attendance_requests SET status = ?, approved_by = ? WHERE id = ?',
            status, approved_by, parseInt(req.params.id)
        );
        res.json({ message: 'Request status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
