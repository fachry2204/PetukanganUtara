CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  nik VARCHAR(50),
  nomor_anggota VARCHAR(50),
  nama_lengkap VARCHAR(255),
  jenis_kelamin VARCHAR(50),
  status VARCHAR(50),
  foto_profile LONGTEXT,
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
  foto_sebelum LONGTEXT,
  foto_sedang LONGTEXT,
  foto_sesudah LONGTEXT,
  staff_id VARCHAR(50),
  assigned_staff_ids JSON,
  priority VARCHAR(50),
  logs JSON,
  alasan_penolakan TEXT,
  reporter_name VARCHAR(255),
  reporter_nik VARCHAR(50),
  reporter_phone VARCHAR(50),
  ticket_number VARCHAR(100),
  photo_arrival LONGTEXT,
  photo_completion LONGTEXT,
  photo_revision LONGTEXT,
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
  avatar LONGTEXT,
  password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(50) PRIMARY KEY,
  staff_id VARCHAR(50),
  type VARCHAR(50),
  timestamp DATETIME,
  latitude DOUBLE,
  longitude DOUBLE,
  photo_url LONGTEXT,
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

CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(50) PRIMARY KEY,
  system_name VARCHAR(255),
  sub_name VARCHAR(255),
  footer_text TEXT,
  app_version VARCHAR(50),
  theme_color VARCHAR(50),
  logo LONGTEXT,
  login_background LONGTEXT,
  anjungan_background LONGTEXT,
  zona_list JSON,
  shift_config JSON
);

INSERT IGNORE INTO settings (id, system_name, sub_name, footer_text, app_version, theme_color, logo, login_background, anjungan_background, zona_list, shift_config)
VALUES ('app_settings', 'SiPetut', 'Kelurahan Petukangan Utara', '© 2026 Kelurahan Petukangan Utara. All Rights Reserved.', '1.0.0', '#f97316', 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Jakarta.svg', NULL, 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2000', '["Zona 1", "Zona 2", "Zona 3"]', '[{"name": "Pagi", "start": "07:00", "end": "15:00"}, {"name": "Siang", "start": "15:00", "end": "23:00"}, {"name": "Malam", "start": "23:00", "end": "07:00"}]');
