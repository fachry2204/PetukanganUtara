const db = require('./db');
const bcrypt = require('bcryptjs');

async function migrate() {
    console.log('🛡️ Starting Password Hashing Migration...');
    try {
        const [users] = await db.query('SELECT id, password FROM users');
        
        for (const user of users) {
            // Cek apakah sudah ter-hash (bcrypt hash biasanya sepanjang 60 karakter dan mulai dengan $2)
            if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
                console.log(`⏩ User ID ${user.id} is already hashed. Skipping.`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(user.password || '123', 10);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
            console.log(`✅ User ID ${user.id} has been hashed.`);
        }
        
        console.log('🚀 Migration complete! All passwords are now secure.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
