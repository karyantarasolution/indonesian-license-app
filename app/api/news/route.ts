import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import { config } from '@/lib/config';

// GET - Get all news
export async function GET() {
  try {
    if (config.useMySQL) {
      try {
        const pool = getMySQLPool();
        const [rows] = await pool.execute(
          'SELECT * FROM news ORDER BY created_at DESC'
        );
        
        return NextResponse.json({ 
          success: true, 
          news: rows 
        });
      } catch (mysqlError: any) {
        console.error('MySQL error:', mysqlError);
        // Fallback to empty array if table doesn't exist
        return NextResponse.json({ 
          success: true, 
          news: [] 
        });
      }
    }
    
    // Fallback to empty array
    return NextResponse.json({ 
      success: true, 
      news: [] 
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST - Add new news
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (config.useMySQL) {
      try {
        const pool = getMySQLPool();
        const id = crypto.randomUUID();
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await pool.execute(
          `INSERT INTO news (id, title, content, image, author, published, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            body.title,
            body.content,
            body.image || null,
            body.author || 'Admin',
            body.published ? 1 : 0,
            now,
            now
          ]
        );
        
        return NextResponse.json({ 
          success: true, 
          message: 'News created successfully',
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
      message: 'News will be saved to localStorage' 
    });
  } catch (error: any) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create news' },
      { status: 500 }
    );
  }
}







