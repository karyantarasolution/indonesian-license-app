import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET - Get all licenses
export async function GET() {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.execute(
      'SELECT * FROM licenses ORDER BY created_at DESC'
    );
    
    return NextResponse.json({ 
      success: true, 
      data: rows 
    });
  } catch (error: any) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
}

// Generate tracking code
function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST - Add new license
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate UUID
    const id = crypto.randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Generate tracking code jika belum ada
    const trackingCode = body.tracking_code || generateTrackingCode();
    
    const pool = getMySQLPool();
    await pool.execute(
      `INSERT INTO licenses (
        id, jenis_izin, nama_izin, lokasi_izin, alamat, permohonan_masuk,
        tgl_permintaan_rekomendasi, tgl_permintaan_rekomendasi_diserahkan,
        tgl_rekomendasi_izin_diterima, tgl_rekomendasi, tgl_terbit_izin,
        tgl_penyerahan_izin, rekomendasi_hari, perizinan_hari, perizinan,
        total_sla, sektor, keterangan, status, created_by, created_at, updated_at,
        tracking_code, pemohon_id, pemohon_nama, pemohon_email, pemohon_telepon,
        approved_by, approved_at, notes, files, verification_status, verification_notes,
        verified_by, verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.jenis_izin,
        body.nama_izin,
        body.lokasi_izin,
        body.alamat || null,
        body.permohonan_masuk,
        body.tgl_permintaan_rekomendasi || null,
        body.tgl_permintaan_rekomendasi_diserahkan || null,
        body.tgl_rekomendasi_izin_diterima || null,
        body.tgl_rekomendasi || null,
        body.tgl_terbit_izin || null,
        body.tgl_penyerahan_izin || null,
        body.rekomendasi_hari || 0,
        body.perizinan_hari || 0,
        body.perizinan,
        body.total_sla || 0,
        body.sektor,
        body.keterangan || null,
        body.status || 'draft',
        body.created_by,
        now,
        now,
        trackingCode,
        body.pemohon_id || null,
        body.pemohon_nama || null,
        body.pemohon_email || null,
        body.pemohon_telepon || null,
        body.approved_by || null,
        body.approved_at || null,
        body.notes || null,
        body.files ? (typeof body.files === 'string' ? body.files : JSON.stringify(body.files)) : null,
        body.verification_status || 'pending',
        body.verification_notes || null,
        body.verified_by || null,
        body.verified_at || null,
      ]
    );
    
    // Fetch the newly created license
    const [rows] = await pool.execute(
      'SELECT * FROM licenses WHERE id = ?',
      [id]
    );
    const newLicense: any = Array.isArray(rows) ? rows[0] : null;
    
    // Notify admin about new license
    if (newLicense && (body.status === 'dikirim' || body.status === 'proses')) {
      try {
        const notifId = crypto.randomUUID();
        await pool.execute(
          `INSERT INTO notifications (id, title, message, type, reference_id, is_read) VALUES (?, ?, ?, ?, ?, FALSE)`,
          [notifId, 'Permohonan Izin Baru', `Terdapat permohonan izin baru: ${newLicense.nama_izin || ''} (${newLicense.jenis_izin || ''})`, 'new_license', id]
        );
      } catch (notifErr) {
        console.error('Failed to create notification for new license:', notifErr);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: newLicense 
    });
  } catch (error: any) {
    console.error('Error adding license:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add license' },
      { status: 500 }
    );
  }
}

