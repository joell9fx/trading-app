import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple test without Supabase client
    return NextResponse.json({
      message: 'Simple community endpoint working',
      timestamp: new Date().toISOString(),
      nextStep: 'Test Supabase connection'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Simple endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
