const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const samplePosts = [
  {
    title: "What's your favorite technical indicator?",
    content: "I've been using RSI and MACD for a while now, but I'm curious what other traders find most reliable. What indicators do you rely on for your trading decisions?",
    channel_id: null, // Will be set after getting channel
    user_id: null, // Will be set after getting user
  },
  {
    title: "Risk management tips for beginners",
    content: "Just started trading and looking for advice on position sizing and stop losses. What's your approach to managing risk? Any specific rules you follow?",
    channel_id: null,
    user_id: null,
  },
  {
    title: "Market analysis - S&P 500",
    content: "Looking at the daily chart, we're approaching a key resistance level around 4,800. Volume is picking up which could indicate a breakout attempt. What's your take on this setup?",
    channel_id: null,
    user_id: null,
  },
  {
    title: "Trading psychology - dealing with losses",
    content: "Had a rough week with 3 consecutive losing trades. I know losses are part of trading, but it's affecting my confidence. How do you bounce back from losing streaks?",
    channel_id: null,
    user_id: null,
  },
  {
    title: "Best books for learning trading",
    content: "I'm looking to expand my trading knowledge. What books would you recommend for someone who's been trading for about 6 months? Particularly interested in technical analysis and psychology.",
    channel_id: null,
    user_id: null,
  }
];

async function createSampleCommunityPosts() {
  try {
    console.log('🚀 Starting to create sample community posts...');
    
    // Get community channels
    const { data: channels, error: channelsError } = await supabase
      .from('community_channels')
      .select('*')
      .eq('is_private', false)
      .limit(1);
    
    if (channelsError || !channels || channels.length === 0) {
      console.error('❌ No community channels found. Please run the database setup first.');
      return;
    }
    
    const defaultChannel = channels[0];
    console.log(`📢 Using channel: ${defaultChannel.name}`);
    
    // Get a user (or create one if needed)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found. Please create a user first.');
      return;
    }
    
    const defaultUser = users[0];
    console.log(`👤 Using user ID: ${defaultUser.id}`);
    
    // Create posts
    for (const postData of samplePosts) {
      console.log(`📝 Creating post: ${postData.title}`);
      
      const postWithIds = {
        ...postData,
        channel_id: defaultChannel.id,
        user_id: defaultUser.id
      };
      
      const { data: post, error } = await supabase
        .from('community_posts')
        .insert([postWithIds])
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error creating post ${postData.title}:`, error);
        continue;
      }
      
      console.log(`✅ Post created: ${post.title} (ID: ${post.id})`);
    }
    
    console.log('🎉 Sample community posts creation completed!');
    
    // Show final stats
    const { data: posts } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact' });
    
    console.log(`📊 Final Stats:`);
    console.log(`   Community Posts: ${posts?.length || 0}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the script
createSampleCommunityPosts();
