import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  const pool = getMySQLPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS complaints (
      id VARCHAR(36) PRIMARY KEY,
      license_id VARCHAR(36) NULL,
      tracking_code VARCHAR(50) NULL,
      nama VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      telepon VARCHAR(50) NULL,
      kategori ENUM('pengaduan', 'saran', 'pertanyaan', 'testimoni') NOT NULL DEFAULT 'pengaduan',
      pesan TEXT NOT NULL,
      status ENUM('baru', 'dibaca', 'ditindaklanjuti', 'selesai') DEFAULT 'baru',
      tanggapan TEXT NULL,
      rating INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

export async function GET() {
  try {
    const pool = getMySQLPool();
    await ensureTable();
    const [rows] = await pool.execute('SELECT * FROM complaints ORDER BY created_at DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();

    const body = await request.json();
    const { nama, email, telepon, kategori, trackingCode, pesan, license_id, rating } = body;

    if (!nama || !email || !kategori || !pesan) {
      return NextResponse.json({ success: false, error: 'Nama, email, kategori, dan pesan wajib diisi' }, { status: 400 });
    }

    const pool = getMySQLPool();
    const id = crypto.randomUUID();

    await pool.execute(
      `INSERT INTO complaints (id, license_id, tracking_code, nama, email, telepon, kategori, pesan, status, rating) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'baru', ?)`,
      [id, license_id || null, trackingCode || null, nama, email, telepon || null, kategori, pesan, rating || null]
    );

    const [rows] = await pool.execute('SELECT * FROM complaints WHERE id = ?', [id]);

    // Create notification for admin
    try {
      const notifId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO notifications (id, title, message, type, reference_id) VALUES (?, ?, ?, 'complaint', ?)`,
        [
          notifId,
          'Pengaduan Baru',
          `Pengaduan baru dari ${nama} dengan kategori "${kategori}"`,
          id
        ]
      );
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    return NextResponse.json({ success: true, data: Array.isArray(rows) ? rows[0] : null });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
