CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  nik VARCHAR(50),
  nomor_anggota VARCHAR(50),
  nama_lengkap VARCHAR(255),
  jenis_kelamin VARCHAR(50),
  status VARCHAR(50),
  foto_profile TEXT,
  alamat_lengkap TEXT,
  nomor_whatsapp VARCHAR(50),
  latitude DOUBLE,
  longitude DOUBLE,
  total_tugas_berhasil INT DEFAULT 0,
  tanggal_masuk DATE
);

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(50) PRIMARY KEY,
  ticket_number VARCHAR(100),
  title TEXT,
  description TEXT,
  category VARCHAR(100),
  reporter_name VARCHAR(255),
  reporter_nik VARCHAR(50),
  reporter_phone VARCHAR(50),
  location TEXT,
  latitude DOUBLE,
  longitude DOUBLE,
  status VARCHAR(50),
  timestamp DATETIME,
  photo_url TEXT,
  priority VARCHAR(50),
  logs JSON,
  photo_arrival TEXT,
  photo_completion TEXT,
  photo_revision TEXT,
  rejection_reason TEXT,
  assigned_staff_ids JSON,
  estimation_time VARCHAR(100),
  gps_arrival JSON
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100),
  name VARCHAR(255),
  email VARCHAR(255),
  nik VARCHAR(50),
  role VARCHAR(100),
  avatar TEXT,
  password VARCHAR(255)
);
