const mysql = require('mysql2/promise');

async function test() {
  const targets = [
    { host: '127.0.0.1', port: 3306 },
    { host: 'localhost', port: 3306 },
    { host: '::1', port: 3306 },
    { host: 'localhost', port: 3307 }, // Common fallback
    { host: '127.0.0.1', port: 3307 }
  ];

  for (const target of targets) {
    console.log(`Testing ${target.host}:${target.port}...`);
    try {
      const connection = await mysql.createConnection({
        ...target,
        user: 'root',
        password: '',
      });
      console.log(`✅ SUCCESS: Connected to ${target.host}:${target.port}`);
      await connection.end();
      break; 
    } catch (err) {
      console.log(`❌ FAILED: ${target.host}:${target.port} - ${err.message}`);
    }
  }
}

test();
