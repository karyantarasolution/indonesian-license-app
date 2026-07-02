import { NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMySQLPool();
    
    // Fetch notifications ordered by latest first
    const [rows] = await pool.execute(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
    );
    
    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, type, reference_id } = body;
    
    if (!title || !message || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const pool = getMySQLPool();
    const id = crypto.randomUUID();
    
    await pool.execute(
      `INSERT INTO notifications (id, title, message, type, reference_id, is_read) 
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [id, title, message, type, reference_id || null]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Notification created successfully'
    });
  } catch (error: any) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}
