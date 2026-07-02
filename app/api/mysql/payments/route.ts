import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.execute('SELECT * FROM payments ORDER BY created_at DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { license_id, tracking_code, pemohon_nama, jumlah, metode_pembayaran, tanggal_pembayaran, bukti_pembayaran, keterangan } = body;

    if (!pemohon_nama || !jumlah) {
      return NextResponse.json({ success: false, error: 'Nama pemohon dan jumlah wajib diisi' }, { status: 400 });
    }

    const pool = getMySQLPool();
    const id = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await pool.execute(
      `INSERT INTO payments (id, license_id, tracking_code, pemohon_nama, jumlah, metode_pembayaran, status_pembayaran, tanggal_pembayaran, bukti_pembayaran, keterangan, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [id, license_id || null, tracking_code || null, pemohon_nama, jumlah, metode_pembayaran || 'transfer', tanggal_pembayaran || null, bukti_pembayaran || null, keterangan || null, now, now]
    );

    const [rows] = await pool.execute('SELECT * FROM payments WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: Array.isArray(rows) ? rows[0] : null });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
