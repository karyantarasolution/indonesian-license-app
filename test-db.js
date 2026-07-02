require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const [rows, fields] = await pool.query('DESCRIBE notifications');
    console.log("Notifications table structure:", rows);
    
    const [notifs] = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5');
    console.log("Recent notifications:", notifs);
    
    const [licenses] = await pool.query('SELECT * FROM licenses LIMIT 1');
    console.log("License sample:", licenses[0]);

  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

test();
