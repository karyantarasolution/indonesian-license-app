import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import { config } from '@/lib/config';

// GET - Get all gallery items
export async function GET() {
  try {
    if (config.useMySQL) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.execute(
          'SELECT * FROM gallery ORDER BY created_at DESC'
        );
        
        return NextResponse.json({ 
          success: true, 
          gallery: rows 
        });
      } catch (mysqlError: any) {
        console.error('MySQL error:', mysqlError);
        // Fallback to empty array if table doesn't exist
        return NextResponse.json({ 
          success: true, 
          gallery: [] 
        });
      }
    }
    
    // Fallback to empty array
    return NextResponse.json({ 
      success: true, 
      gallery: [] 
    });
  } catch (error: any) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

// POST - Add new gallery item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (config.useMySQL) {
      try {
        const pool = getMySQLPool();
        const id = crypto.randomUUID();
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await pool.execute(
          `INSERT INTO gallery (id, title, description, image, category, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            body.title,
            body.description || null,
            body.image,
            body.category || null,
            now,
            now
          ]
        );
        
        return NextResponse.json({ 
          success: true, 
          message: 'Gallery item created successfully',
          id 
        });
      } catch (mysqlError: any) {
        console.error('MySQL error:', mysqlError);
        // Continue to return success for client-side fallback
      }
    }
    
    // Return success for client-side localStorage fallback
    return NextResponse.json({ 
      success: true, 
      message: 'Gallery item will be saved to localStorage' 
    });
  } catch (error: any) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}







