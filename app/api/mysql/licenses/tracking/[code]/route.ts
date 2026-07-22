import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import { config } from '@/lib/config';
import type { License } from '@/contexts/license-context';

// GET - Get license by tracking code (public, untuk pemohon)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const resolvedParams = await params;
    const trackingCode = resolvedParams.code;

    if (!trackingCode) {
      return NextResponse.json(
        { success: false, error: 'Kode tracking tidak valid' },
        { status: 400 }
      );
    }

    // Gunakan MySQL
    try {
      const pool = getMySQLPool();
      const [rows] = await pool.execute(
        'SELECT * FROM licenses WHERE tracking_code = ?',
        [trackingCode.toUpperCase()]
      );
      
      const dbRow = Array.isArray(rows) && rows.length > 0 ? (rows[0] as Record<string, any>) : null;
      
      if (!dbRow) {
        return NextResponse.json(
          { success: false, error: 'Permohonan tidak ditemukan dengan kode tracking tersebut' },
          { status: 404 }
        );
      }
      
      // Transform database row to License interface format
      const license: License = {
        id: dbRow.id,
        jenisIzin: dbRow.jenis_izin,
        namaIzin: dbRow.nama_izin,
        lokasiIzin: dbRow.lokasi_izin,
        alamat: dbRow.alamat || undefined,
        permohonanMasuk: dbRow.permohonan_masuk,
        tglPermintaanRekomendasi: dbRow.tgl_permintaan_rekomendasi || '',
        tglPermintaanRekomendasiDiserahkan: dbRow.tgl_permintaan_rekomendasi_diserahkan || '',
        tglRekomendasiIzinDiterima: dbRow.tgl_rekomendasi_izin_diterima || '',
        tglRekomendasi: dbRow.tgl_rekomendasi || '',
        tglTerbitIzin: dbRow.tgl_terbit_izin || '',
        tglPenyerahanIzin: dbRow.tgl_penyerahan_izin || '',
        rekomendasiHari: dbRow.rekomendasi_hari || 0,
        perizinanHari: dbRow.perizinan_hari || 0,
        perizinan: dbRow.perizinan,
        totalSLA: dbRow.total_sla || 0,
        sektor: dbRow.sektor,
        keterangan: dbRow.keterangan || '',
        status: dbRow.status,
        createdBy: dbRow.created_by,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
        trackingCode: dbRow.tracking_code || undefined,
        pemohonId: dbRow.pemohon_id || undefined,
        pemohonNama: dbRow.pemohon_nama || undefined,
        pemohonEmail: dbRow.pemohon_email || undefined,
        pemohonTelepon: dbRow.pemohon_telepon || undefined,
        approvedBy: dbRow.approved_by || undefined,
        approvedAt: dbRow.approved_at || undefined,
        notes: dbRow.notes || undefined,
        files: dbRow.files ? (typeof dbRow.files === 'string' ? JSON.parse(dbRow.files) : dbRow.files) : undefined,
        verificationStatus: dbRow.verification_status || undefined,
        verificationNotes: dbRow.verification_notes || undefined,
        verifiedBy: dbRow.verified_by || undefined,
        verifiedAt: dbRow.verified_at || undefined,
      };
      
      return NextResponse.json({ 
        success: true, 
        data: license 
      });
    } catch (mysqlError: any) {
      console.error('Error fetching license from MySQL:', mysqlError);
      
      // Handle specific error: tabel tidak ada
      if (mysqlError.code === 'ER_NO_SUCH_TABLE' || mysqlError.errno === 1146) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Tabel licenses belum ada di database. Silakan jalankan script SQL: database/create-table-only.sql atau database/create-database-complete.sql' 
          },
          { status: 500 }
        );
      }
      
      // Handle specific error: kolom tracking_code tidak ada
      if (mysqlError.code === 'ER_BAD_FIELD_ERROR' && mysqlError.message?.includes('tracking_code')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Kolom tracking_code belum ada di database. Silakan jalankan migration SQL: database/add-tracking-code.sql' 
          },
          { status: 500 }
        );
      }
      
      // Jika MySQL tidak tersedia atau error, kembalikan error yang jelas
      // Client-side akan handle fallback ke localStorage
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gagal memuat data dari database. Sistem akan mencoba mencari di cache lokal.' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching license by tracking code:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch license' },
      { status: 500 }
    );
  }
}

