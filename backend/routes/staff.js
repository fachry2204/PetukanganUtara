const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const NodeCache = require('node-cache');
const bcrypt = require('bcryptjs');

// StdTTL: 5 seconds for Staff to ensure status changes (like 'Istirahat') are visible quickly
const cache = new NodeCache({ stdTTL: 5, checkperiod: 10 });

// GET STAFF (Optimized and Cached)
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'all_staff';
        if (cache.has(cacheKey)) {
            return res.json(cache.get(cacheKey));
        }

        const staffList = await prisma.staff.findMany();
        const staff = staffList.map(s => ({
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

        cache.set(cacheKey, staff);
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE STAFF
router.post('/', async (req, res) => {
    const s = req.body;
    try {
        const hashedPassword = await bcrypt.hash('123', 10);
        const userId = `USER-${Date.now()}`;
        
        await prisma.$transaction(async (tx) => {
            await tx.staff.create({
                data: {
                    id: s.id, 
                    nik: s.nik, 
                    nomor_anggota: s.nomorAnggota, 
                    nama_lengkap: s.namaLengkap, 
                    jenis_kelamin: s.jenisKelamin, 
                    status: s.status, 
                    foto_profile: s.fotoProfile, 
                    alamat_lengkap: s.alamatLengkap, 
                    nomor_whatsapp: s.nomorWhatsapp, 
                    latitude: s.latitude, 
                    longitude: s.longitude, 
                    total_tugas_berhasil: s.totalTugasBerhasil, 
                    tanggal_masuk: s.tanggalMasuk ? new Date(s.tanggalMasuk) : null
                }
            });

            await tx.users.create({
                data: {
                    id: userId, 
                    username: s.nik, 
                    name: s.namaLengkap, 
                    email: s.email || `${s.nik}@sipetut.local`, 
                    nik: s.nik, 
                    role: 'ppsu', 
                    avatar: s.fotoProfile, 
                    password: hashedPassword
                }
            });
        });

        cache.del('all_staff');
        res.status(201).json({ message: 'Staff and User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE STAFF
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const s = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.staff.update({
                where: { id: id },
                data: {
                    nik: s.nik, 
                    nomor_anggota: s.nomorAnggota, 
                    nama_lengkap: s.namaLengkap, 
                    jenis_kelamin: s.jenisKelamin, 
                    status: s.status, 
                    foto_profile: s.fotoProfile, 
                    alamat_lengkap: s.alamatLengkap, 
                    nomor_whatsapp: s.nomorWhatsapp, 
                    latitude: s.latitude, 
                    longitude: s.longitude, 
                    total_tugas_berhasil: s.totalTugasBerhasil
                }
            });

            const userExists = await tx.users.findFirst({ where: { nik: s.nik } });
            if (userExists) {
                await tx.users.updateMany({
                    where: { nik: s.nik },
                    data: { name: s.namaLengkap, avatar: s.fotoProfile }
                });
            }
        });

        cache.del('all_staff');
        res.json({ message: 'Staff and User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE STAFF
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$transaction(async (tx) => {
            const staff = await tx.staff.findUnique({ where: { id: id }, select: { nik: true } });
            if (staff && staff.nik) {
                await tx.users.deleteMany({ where: { nik: staff.nik } });
            }
            await tx.staff.delete({ where: { id: id } });
        });

        cache.del('all_staff');
        res.json({ message: 'Staff and associated User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
