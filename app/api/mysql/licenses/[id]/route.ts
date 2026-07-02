import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET - Get single license by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.execute(
      'SELECT * FROM licenses WHERE id = ?',
      [params.id]
    );
    
    const license = Array.isArray(rows) ? rows[0] : null;
    
    if (!license) {
      return NextResponse.json(
        { success: false, error: 'License not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: license 
    });
  } catch (error: any) {
    console.error('Error fetching license:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch license' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const is_applicant_edit = body.is_applicant_edit;
    
    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    const allowedFields = [
      'jenis_izin', 'nama_izin', 'lokasi_izin', 'alamat', 'permohonan_masuk',
      'tgl_permintaan_rekomendasi', 'tgl_permintaan_rekomendasi_diserahkan',
      'tgl_rekomendasi_izin_diterima', 'tgl_rekomendasi', 'tgl_terbit_izin',
      'tgl_penyerahan_izin', 'rekomendasi_hari', 'perizinan_hari', 'perizinan',
      'total_sla', 'sektor', 'keterangan', 'status', 'created_by',
      'files', 'verification_status', 'verification_notes', 'verified_by', 'verified_at'
    ];
    
    // Handle JSON fields
    if (body.files !== undefined) {
      if (typeof body.files === 'string') {
        // Already a string, keep it
      } else {
        body.files = body.files ? JSON.stringify(body.files) : null;
      }
    }
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(body[field]);
      }
    }
    
    // Always update updated_at
    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
    
    if (updateFields.length === 1) {
      // Only updated_at, no actual changes
      return NextResponse.json({ 
        success: false, 
        error: 'No fields to update' 
      }, { status: 400 });
    }
    
    updateValues.push(params.id);
    
    const pool = getMySQLPool();
    await pool.execute(
      `UPDATE licenses SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Fetch updated license
    const [rows] = await pool.execute(
      'SELECT * FROM licenses WHERE id = ?',
      [params.id]
    );
    
    const updatedLicense: any = Array.isArray(rows) ? rows[0] : null;

    // Trigger Notifications
    if (updatedLicense) {
      try {
        const tCode = updatedLicense.tracking_code || 'Tidak diketahui';
        const pemohonName = updatedLicense.pemohon_nama || 'Pemohon';
        const licenseName = updatedLicense.nama_izin || '';
        
        // Notification for applicant edit
        if (is_applicant_edit) {
          const notifId = crypto.randomUUID();
          await pool.execute(
            `INSERT INTO notifications (id, title, message, type, reference_id, is_read) VALUES (?, ?, ?, ?, ?, FALSE)`,
            [notifId, 'Pembaruan Dokumen Pemohon', `Data atas nama ${pemohonName} telah di edit (Kode Tracking: ${tCode})`, 'document_edit', params.id]
          );
        }
        
        // SLA Warning notification (if totalSLA >= 12)
        const totalSLA = updatedLicense.total_sla || 0;
        if (totalSLA >= 12 && updatedLicense.status !== 'selesai') {
          const isOverdue = totalSLA > 14;
          const slaNotifId = crypto.randomUUID();
          await pool.execute(
            `INSERT INTO notifications (id, title, message, type, reference_id, is_read) VALUES (?, ?, ?, ?, ?, FALSE)`,
            [slaNotifId, isOverdue ? 'SLA Terlambat' : 'Peringatan SLA', `${licenseName} - Total SLA: ${totalSLA} hari${isOverdue ? ' (MELEBIHI BATAS 14 HARI)' : ''}`, 'sla_warning', params.id]
          );
        }
        
        // Notification for status change
        if (body.status && body.status !== updatedLicense.status) {
          const statusNotifId = crypto.randomUUID();
          await pool.execute(
            `INSERT INTO notifications (id, title, message, type, reference_id, is_read) VALUES (?, ?, ?, ?, ?, FALSE)`,
            [statusNotifId, 'Perubahan Status Izin', `${licenseName} - Status berubah menjadi ${body.status}`, 'status_change', params.id]
          );
        }
      } catch (notifErr) {
        console.error('Failed to create notification', notifErr);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: updatedLicense 
    });
  } catch (error: any) {
    console.error('Error updating license:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update license' },
      { status: 500 }
    );
  }
}

// DELETE - Delete license
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = getMySQLPool();
    await pool.execute(
      'DELETE FROM licenses WHERE id = ?',
      [params.id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'License deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting license:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete license' },
      { status: 500 }
    );
  }
}

