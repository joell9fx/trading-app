import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables'
      }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test 1: Check if community_channels table exists
    const { data: channelsData, error: channelsError } = await supabase
      .from('community_channels')
      .select('*')
      .limit(1);

    // Test 2: Check if community_posts table exists
    const { data: postsData, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .limit(1);

    // Test 3: Check if profiles table exists
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    // Test 4: List all available tables (this might not work due to permissions)
    let tablesInfo = 'Not accessible';
    try {
      const { data: tablesData } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      tablesInfo = Array.isArray(tablesData) ? tablesData.map(t => t.table_name).join(', ') : 'No tables found';
    } catch (e) {
      tablesInfo = 'Permission denied';
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema check completed',
      results: {
        community_channels: {
          exists: !channelsError,
          error: channelsError?.message || null,
          data: channelsData,
          count: channelsData?.length || 0
        },
        community_posts: {
          exists: !postsError,
          error: postsError?.message || null,
          data: postsData,
          count: postsData?.length || 0
        },
        profiles: {
          exists: !profilesError,
          error: profilesError?.message || null,
          data: profilesData,
          count: profilesData?.length || 0
        },
        availableTables: tablesInfo
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
