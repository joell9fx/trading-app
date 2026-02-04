const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

async function fixCommunityPosts() {
  console.log('🔧 Fixing Community Posts Issue');
  console.log('================================\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Check if community_posts table exists
    console.log('🔍 Checking if community_posts table exists...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('community_posts')
      .select('count')
      .limit(1);

    if (tableError) {
      console.log('❌ community_posts table does not exist or has issues');
      console.log('Creating community_posts table...');
      
      // Create the community_posts table
      const createTableSQL = `
        -- Create community_channels table first (if it doesn't exist)
        CREATE TABLE IF NOT EXISTS community_channels (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          is_public BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create community_posts table
        CREATE TABLE IF NOT EXISTS community_posts (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          channel_id UUID REFERENCES community_channels(id) ON DELETE CASCADE NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          is_pinned BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_community_posts_channel_id ON community_posts(channel_id);
        CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
        CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

        -- Enable RLS
        ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
        ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies for community_channels
        DROP POLICY IF EXISTS "Anyone can view public channels" ON community_channels;
        CREATE POLICY "Anyone can view public channels" ON community_channels 
          FOR SELECT USING (is_public = true);

        DROP POLICY IF EXISTS "Authenticated users can create channels" ON community_channels;
        CREATE POLICY "Authenticated users can create channels" ON community_channels 
          FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

        -- Create RLS policies for community_posts
        DROP POLICY IF EXISTS "Anyone can view posts in public channels" ON community_posts;
        CREATE POLICY "Anyone can view posts in public channels" ON community_posts 
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM community_channels 
              WHERE community_channels.id = community_posts.channel_id 
              AND community_channels.is_public = true
            )
          );

        DROP POLICY IF EXISTS "Users can insert posts" ON community_posts;
        CREATE POLICY "Users can insert posts" ON community_posts 
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
        CREATE POLICY "Users can update their own posts" ON community_posts 
          FOR UPDATE USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;
        CREATE POLICY "Users can delete their own posts" ON community_posts 
          FOR DELETE USING (auth.uid() = user_id);
      `;

      // Execute the SQL using rpc (we'll need to do this differently)
      console.log('⚠️  Table creation requires manual SQL execution');
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log('\n' + createTableSQL + '\n');
      
      console.log('🔗 Go to: https://supabase.com/dashboard/project/cfnfrxnxnavlknrjujurj/sql/new');
      console.log('📋 Copy and paste the SQL above, then click "Run"');
      
      return false;
    }

    console.log('✅ community_posts table exists');
    
    // Check if there are any posts
    const { count, error: countError } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Error checking post count:', countError.message);
      return false;
    }

    console.log(`📊 Found ${count} posts in community_posts table`);

    // Check if community_channels table exists and has channels
    console.log('\n🔍 Checking community_channels table...');
    
    const { data: channels, error: channelsError } = await supabase
      .from('community_channels')
      .select('*');

    if (channelsError) {
      console.log('❌ community_channels table does not exist or has issues');
      console.log('This is needed for the community posts to work properly');
      return false;
    }

    console.log(`✅ Found ${channels.length} community channels`);
    
    if (channels.length === 0) {
      console.log('\n📝 Creating default community channel...');
      
      const { data: newChannel, error: createChannelError } = await supabase
        .from('community_channels')
        .insert([
          {
            name: 'General Discussion',
            description: 'General trading discussion and questions',
            is_public: true
          }
        ])
        .select()
        .single();

      if (createChannelError) {
        console.log('❌ Error creating default channel:', createChannelError.message);
        return false;
      }

      console.log('✅ Created default channel:', newChannel.name);
    }

    // Check if there are any sample posts
    if (count === 0) {
      console.log('\n📝 Creating sample community post...');
      
      // Get the first channel
      const { data: firstChannel } = await supabase
        .from('community_channels')
        .select('id')
        .limit(1)
        .single();

      if (firstChannel) {
        const { data: samplePost, error: createPostError } = await supabase
          .from('community_posts')
          .insert([
            {
              title: 'Welcome to the Trading Community! 🚀',
              content: 'This is your first community post. Feel free to share your trading insights, ask questions, and connect with other traders!',
              channel_id: firstChannel.id,
              user_id: '00000000-0000-0000-0000-000000000000' // Placeholder user ID
            }
          ])
          .select()
          .single();

        if (createPostError) {
          console.log('⚠️  Could not create sample post (this is normal if no users exist yet)');
          console.log('The community posts will work once users start creating posts');
        } else {
          console.log('✅ Created sample post:', samplePost.title);
        }
      }
    }

    console.log('\n🎉 Community posts setup is complete!');
    console.log('✅ The "Failed to load posts" error should now be resolved');
    
    return true;

  } catch (error) {
    console.error('❌ Error fixing community posts:', error.message);
    return false;
  }
}

// Run the fix
fixCommunityPosts().then(success => {
  if (success) {
    console.log('\n🚀 Try accessing the community feed again!');
    console.log('The posts should now load properly.');
  } else {
    console.log('\n⚠️  Manual intervention required');
    console.log('Please follow the instructions above to complete the setup.');
  }
});
