const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'sipetut'
    });
    console.log('✅ Connection to 127.0.0.1 successful');
    await connection.end();
  } catch (err) {
    console.log('❌ Connection to 127.0.0.1 failed:', err.message);
  }

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'sipetut'
    });
    console.log('✅ Connection to localhost successful');
    await connection.end();
  } catch (err) {
    console.log('❌ Connection to localhost failed:', err.message);
  }
}

test();
