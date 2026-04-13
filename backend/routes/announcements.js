const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL ANNOUNCEMENTS
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM announcements ORDER BY date DESC');
        const mapped = rows.map(r => ({
            id: r.id,
            title: r.title,
            content: r.content,
            targetRole: r.target_role,
            targetUserId: r.target_user_id,
            authorName: r.author_name,
            authorRole: r.author_role,
            date: r.date,
            priority: r.priority,
            image: r.image_url,
            startDate: r.start_date,
            endDate: r.end_date
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE ANNOUNCEMENT
router.post('/', async (req, res) => {
    const a = req.body;
    try {
        const sql = `
            INSERT INTO announcements (id, title, content, target_role, target_user_id, author_name, author_role, date, priority, image_url, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            a.id, a.title, a.content, a.targetRole, a.targetUserId, a.authorName, a.authorRole, a.date, a.priority, a.image, a.startDate, a.endDate
        ]);

        // WA NOTIFICATION LOGIC
        try {
            const [settingsRows] = await db.query('SELECT wa_gateway_config FROM settings WHERE id = "app_settings"');
            const config = JSON.parse(settingsRows[0]?.wa_gateway_config || '{}');
            
            if (config.enableAnnouncements) {
                const waService = require('../services/whatsappService');
                
                let query = 'SELECT nomor_whatsapp FROM staff WHERE nomor_whatsapp IS NOT NULL AND nomor_whatsapp != ""';
                let params = [];

                if (a.targetRole && a.targetRole !== 'ALL') {
                    query = `
                        SELECT s.nomor_whatsapp 
                        FROM staff s
                        JOIN users u ON s.nik = u.nik
                        WHERE u.role = ? AND s.nomor_whatsapp IS NOT NULL AND s.nomor_whatsapp != ""
                    `;
                    params = [a.targetRole];
                } else if (a.targetUserId) {
                    query = `
                        SELECT s.nomor_whatsapp 
                        FROM staff s 
                        LEFT JOIN users u ON s.nik = u.nik
                        WHERE (s.nik = ? OR s.id = ? OR u.username = ? OR u.id = ?) 
                        AND s.nomor_whatsapp IS NOT NULL AND s.nomor_whatsapp != ""
                    `;
                    params = [a.targetUserId, a.targetUserId, a.targetUserId, a.targetUserId];
                }

                const [recipients] = await db.query(query, params);
                
                if (recipients.length === 0) {
                    await waService.logToDb(a.targetUserId || a.targetRole || 'Broadcast', a.title, 'TEXT', 'FAILED', 'No matching recipients with valid WA numbers found');
                }

                const message = `📢 *PENGUMUMAN BARU*\n\n*Judul:* ${a.title}\n*Prioritas:* ${a.priority || 'NORMAL'}\n*Oleh:* ${a.authorName}\n\n*Isi:* ${a.content}\n\nSilahkan cek dashboard aplikasi untuk detail selengkapnya.`;
                
                // Helper for delay
                const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                const delayMs = (config.messageDelay || 0) * 1000;

                for (const member of recipients) {
                    if (a.image) {
                        await waService.sendMessageWithMedia(member.nomor_whatsapp, message, a.image);
                    } else {
                        await waService.sendMessage(member.nomor_whatsapp, message);
                    }
                    
                    if (delayMs > 0 && recipients.indexOf(member) < recipients.length - 1) {
                        console.log(`Waiting ${config.messageDelay}s before next message...`);
                        await sleep(delayMs);
                    }
                }
            }
        } catch (waErr) {
            console.error('Failed to send Announcement WA:', waErr);
            try {
                const waService = require('../services/whatsappService');
                await waService.logToDb('SYSTEM', a.title, 'ERROR', 'FAILED', waErr.message);
            } catch (innerErr) {}
        }

        res.status(201).json({ message: 'Announcement created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE ANNOUNCEMENT
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
