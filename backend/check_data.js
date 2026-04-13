const mysql = require('mysql2/promise');

async function checkData() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sipetut'
    });

    try {
        const [rows] = await connection.query('SELECT * FROM jadwal_ppsu LIMIT 10');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

checkData();
