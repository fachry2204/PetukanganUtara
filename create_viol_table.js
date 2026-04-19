import db from './backend/db.js';

async function createTable() {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS pelanggaran (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50),
                ppsu_name VARCHAR(100),
                device_info TEXT,
                violation_type VARCHAR(100),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(sql);
        console.log("Table 'pelanggaran' created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
}

createTable();
