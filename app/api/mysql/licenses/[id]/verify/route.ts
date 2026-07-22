import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';

// POST - Verify license files (approve or reject)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const licenseId = resolvedParams.id;
    
    const body = await request.json();
    const { status, notes, verifiedBy } = body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }
    
    if (!licenseId) {
      return NextResponse.json(
        { success: false, error: 'License ID is required' },
        { status: 400 }
      );
    }
    
    let pool;
    try {
      pool = getMySQLPool();
    } catch (poolError: any) {
      console.error('Error getting MySQL pool:', poolError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed. Please check your MySQL configuration and ensure the database server is running.' 
        },
        { status: 500 }
      );
    }
    
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    try {
      await pool.execute(
        `UPDATE licenses 
         SET verification_status = ?, 
             verification_notes = ?, 
             verified_by = ?, 
             verified_at = ?,
             updated_at = ?
         WHERE id = ?`,
        [status, notes || null, verifiedBy || null, now, now, licenseId]
      );
      
      // Fetch updated license
      const [rows] = await pool.execute(
        'SELECT * FROM licenses WHERE id = ?',
        [licenseId]
      );
      
      return NextResponse.json({ 
        success: true, 
        data: Array.isArray(rows) ? rows[0] : null 
      });
    } catch (dbError: any) {
      console.error('Database error during verification:', dbError);
      
      // Check for specific error types
      if (dbError.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Tidak dapat terhubung ke database. Pastikan MySQL server sedang berjalan dan konfigurasi database benar.' 
          },
          { status: 500 }
        );
      }
      
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.message?.includes('verification_status')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Kolom verification_status belum ada di database. Silakan jalankan migration SQL terlebih dahulu.' 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: dbError.message || 'Gagal memverifikasi berkas. Silakan coba lagi.' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying license:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to verify license' 
      },
      { status: 500 }
    );
  }
}

