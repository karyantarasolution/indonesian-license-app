import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import { config } from '@/lib/config';

// PUT - Update gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 13+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const body = await request.json();
    const id = resolvedParams.id;
    
    if (config.useMySQL) {
      try {
        const pool = getMySQLPool();
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await pool.execute(
          `UPDATE gallery 
           SET title = ?, description = ?, image = ?, category = ?, updated_at = ?
           WHERE id = ?`,
          [
            body.title,
            body.description || null,
            body.image,
            body.category || null,
            now,
            id
          ]
        );
        
        return NextResponse.json({ 
          success: true, 
          message: 'Gallery item updated successfully' 
        });
      } catch (mysqlError: any) {
        console.error('MySQL error:', mysqlError);
        // Continue to return success for client-side fallback
      }
    }
    
    // Return success for client-side localStorage fallback
    return NextResponse.json({ 
      success: true, 
      message: 'Gallery item will be updated in localStorage' 
    });
  } catch (error: any) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update gallery item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 13+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;
    
    if (config.useMySQL) {
      try {
        const pool = getMySQLPool();
        await pool.execute('DELETE FROM gallery WHERE id = ?', [id]);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Gallery item deleted successfully' 
        });
      } catch (mysqlError: any) {
        console.error('MySQL error:', mysqlError);
        // Continue to return success for client-side fallback
      }
    }
    
    // Return success for client-side localStorage fallback
    return NextResponse.json({ 
      success: true, 
      message: 'Gallery item will be deleted from localStorage' 
    });
  } catch (error: any) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}





