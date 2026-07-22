import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { is_read } = body;
    
    if (is_read === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing is_read field' },
        { status: 400 }
      );
    }
    
    const pool = getMySQLPool();
    
    await pool.execute(
      'UPDATE notifications SET is_read = ? WHERE id = ?',
      [is_read, resolvedParams.id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully'
    });
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pool = getMySQLPool();
    
    await pool.execute(
      'DELETE FROM notifications WHERE id = ?',
      [resolvedParams.id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
