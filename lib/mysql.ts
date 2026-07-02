import mysql from 'mysql2/promise';

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'indonesian_license_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(mysqlConfig);
  }
  return pool;
}

// Test connection
export async function testMySQLConnection(): Promise<boolean> {
  try {
    const connectionPool = getMySQLPool();
    const connection = await connectionPool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection error:', error);
    return false;
  }
}

// Close pool (for graceful shutdown)
export async function closeMySQLPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

