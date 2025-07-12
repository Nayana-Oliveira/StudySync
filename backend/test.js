const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const [rows] = await connection.execute('SELECT VERSION() AS version');
    console.log(`Conectado ao MySQL versão: ${rows[0].version}`);
    await connection.end();
  } catch (error) {
    console.error('Erro de conexão:', error);
  }
}

testConnection();