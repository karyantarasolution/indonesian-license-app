import { NextResponse } from 'next/server';
import { testMySQLConnection } from '@/lib/mysql';

// GET - Test MySQL connection
export async function GET() {
  try {
    const isConnected = await testMySQLConnection();
    
    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'MySQL connection successful' 
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'MySQL connection failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error testing MySQL connection:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to test MySQL connection' },
      { status: 500 }
    );
  }
}

