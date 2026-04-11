const db = require('./db');


// Mock data patterns matching the frontend types
const MOCK_USERS = [
  { id: 'USR-001', username: 'admin', name: 'Super Admin', email: 'admin@petukangan.go.id', nik: '3174000000000001', role: 'Administrator', avatar: 'https://i.pravatar.cc/150?u=admin', password: '123' },
  { id: 'USR-002', username: 'lurahlurah', name: 'H. Fachry, S.Sos', email: 'lurah@petukangan.go.id', nik: '3174000000000002', role: 'Pimpinan', avatar: 'https://i.pravatar.cc/150?u=lurah', password: '123' },
  { id: 'USR-003', username: 'staff1', name: 'Siti Aminah', email: 'siti@petukangan.go.id', nik: '3174000000000003', role: 'Staff Kelurahan', avatar: 'https://i.pravatar.cc/150?u=siti', password: '123' }
];

const MOCK_STAFF = [
  { id: 'PPSU-001', nik: '3174012345670001', nomor_anggota: 'PPSU-PTK-001', nama_lengkap: 'Bambang Sudirjo', jenis_kelamin: 'Laki-Laki', status: 'Online', foto_profile: 'https://i.pravatar.cc/150?u=bambang', alamat_lengkap: 'Jl. Damai No. 12, Petukangan Utara', nomor_whatsapp: '081234567890', latitude: -6.2345, longitude: 106.7456, total_tugas_berhasil: 45, tanggal_masuk: '2022-01-15' },
  { id: 'PPSU-002', nik: '3174012345670002', nomor_anggota: 'PPSU-PTK-002', nama_lengkap: 'Slamet Riyadi', jenis_kelamin: 'Laki-Laki', status: 'Bertugas', foto_profile: 'https://i.pravatar.cc/150?u=slamet', alamat_lengkap: 'Jl. Mawar No. 5, Petukangan Utara', nomor_whatsapp: '081234567891', latitude: -6.2367, longitude: 106.7489, total_tugas_berhasil: 32, tanggal_masuk: '2022-03-20' },
  { id: 'PPSU-003', nik: '3174012345670003', nomor_anggota: 'PPSU-PTK-003', nama_lengkap: 'Eko Prasetio', jenis_kelamin: 'Laki-Laki', status: 'Istirahat', foto_profile: 'https://i.pravatar.cc/150?u=eko', alamat_lengkap: 'Jl. Melati No. 8, Petukangan Utara', nomor_whatsapp: '081234567892', latitude: -6.2312, longitude: 106.7412, total_tugas_berhasil: 56, tanggal_masuk: '2021-11-10' }
];

async function seed() {
    console.log('🌱 Seeding database...');
    try {
        // Clear existing data (Optional, handle with care)
        // await db.query('DELETE FROM users');
        // await db.query('DELETE FROM staff');

        // Seed Users
        for (const u of MOCK_USERS) {
            await db.query('INSERT IGNORE INTO users (id, username, name, email, nik, role, avatar, password) VALUES (?,?,?,?,?,?,?,?)', 
            [u.id, u.username, u.name, u.email, u.nik, u.role, u.avatar, u.password]);
        }

        // Seed Staff
        for (const s of MOCK_STAFF) {
            await db.query('INSERT IGNORE INTO staff (id, nik, nomor_anggota, nama_lengkap, jenis_kelamin, status, foto_profile, alamat_lengkap, nomor_whatsapp, latitude, longitude, total_tugas_berhasil, tanggal_masuk) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', 
            [s.id, s.nik, s.nomor_anggota, s.nama_lengkap, s.jenis_kelamin, s.status, s.foto_profile, s.alamat_lengkap, s.nomor_whatsapp, s.latitude, s.longitude, s.total_tugas_berhasil, s.tanggal_masuk]);
        }

        console.log('✅ Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        process.exit();
    }
}

seed();
