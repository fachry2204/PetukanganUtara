const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET ALL ATTENDANCE
router.get('/', async (req, res) => {
    try {
        const rows = await prisma.$queryRawUnsafe('SELECT * FROM attendance ORDER BY timestamp DESC');
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
            const existing = await prisma.$queryRawUnsafe(
                'SELECT id FROM attendance WHERE staff_id = ? AND type = ? AND jadwal_id = ? AND DATE(timestamp) = ?',
                a.staffId, a.type, a.jadwalId, today
            );
            if (existing.length > 0) {
                return res.status(400).json({ error: `Anda sudah melakukan ${a.type} untuk jadwal ini hari ini.` });
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(`
                INSERT INTO attendance (id, staff_id, type, timestamp, latitude, longitude, photo_url, nik, staff_name, address, jadwal_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, a.id, a.staffId, a.type, a.timestamp ? new Date(a.timestamp) : null, a.latitude, a.longitude, a.photoUrl, a.nik, a.staffName, a.address, a.jadwalId || null);

            let newStatus = 'Online';
            if (a.type === 'Istirahat') newStatus = 'Istirahat';
            else if (a.type === 'Absen Pulang') newStatus = 'Offline';
            else if (a.type === 'Absen Masuk' || a.type === 'Selesai Istirahat') newStatus = 'Online';

            await tx.$executeRawUnsafe(
                'UPDATE staff SET status = ?, latitude = ?, longitude = ? WHERE nik = ?',
                newStatus, a.latitude, a.longitude, a.nik
            );
        });

        // WA NOTIFICATION LOGIC
        try {
            const settingsRows = await prisma.$queryRawUnsafe('SELECT wa_gateway_config FROM settings WHERE id = "app_settings"');
            const config = JSON.parse(settingsRows[0]?.wa_gateway_config || '{}');
            
            if (config.enableAttendance) {
                const waService = require('../services/whatsappService');
                const d = new Date(a.timestamp);
                const timeStr = `${String(d.getUTCHours() + 7).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
                
                const staffRows = await prisma.$queryRawUnsafe('SELECT nomor_whatsapp FROM staff WHERE nik = ?', a.nik);
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
