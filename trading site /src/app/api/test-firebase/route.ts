import { NextResponse } from 'next/server';
import { userService, signalService, analyticsService } from '../../lib/firebase-services';

export async function GET() {
  try {
    // Test Firebase connection by getting some basic data
    const stats = await analyticsService.getDashboardStats();
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful!',
      data: {
        stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Firebase connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Test creating a sample user
    const testUser = {
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'member' as const,
      membershipLevel: 'free' as const,
      isEmailVerified: false,
      profile: {
        bio: 'Test user for Firebase connection',
        tradingExperience: 'Beginner',
        preferredMarkets: ['forex'],
        timezone: 'UTC',
      },
    };

    const userId = await userService.createUser(testUser);
    
    // Test creating a sample signal
    const testSignal = {
      title: 'Test Signal',
      description: 'This is a test signal to verify Firebase connection',
      symbol: 'EURUSD',
      type: 'buy' as const,
      entryPrice: 1.0850,
      stopLoss: 1.0800,
      takeProfit: 1.0900,
      riskRewardRatio: 1.0,
      market: 'forex' as const,
      status: 'active' as const,
      createdBy: 'test@example.com',
      isPinned: false,
      tags: ['test'],
    };

    const signalId = await signalService.createSignal(testSignal);

    return NextResponse.json({
      success: true,
      message: 'Firebase write operations successful!',
      data: {
        userId,
        signalId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Firebase write test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Firebase write operations failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
