
-- Buat Database
CREATE DATABASE IF NOT EXISTS sipatu_grosel;
USE sipatu_grosel;

-- 1. Tabel Users (Untuk Login)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Di produksi gunakan hash password!
    name VARCHAR(200),
    email VARCHAR(200),
    nik VARCHAR(20),
    role ENUM('Administrator', 'Admin', 'Pimpinan', 'Staff Kelurahan', 'Operator', 'RW', 'LMK', 'PPSU', 'RT', 'FKDM', 'POSYANDU', 'PKK', 'Karang Taruna', 'Warga') NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Citizens (Data Warga)
CREATE TABLE IF NOT EXISTS citizens (
    id VARCHAR(50) PRIMARY KEY,
    nik VARCHAR(20) UNIQUE NOT NULL,
    kk VARCHAR(20) NOT NULL,
    nama_lengkap VARCHAR(200) NOT NULL,
    jenis_kelamin ENUM('Laki-Laki', 'Perempuan'),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    agama VARCHAR(50),
    status_perkawinan VARCHAR(50),
    golongan_darah VARCHAR(5),
    pekerjaan VARCHAR(100),
    nomor_whatsapp VARCHAR(20),
    foto_wajah TEXT,
    alamat TEXT,
    rt VARCHAR(5),
    rw VARCHAR(5),
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kota VARCHAR(100),
    provinsi VARCHAR(100),
    status_ktp VARCHAR(50),
    asal_provinsi VARCHAR(100),
    kewarganegaraan VARCHAR(50),
    status_kematian VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Staff (PPSU & Pegawai)
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(50) PRIMARY KEY,
    nik VARCHAR(20) UNIQUE NOT NULL,
    nomor_anggota VARCHAR(50),
    nama_lengkap VARCHAR(200),
    jenis_kelamin ENUM('Laki-Laki', 'Perempuan'),
    alamat_lengkap TEXT,
    nomor_whatsapp VARCHAR(20),
    foto_profile TEXT,
    status ENUM('Online', 'Bertugas', 'Standby', 'Offline') DEFAULT 'Offline',
    total_tugas_berhasil INT DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    tanggal_masuk DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Reports (Laporan Warga / CRM)
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE,
    title VARCHAR(200),
    description TEXT,
    category VARCHAR(100),
    reporter_name VARCHAR(200),
    reporter_nik VARCHAR(20),
    reporter_phone VARCHAR(20),
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(50),
    timestamp DATETIME,
    photo_url TEXT,
    photo_arrival TEXT,
    photo_completion TEXT,
    photo_revision TEXT,
    priority ENUM('High', 'Medium', 'Low'),
    rejection_reason TEXT,
    estimation_time VARCHAR(100),
    assigned_staff_ids JSON, -- Menyimpan array ID staff
    logs JSON, -- Menyimpan history log status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Service Requests (Layanan Surat)
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE,
    rt_letter_number VARCHAR(100),
    letter_number VARCHAR(100),
    request_date DATETIME,
    completion_date DATETIME,
    type VARCHAR(100),
    applicant_nik VARCHAR(20),
    applicant_name VARCHAR(200),
    applicant_phone VARCHAR(20),
    status VARCHAR(50),
    notes TEXT,
    documents JSON, -- Array URL dokumen pendukung
    signed_letter_url TEXT,
    verification_code VARCHAR(100),
    logs JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Service Ratings (Kepuasan Masyarakat)
CREATE TABLE IF NOT EXISTS service_ratings (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(50),
    rating VARCHAR(50),
    service_type VARCHAR(100),
    timestamp DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
