const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'indonesian_license_app',
  });

  try {
    console.log("Altering table...");
    await pool.query("ALTER TABLE licenses ADD COLUMN berlaku_sampai DATE NULL;");
    await pool.query("ALTER TABLE licenses ADD COLUMN latitude VARCHAR(50) NULL;");
    await pool.query("ALTER TABLE licenses ADD COLUMN longitude VARCHAR(50) NULL;");
    console.log("Success!");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist.");
    } else {
      console.error(e);
    }
  } finally {
    pool.end();
  }
}

run();
