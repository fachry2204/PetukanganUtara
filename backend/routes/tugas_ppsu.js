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
        
        const tugas = rows.map(r => {
            const safeParse = (str) => {
                if (!str) return [];
                try { return typeof str === 'string' ? JSON.parse(str) : str; }
                catch (e) { return []; }
            };

            return {
                id: r.id,
                judulTugas: r.judul_tugas,
                deskripsi: r.deskripsi,
                kategori: r.kategori,
                lokasi: r.lokasi,
                latitude: r.latitude,
                longitude: r.longitude,
                status: r.status,
                timestamp: r.timestamp,
                fotoSebelum: r.foto_sebelum,
                fotoSedang: r.foto_sedang, // Added
                fotoSesudah: r.foto_sesudah,
                priority: r.priority,
                logs: safeParse(r.logs),
                reporterName: r.reporter_name,
                reporterNik: r.reporter_nik,
                staffId: r.staff_id,
                alasanPenolakan: r.alasan_penolakan
            };
        });

        cache.set(cacheKey, tugas);
        res.json(tugas);
    } catch (err) {
        console.error("GET tugas_ppsu error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE TUGAS PPSU
router.post('/', async (req, res) => {
    const t = req.body;
    try {
        const sql = `
            INSERT INTO tugas_ppsu (id, judul_tugas, deskripsi, kategori, lokasi, latitude, longitude, status, timestamp, foto_sebelum, foto_sedang, foto_sesudah, priority, logs, reporter_name, reporter_nik)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            t.id, t.judulTugas, t.deskripsi, t.kategori, t.lokasi, t.latitude, t.longitude, t.status, t.timestamp, t.fotoSebelum, t.fotoSedang, t.fotoSesudah, t.priority, JSON.stringify(t.logs || []), t.reporterName, t.reporterNik
        ]);
        
        // WA NOTIFICATION LOGIC
        try {
            const [settingsRows] = await db.query('SELECT wa_gateway_config FROM settings WHERE id = "app_settings"');
            const config = JSON.parse(settingsRows[0]?.wa_gateway_config || '{}');
            
            if (config.enableTasks) {
                const waService = require('../services/whatsappService');
                const [staffRows] = await db.query('SELECT nomor_whatsapp FROM staff WHERE nik = ?', [t.reporterNik]);
                const staffPhone = staffRows[0]?.nomor_whatsapp;

                if (staffPhone) {
                    const message = `🛠️ *LAPORAN TUGAS BARU*\n\nHalo *${t.reporterName}*,\n\nTugas Anda: *${t.judulTugas}* telah dibuat.\n\n*Kategori:* ${t.kategori}\n*Lokasi:* ${t.lokasi}\n*Status:* ${t.status}\n\nTetap semangat bertugas!`;
                    if (t.fotoSebelum) {
                        await waService.sendMessageWithMedia(staffPhone, message, t.fotoSebelum);
                    } else {
                        await waService.sendMessage(staffPhone, message);
                    }
                }
            }
        } catch (waErr) {
            console.error('Failed to send Task WA:', waErr);
        }

        cache.del('all_tugas_ppsu');
        res.status(201).json(t); // Return object directly
    } catch (err) {
        console.error("POST tugas_ppsu error:", err);
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
            status = ?, logs = ?, foto_sebelum = ?, foto_sedang = ?, foto_sesudah = ?, 
            alasan_penolakan = ?, staff_id = ?, priority = ?
            WHERE id = ?
        `;
        await db.query(sql, [
            t.status, JSON.stringify(t.logs || []), t.fotoSebelum, t.fotoSedang, t.fotoSesudah,
            t.alasanPenolakan, t.staffId, t.priority, id
        ]);
        
        // WA NOTIFICATION LOGIC FOR UPDATES
        try {
            const [settingsRows] = await db.query('SELECT wa_gateway_config FROM settings WHERE id = "app_settings"');
            const config = JSON.parse(settingsRows[0]?.wa_gateway_config || '{}');
            
            if (config.enableTasks) {
                const waService = require('../services/whatsappService');
                const [staffRows] = await db.query('SELECT nomor_whatsapp FROM staff WHERE nik = ?', [t.reporterNik]);
                const staffPhone = staffRows[0]?.nomor_whatsapp;

                if (staffPhone) {
                    let photoToSend = null;
                    let stageText = "Update";

                    // Determine which photo is "newest" or most relevant for the update
                    if (t.fotoSesudah) {
                        photoToSend = t.fotoSesudah;
                        stageText = "Selesai Tugas (Setelah)";
                    } else if (t.fotoSedang) {
                        photoToSend = t.fotoSedang;
                        stageText = "Sedang Dikerjakan";
                    } else if (t.fotoSebelum) {
                        photoToSend = t.fotoSebelum;
                        stageText = "Persiapan (Sebelum)";
                    }

                    const message = `📝 *UPDATE STATUS TUGAS*\n\nHalo *${t.reporterName}*,\n\nTugas: *${t.judulTugas}*\nStatus: *${t.status}*\nTahap: *${stageText}*\n\nTerima kasih atas laporannya.`;
                    
                    if (photoToSend) {
                        await waService.sendMessageWithMedia(staffPhone, message, photoToSend);
                    } else {
                        await waService.sendMessage(staffPhone, message);
                    }
                }
            }
        } catch (waErr) {
            console.error('Failed to send Task Update WA:', waErr);
        }

        cache.del('all_tugas_ppsu');
        res.json({ message: 'Tugas PPSU updated', data: t });
    } catch (err) {
        console.error("PUT tugas_ppsu error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
