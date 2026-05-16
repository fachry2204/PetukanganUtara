const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL ATTENDANCE
router.get('/', async (req, res) => {
    try {
        const rows = await db.execute('SELECT * FROM attendance ORDER BY timestamp DESC').then(res => res[0]);
        const mapped = rows.map(r => ({
            id: r.id,
            staffId: r.staff_id,
            type: r.type,
            timestamp: r.timestamp,
            latitude: r.latitude,
            longitude: r.longitude,
            photo: r.photo_url,
            userNik: r.nik,
            userName: r.staff_name,
            address: r.address || 'Alamat tidak tercatat',
            jadwalId: r.jadwal_id
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE ATTENDANCE RECORD
router.post('/', async (req, res) => {
    const a = req.body;
    try {
        if (a.jadwalId) {
            const today = new Date(new Date().getTime() + 7 * 3600000).toISOString().split('T')[0];
            const existing = await db.execute(
                'SELECT id FROM attendance WHERE staff_id = ? AND type = ? AND jadwal_id = ? AND DATE(timestamp) = ?',
                a.staffId, a.type, a.jadwalId, today
            ).then(res => res[0]);
            if (existing.length > 0) {
                return res.status(400).json({ error: `Anda sudah melakukan ${a.type} untuk jadwal ini hari ini.` });
            }
        }

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            await conn.execute(`
                INSERT INTO attendance (id, staff_id, type, timestamp, latitude, longitude, photo_url, nik, staff_name, address, jadwal_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [a.id, a.staffId, a.type, a.timestamp ? new Date(a.timestamp) : null, a.latitude, a.longitude, a.photoUrl, a.nik, a.staffName, a.address, a.jadwalId || null]);

            let newStatus = 'Online';
            if (a.type === 'Istirahat') newStatus = 'Istirahat';
            else if (a.type === 'Absen Pulang') newStatus = 'Offline';
            else if (a.type === 'Absen Masuk' || a.type === 'Selesai Istirahat') newStatus = 'Online';

            await conn.execute(
                'UPDATE staff SET status = ?, latitude = ?, longitude = ? WHERE nik = ?',
                [newStatus, a.latitude, a.longitude, a.nik]
            );

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        // WA NOTIFICATION LOGIC
        try {
            const settingsRows = await db.execute('SELECT wa_gateway_config FROM settings WHERE id = "app_settings"').then(res => res[0]);
            const config = JSON.parse(settingsRows[0]?.wa_gateway_config || '{}');
            
            if (config.enableAttendance) {
                const waService = require('../services/whatsappService');
                const d = new Date(a.timestamp);
                const timeStr = `${String(d.getUTCHours() + 7).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
                
                const staffRows = await db.execute('SELECT nomor_whatsapp FROM staff WHERE nik = ?', a.nik).then(res => res[0]);
                const staffPhone = staffRows[0]?.nomor_whatsapp;

                const messageStaff = `✅ *ABSENSI BERHASIL*\n\nHalo *${a.staffName}*,\n\nAbsensi *${a.type}* Anda telah berhasil tercatat di sistem pada pukul *${timeStr}* WIB.\n\n*Lokasi:* ${a.address || 'Lokasi terdeteksi'}\n\nTerima kasih, selamat bertugas!`;

                if (staffPhone) {
                    if (a.photoUrl) {
                        await waService.sendMessageWithMedia(staffPhone, messageStaff, a.photoUrl);
                    } else {
                        await waService.sendMessage(staffPhone, messageStaff);
                    }
                }
            }
        } catch (waErr) {
            console.error('Failed to send Attendance WA:', waErr);
        }

        res.status(201).json({ message: 'Attendance recorded and staff status updated' });
    } catch (err) {
        console.error("Attendance POST error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
