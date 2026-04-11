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

CREATE TABLE IF NOT EXISTS tugas_ppsu (
  id VARCHAR(50) PRIMARY KEY,
  judul_tugas TEXT,
  deskripsi TEXT,
  kategori VARCHAR(100),
  lokasi TEXT,
  latitude DOUBLE,
  longitude DOUBLE,
  status VARCHAR(50),
  timestamp DATETIME,
  foto_sebelum TEXT,
  foto_sesudah TEXT,
  staff_id VARCHAR(50),
  assigned_staff_ids JSON,
  priority VARCHAR(50),
  logs JSON,
  alasan_penolakan TEXT,
  reporter_name VARCHAR(255),
  reporter_nik VARCHAR(50),
  reporter_phone VARCHAR(50),
  ticket_number VARCHAR(100),
  photo_arrival TEXT,
  photo_completion TEXT,
  photo_revision TEXT,
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

CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(50) PRIMARY KEY,
  staff_id VARCHAR(50),
  type VARCHAR(50),
  timestamp DATETIME,
  latitude DOUBLE,
  longitude DOUBLE,
  photo_url TEXT,
  nik VARCHAR(50),
  staff_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  target_role VARCHAR(100),
  target_user_id VARCHAR(50),
  author_name VARCHAR(255),
  author_role VARCHAR(100),
  date DATETIME,
  priority VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS sos_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_key VARCHAR(100),
  nik VARCHAR(50),
  name VARCHAR(255),
  time DATETIME,
  latitude DOUBLE,
  longitude DOUBLE,
  is_resolved BOOLEAN DEFAULT FALSE
);
