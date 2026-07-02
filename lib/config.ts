// Environment configuration
// MySQL sebagai database utama (tidak perlu switch)
export const config = {
  mysql: {
    enabled: process.env.MYSQL_HOST !== undefined || process.env.USE_MYSQL === 'true',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'indonesian_license_app',
    apiUrl: process.env.NEXT_PUBLIC_MYSQL_API_URL || '/api/mysql',
  },
  // Gunakan MySQL jika dikonfigurasi, kalau tidak pakai localStorage
  useMySQL: process.env.MYSQL_HOST !== undefined || process.env.USE_MYSQL === 'true',
  // Fallback ke localStorage jika MySQL tidak dikonfigurasi
  useLocalStorage: !(process.env.MYSQL_HOST !== undefined || process.env.USE_MYSQL === 'true'),
}


