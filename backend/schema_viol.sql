USE sipetut_db;
CREATE TABLE IF NOT EXISTS pelanggaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    ppsu_name VARCHAR(100),
    device_info TEXT,
    violation_type VARCHAR(100),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
