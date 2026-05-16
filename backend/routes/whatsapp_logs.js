const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET ALL WA LOGS
router.get('/', async (req, res) => {
    try {
        const rows = await prisma.$queryRawUnsafe('SELECT * FROM wa_logs ORDER BY waktu DESC LIMIT 500');
        const mappedRows = rows.map(r => ({
            id: r.id,
            recipient: r.penerima,
            message: r.pesan,
            type: r.tipe,
            status: r.status,
            timestamp: r.waktu,
            error: r.error_detail
        }));
        res.json(mappedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE LOGS
router.delete('/:id', async (req, res) => {
    try {
        await prisma.$executeRawUnsafe('DELETE FROM wa_logs WHERE id = ?', req.params.id);
        res.json({ message: 'Log deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CLEAR ALL LOGS
router.delete('/', async (req, res) => {
    try {
        await prisma.$executeRawUnsafe('TRUNCATE TABLE wa_logs');
        res.json({ message: 'All logs cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RETRY MESSAGE
router.post('/retry/:id', async (req, res) => {
    try {
        const rows = await prisma.$queryRawUnsafe('SELECT * FROM wa_logs WHERE id = ?', req.params.id);
        if (rows.length === 0) return res.status(404).json({ error: 'Log not found' });
        
        const log = rows[0];
        const waService = require('../services/whatsappService');
        
        const success = await waService.sendMessage(log.penerima, log.pesan);
        
        if (success) {
            res.json({ message: 'Retry successful' });
        } else {
            const status = waService.getStatus().status;
            const errorMsg = status === 'CONNECTED' 
                ? 'Gagal mengirim pesan. Kemungkinan data sesi WA bermasalah.' 
                : 'WhatsApp tidak terhubung. Silakan hubungkan kembali di menu Pengaturan.';
            res.status(400).json({ error: errorMsg });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
