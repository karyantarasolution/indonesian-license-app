import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  const pool = getMySQLPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tutorials (
      id VARCHAR(36) PRIMARY KEY,
      judul VARCHAR(500) NOT NULL,
      deskripsi TEXT NULL,
      icon VARCHAR(100) DEFAULT 'BookOpen',
      langkah JSON NULL,
      urutan INT DEFAULT 0,
      published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

export async function GET() {
  try {
    const pool = getMySQLPool();
    await ensureTable();
    const [rows] = await pool.execute('SELECT * FROM tutorials ORDER BY urutan ASC, created_at DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const body = await request.json();
    const { judul, deskripsi, icon, langkah, urutan, published } = body;

    if (!judul) {
      return NextResponse.json({ success: false, error: 'Judul wajib diisi' }, { status: 400 });
    }

    const pool = getMySQLPool();
    const id = crypto.randomUUID();

    await pool.execute(
      `INSERT INTO tutorials (id, judul, deskripsi, icon, langkah, urutan, published) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, judul, deskripsi || null, icon || 'BookOpen', JSON.stringify(langkah || []), urutan || 0, published ? 1 : 0]
    );

    const [rows] = await pool.execute('SELECT * FROM tutorials WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: Array.isArray(rows) ? rows[0] : null });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
