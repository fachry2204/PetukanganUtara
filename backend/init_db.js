
const db = require('./db');
const fs = require('fs');
const path = require('path');

async function init() {
    console.log('🏗️ Initializing database schema...');
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        const queries = schema.split(';').filter(q => q.trim() !== '');
        
        for (const query of queries) {
            await db.query(query);
            console.log('✅ Query executed');
        }
        
        console.log('🚀 Schema initialization complete!');
    } catch (err) {
        console.error('❌ Schema initialization failed:', err);
    } finally {
        process.exit();
    }
}

init();
