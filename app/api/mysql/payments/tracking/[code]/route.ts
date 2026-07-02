import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE tracking_code = ? ORDER BY created_at DESC',
      [params.code]
    );
    return NextResponse.json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
