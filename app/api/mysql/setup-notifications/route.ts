import { NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';

export async function GET() {
  try {
    const pool = getMySQLPool();
    
    // Create notifications table if it doesn't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(100) NOT NULL COMMENT 'e.g., license_edit, document_upload',
        reference_id VARCHAR(36) NULL COMMENT 'ID of the related record (e.g., license id)',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Add index if not exists (using a try-catch for the index since IF NOT EXISTS is not standard for INDEX in older MySQL)
    try {
      await pool.execute('ALTER TABLE notifications ADD INDEX idx_is_read (is_read)');
      await pool.execute('ALTER TABLE notifications ADD INDEX idx_created_at (created_at)');
    } catch (indexError: any) {
      // Ignore errors if index already exists (Duplicate key name)
      if (indexError.code !== 'ER_DUP_KEYNAME') {
        console.warn('Warning creating indexes:', indexError.message);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notifications table created successfully (or already exists)' 
    });
  } catch (error: any) {
    console.error('Setup notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to setup notifications table' },
      { status: 500 }
    );
  }
}
