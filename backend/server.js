
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Limit besar untuk upload base64 image
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// --- ROUTES ---

// 1. GET ALL REPORTS
app.get('/api/reports', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reports ORDER BY timestamp DESC');
        // Parse JSON fields
        const reports = rows.map(r => ({
            ...r,
            assignedStaffIds: r.assigned_staff_ids, // Map snake_case db to camelCase js
            logs: r.logs,
            gpsArrival: r.gps_arrival ? JSON.parse(r.gps_arrival) : undefined
        }));
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE REPORT
app.post('/api/reports', async (req, res) => {
    const r = req.body;
    try {
        const sql = `
            INSERT INTO reports (id, ticket_number, title, description, category, reporter_name, reporter_nik, reporter_phone, location, latitude, longitude, status, timestamp, photo_url, priority, logs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            r.id, r.ticketNumber, r.title, r.description, r.category, r.reporterName, r.reporterNik, r.reporterPhone, r.location, r.latitude, r.longitude, r.status, r.timestamp, r.photoUrl, r.priority, JSON.stringify(r.logs)
        ]);
        res.status(201).json({ message: 'Report created', data: r });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE REPORT STATUS
app.put('/api/reports/:id', async (req, res) => {
    const { id } = req.params;
    const r = req.body; // Updated report object
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
        res.json({ message: 'Report updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. GET CITIZENS
app.get('/api/citizens', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM citizens ORDER BY nama_lengkap ASC');
        // Mapping snake_case to camelCase matches frontend types
        const citizens = rows.map(c => ({
            id: c.id,
            nik: c.nik,
            kk: c.kk,
            namaLengkap: c.nama_lengkap,
            jenisKelamin: c.jenis_kelamin,
            tempatLahir: c.tempat_lahir,
            tanggalLahir: c.tanggal_lahir,
            agama: c.agama,
            statusPerkawinan: c.status_perkawinan,
            pekerjaan: c.pekerjaan,
            nomorWhatsapp: c.nomor_whatsapp,
            fotoWajah: c.foto_wajah,
            alamat: c.alamat,
            rt: c.rt,
            rw: c.rw,
            kelurahan: c.kelurahan,
            kecamatan: c.kecamatan,
            kota: c.kota,
            provinsi: c.provinsi,
            statusKtp: c.status_ktp,
            kewarganegaraan: c.kewarganegaraan,
            latitude: c.latitude,
            longitude: c.longitude
        }));
        res.json(citizens);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. CREATE CITIZEN
app.post('/api/citizens', async (req, res) => {
    const c = req.body;
    try {
        const sql = `
            INSERT INTO citizens (id, nik, kk, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, status_perkawinan, pekerjaan, nomor_whatsapp, foto_wajah, alamat, rt, rw, kelurahan, kecamatan, kota, provinsi, status_ktp, kewarganegaraan, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            c.id, c.nik, c.kk, c.namaLengkap, c.jenisKelamin, c.tempatLahir, c.tanggalLahir, c.agama, c.statusPerkawinan, c.pekerjaan, c.nomorWhatsapp, c.fotoWajah, c.alamat, c.rt, c.rw, c.kelurahan, c.kecamatan, c.kota, c.provinsi, c.statusKtp, c.kewarganegaraan, c.latitude, c.longitude
        ]);
        res.status(201).json({ message: 'Citizen created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. GET STAFF
app.get('/api/staff', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM staff');
        const staff = rows.map(s => ({
            id: s.id,
            nik: s.nik,
            nomorAnggota: s.nomor_anggota,
            namaLengkap: s.nama_lengkap,
            jenisKelamin: s.jenis_kelamin,
            status: s.status,
            fotoProfile: s.foto_profile,
            alamatLengkap: s.alamat_lengkap,
            nomorWhatsapp: s.nomor_whatsapp,
            latitude: s.latitude,
            longitude: s.longitude,
            totalTugasBerhasil: s.total_tugas_berhasil,
            tanggalMasuk: s.tanggal_masuk
        }));
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. GET SERVICE REQUESTS
app.get('/api/services', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM service_requests ORDER BY request_date DESC');
        const services = rows.map(s => ({
            id: s.id,
            ticketNumber: s.ticket_number,
            rtLetterNumber: s.rt_letter_number,
            letterNumber: s.letter_number,
            requestDate: s.request_date,
            completionDate: s.completion_date,
            type: s.type,
            applicantNik: s.applicant_nik,
            applicantName: s.applicant_name,
            applicantPhone: s.applicant_phone,
            status: s.status,
            notes: s.notes,
            documents: s.documents,
            signedLetterUrl: s.signed_letter_url,
            logs: s.logs
        }));
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. CREATE SERVICE REQUEST
app.post('/api/services', async (req, res) => {
    const s = req.body;
    try {
        const sql = `
            INSERT INTO service_requests (id, ticket_number, rt_letter_number, request_date, type, applicant_nik, applicant_name, applicant_phone, status, notes, documents, logs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            s.id, s.ticketNumber, s.rtLetterNumber, s.requestDate, s.type, s.applicantNik, s.applicantName, s.applicantPhone, s.status, s.notes, JSON.stringify(s.documents), JSON.stringify(s.logs)
        ]);
        res.status(201).json({ message: 'Service request created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
