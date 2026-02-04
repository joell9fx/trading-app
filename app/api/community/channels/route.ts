import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const FALLBACK_CHANNELS = [
  {
    id: 'demo-education',
    name: 'Education',
    description: 'Announcements about new lessons, platform updates, and live sessions.',
    is_private: false,
  },
  {
    id: 'demo-market-insights',
    name: 'Market Insights',
    description: 'Daily breakdowns covering Forex, Crypto, Futures, and Commodities.',
    is_private: false,
  },
  {
    id: 'demo-trading-desk',
    name: 'Trading Desk',
    description: 'Share setups, trade ideas, and get feedback from mentors.',
    is_private: false,
  },
];

// Helper to create Supabase client for API routes
function getSupabaseClient() {
  try {
    // Try server client first (with cookies for auth)
    return createServerClient();
  } catch (error) {
    // Fallback to simple client if cookies() fails in API route context
    console.warn('Server client failed, using simple client:', error);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
}

// GET /api/community/channels - Get community channels
export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Missing Supabase environment variables - returning fallback channels');
      return NextResponse.json({
        channels: FALLBACK_CHANNELS,
        source: 'fallback',
        warning: 'Supabase environment variables are not configured. Returning demo channels.',
      });
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (clientError) {
      console.error('Failed to create Supabase client, returning fallback channels:', clientError);
      return NextResponse.json({
        channels: FALLBACK_CHANNELS,
        source: 'fallback',
        warning: 'Could not connect to Supabase. Returning demo channels.',
        details: clientError instanceof Error ? clientError.message : 'Unknown error',
      });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includePrivate = searchParams.get('include_private') === 'true';

    // Build query
    let query = supabase
      .from('community_channels')
      .select('*')
      .order('name', { ascending: true });

    // Filter by privacy unless explicitly requested
    if (!includePrivate) {
      query = query.eq('is_private', false);
    }

    const { data: channels, error } = await query;

    if (error) {
      console.error('Supabase query error, returning fallback channels:', error);
      return NextResponse.json({
        channels: FALLBACK_CHANNELS,
        source: 'fallback',
        warning: 'Database query failed. Returning demo channels.',
        details: error.message,
      });
    }
    return NextResponse.json({
      channels: channels || []
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/community/channels, returning fallback channels:', error);
    return NextResponse.json({
      channels: FALLBACK_CHANNELS,
      source: 'fallback',
      warning: 'Unexpected error. Returning demo channels.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
