import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const pool = getMySQLPool();
    const [rows] = await pool.execute('SELECT * FROM tutorials WHERE id = ?', [resolvedParams.id]);
    const tutorial = Array.isArray(rows) ? rows[0] : null;
    if (!tutorial) {
      return NextResponse.json({ success: false, error: 'Tutorial not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tutorial });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const allowedFields = ['judul', 'deskripsi', 'icon', 'langkah', 'urutan', 'published'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'langkah') {
          updates.push(`${field} = ?`);
          values.push(JSON.stringify(body[field]));
        } else if (field === 'published') {
          updates.push(`${field} = ?`);
          values.push(body[field] ? 1 : 0);
        } else {
          updates.push(`${field} = ?`);
          values.push(body[field]);
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    values.push(resolvedParams.id);

    const pool = getMySQLPool();
    await pool.execute(`UPDATE tutorials SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.execute('SELECT * FROM tutorials WHERE id = ?', [resolvedParams.id]);
    return NextResponse.json({ success: true, data: Array.isArray(rows) ? rows[0] : null });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const pool = getMySQLPool();
    await pool.execute('DELETE FROM tutorials WHERE id = ?', [resolvedParams.id]);
    return NextResponse.json({ success: true, message: 'Tutorial deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
