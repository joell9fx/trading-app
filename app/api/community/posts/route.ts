import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const FALLBACK_POSTS = [
  {
    id: 'demo-post-1',
    title: 'Welcome to the Trading Community 👋',
    content:
      'Start your journey with our daily live sessions and on-demand courses. Check the Education channel for the latest schedule.',
    channel_id: 'demo-education',
    created_at: new Date().toISOString(),
    profiles: {
      id: 'demo-user-coach',
      full_name: 'Trading Academy Team',
      avatar_url: null,
    },
    community_channels: {
      name: 'Education',
      description: 'Announcements about new lessons, platform updates, and live sessions.',
    },
  },
  {
    id: 'demo-post-2',
    title: 'Morning Market Outlook',
    content:
      'S&P futures are flat, DXY slightly higher, and BTC hovering around $62k. Watch 1.0810 on EURUSD for potential reversal.',
    channel_id: 'demo-market-insights',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    profiles: {
      id: 'demo-user-analyst',
      full_name: 'Avery Collins',
      avatar_url: null,
    },
    community_channels: {
      name: 'Market Insights',
      description: 'Daily breakdowns covering Forex, Crypto, Futures, and Commodities.',
    },
  },
];

function buildFallbackResponse(channelId: string | null, limit: number, offset: number) {
  const filtered = channelId
    ? FALLBACK_POSTS.filter((post) => post.channel_id === channelId)
    : FALLBACK_POSTS;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    posts: paginated,
    pagination: {
      limit,
      offset,
      total: filtered.length,
      hasMore: filtered.length > offset + limit,
    },
    source: 'fallback' as const,
  };
}

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

// Validation schema for creating posts
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  channel_id: z.string().uuid('Invalid channel ID'),
});

// GET /api/community/posts - Get community posts
export async function GET(request: NextRequest) {
  let channelId: string | null = null;
  let limit = 20;
  let offset = 0;

  try {
    // Query parameters (used for real and fallback responses)
    const { searchParams } = new URL(request.url);
    channelId = searchParams.get('channel_id');
    limit = parseInt(searchParams.get('limit') || '20');
    offset = parseInt(searchParams.get('offset') || '0');

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Missing Supabase environment variables - returning fallback posts');
      return NextResponse.json({
        ...buildFallbackResponse(channelId, limit, offset),
        warning: 'Supabase environment variables are not configured. Returning demo posts.',
      });
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (clientError) {
      console.error('Failed to create Supabase client, returning fallback posts:', clientError);
      return NextResponse.json({
        ...buildFallbackResponse(channelId, limit, offset),
        warning: 'Could not connect to Supabase. Returning demo posts.',
        details: clientError instanceof Error ? clientError.message : 'Unknown error',
      });
    }

    // Build query
    let query = supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by channel if specified
    if (channelId) {
      query = query.eq('channel_id', channelId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Supabase query error, returning fallback posts:', error);
      return NextResponse.json({
        ...buildFallbackResponse(channelId, limit, offset),
        warning: 'Database query failed. Returning demo posts.',
        details: error.message,
      });
    }
    return NextResponse.json({
      posts: posts || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/community/posts, returning fallback posts:', error);
    return NextResponse.json({
      ...buildFallbackResponse(channelId, limit, offset),
      warning: 'Unexpected error. Returning demo posts.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// POST /api/community/posts - Create a new community post
export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Posting is disabled in demo mode. Configure Supabase environment variables to enable this feature.' },
        { status: 503 }
      );
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (clientError) {
      console.error('Failed to create Supabase client for POST /api/community/posts:', clientError);
      return NextResponse.json(
        { error: 'Posting is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createPostSchema.parse(body);

    // Check if channel exists and is accessible
    const { data: channel, error: channelError } = await supabase
      .from('community_channels')
      .select('*')
      .eq('id', validatedData.channel_id)
      .single();

    if (channelError || !channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Create the post
    const postData = {
      ...validatedData,
      user_id: user.id
    };

    const { data: post, error } = await supabase
      .from('community_posts')
      .insert([postData])
      .select(`
        *,
        profiles(id, name, full_name, avatar_url),
        community_channels(name, description)
      `)
      .single();

    if (error) {
      console.error('Error creating community post:', error);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action: 'CREATE',
        table_name: 'community_posts',
        record_id: post.id,
        new_values: post
      }]);

    return NextResponse.json(post, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error in POST /api/community/posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
