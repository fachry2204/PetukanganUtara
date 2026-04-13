const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL JADWAL
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT j.*, s.nama_lengkap, s.nomor_anggota, s.nik
            FROM jadwal_ppsu j 
            JOIN staff s ON j.staff_id = s.id 
            ORDER BY j.date DESC, j.timestamp DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE JADWAL
router.post('/', async (req, res) => {
    const j = req.body;
    try {
        const sql = `
            INSERT INTO jadwal_ppsu (id, staff_id, date, day, shift, start_time, end_time, area, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            j.id, j.staffId, j.date, j.day, j.shift, j.startTime, j.endTime, j.area, new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]);

        // WA NOTIFICATION LOGIC
        try {
            const [settingsRows] = await db.query('SELECT wa_gateway_config FROM settings WHERE id = "app_settings"');
            const config = JSON.parse(settingsRows[0]?.wa_gateway_config || '{}');
            
            if (config.enableTasks) {
                const waService = require('../services/whatsappService');
                const [staffRows] = await db.query('SELECT nama_lengkap, nomor_whatsapp FROM staff WHERE id = ?', [j.staffId]);
                
                if (staffRows.length > 0 && staffRows[0].nomor_whatsapp) {
                    const s = staffRows[0];
                    const dateStr = new Date(j.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                    
                    const message = `📋 *PENUGASAN BARU*\n\nHalo *${s.nama_lengkap}*,\n\nAnda memiliki tugas baru:\n*Tanggal:* ${dateStr}\n*Shift:* ${j.shift}\n*Waktu:* ${j.startTime} - ${j.endTime}\n*Zona:* ${j.area}\n\nTetap semangat dan jaga kesehatan! 💪`;
                    
                    await waService.sendMessage(s.nomor_whatsapp, message);
                }
            }
        } catch (waErr) {
            console.error('Failed to send Task WA:', waErr);
        }

        res.status(201).json({ message: 'Jadwal created', id: j.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE JADWAL
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM jadwal_ppsu WHERE id = ?', [req.params.id]);
        res.json({ message: 'Jadwal deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
