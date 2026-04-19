import db from './backend/db.js';

async function updateSchema() {
    try {
        const sql1 = `
            CREATE TABLE IF NOT EXISTS push_subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50),
                subscription_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        const sql2 = `
            CREATE TABLE IF NOT EXISTS staff_locations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50),
                name VARCHAR(100),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(sql1);
        await db.query(sql2);
        console.log("Tables 'push_subscriptions' and 'staff_locations' created.");
        process.exit(0);
    } catch (err) {
        console.error("Error updating schema:", err);
        process.exit(1);
    }
}

updateSchema();
