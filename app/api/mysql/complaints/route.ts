import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.execute('SELECT * FROM complaints ORDER BY created_at DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, email, telepon, kategori, trackingCode, pesan, license_id } = body;

    if (!nama || !email || !kategori || !pesan) {
      return NextResponse.json({ success: false, error: 'Nama, email, kategori, dan pesan wajib diisi' }, { status: 400 });
    }

    const pool = getMySQLPool();
    const id = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await pool.execute(
      `INSERT INTO complaints (id, license_id, tracking_code, nama, email, telepon, kategori, pesan, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'baru', ?, ?)`,
      [id, license_id || null, trackingCode || null, nama, email, telepon || null, kategori, pesan, now, now]
    );

    const [rows] = await pool.execute('SELECT * FROM complaints WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: Array.isArray(rows) ? rows[0] : null });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
