import { NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.execute(
      'SELECT id, nama_izin, pemohon_nama, total_sla, tracking_code, status FROM licenses WHERE status != "selesai" AND status != "ditolak"'
    ) as any;

    const notifications: Array<{ title: string; message: string; type: string; reference_id: string }> = [];
    const licenses = Array.isArray(rows) ? rows : [];

    for (const license of licenses) {
      const sla = license.total_sla || 0;
      if (sla > 14) {
        notifications.push({
          title: 'SLA Terlambat',
          message: `${license.nama_izin} - Total SLA: ${sla} hari (MELEBIHI BATAS 14 HARI)`,
          type: 'sla_warning',
          reference_id: license.id
        });
      } else if (sla >= 12) {
        notifications.push({
          title: 'Peringatan SLA',
          message: `${license.nama_izin} - Total SLA: ${sla} hari (Mendekati batas 14 hari)`,
          type: 'sla_warning',
          reference_id: license.id
        });
      }
    }

    for (const notif of notifications) {
      const id = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO notifications (id, title, message, type, reference_id, is_read) VALUES (?, ?, ?, ?, ?, FALSE)`,
        [id, notif.title, notif.message, notif.type, notif.reference_id]
      );
    }

    return NextResponse.json({ success: true, count: notifications.length, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
