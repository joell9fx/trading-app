const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sampleCourses = [
  {
    title: "Introduction to Trading Fundamentals",
    description: "Master the essential concepts of trading including market structure, price action, and basic technical analysis. Perfect for complete beginners who want to understand how financial markets work.",
    slug: "introduction-to-trading-fundamentals",
    thumbnail_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
    duration_minutes: 180,
    difficulty: "beginner",
    is_published: true
  },
  {
    title: "Technical Analysis Mastery",
    description: "Learn advanced chart patterns, indicators, and analysis techniques used by professional traders. This course covers everything from basic support/resistance to complex harmonic patterns.",
    slug: "technical-analysis-mastery",
    thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    duration_minutes: 240,
    difficulty: "intermediate",
    is_published: true
  },
  {
    title: "Risk Management & Psychology",
    description: "Develop the mental framework and risk management strategies that separate successful traders from the rest. Learn position sizing, stop-loss strategies, and emotional control.",
    slug: "risk-management-psychology",
    thumbnail_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
    duration_minutes: 120,
    difficulty: "intermediate",
    is_published: true
  },
  {
    title: "Advanced Trading Strategies",
    description: "Master complex trading strategies including algorithmic trading, options strategies, and multi-timeframe analysis. For experienced traders looking to take their skills to the next level.",
    slug: "advanced-trading-strategies",
    thumbnail_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop",
    duration_minutes: 300,
    difficulty: "advanced",
    is_published: false
  },
  {
    title: "Cryptocurrency Trading",
    description: "Navigate the volatile world of cryptocurrency trading with confidence. Learn about blockchain technology, crypto-specific indicators, and 24/7 market dynamics.",
    slug: "cryptocurrency-trading",
    thumbnail_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=600&fit=crop",
    duration_minutes: 150,
    difficulty: "intermediate",
    is_published: true
  }
];

const sampleLessons = {
  "introduction-to-trading-fundamentals": [
    {
      title: "What is Trading?",
      description: "Understanding the basics of financial markets and trading",
      content: "Trading is the act of buying and selling financial instruments such as stocks, bonds, commodities, and currencies...",
      video_url: "https://example.com/videos/lesson1.mp4",
      duration_minutes: 30,
      order_index: 1,
      is_published: true
    },
    {
      title: "Market Structure Basics",
      description: "Learn about market participants and how markets function",
      content: "Markets are made up of various participants including retail traders, institutional investors, market makers...",
      video_url: "https://example.com/videos/lesson2.mp4",
      duration_minutes: 25,
      order_index: 2,
      is_published: true
    },
    {
      title: "Price Action Fundamentals",
      description: "Understanding how price moves and what it tells us",
      content: "Price action is the study of price movement over time. It's the foundation of technical analysis...",
      video_url: "https://example.com/videos/lesson3.mp4",
      duration_minutes: 35,
      order_index: 3,
      is_published: true
    },
    {
      title: "Basic Chart Patterns",
      description: "Recognizing common chart patterns and their significance",
      content: "Chart patterns are formations that appear on price charts and can indicate potential future price movements...",
      video_url: "https://example.com/videos/lesson4.mp4",
      duration_minutes: 40,
      order_index: 4,
      is_published: true
    },
    {
      title: "Your First Trading Plan",
      description: "Creating a structured approach to trading",
      content: "A trading plan is your roadmap to success in the markets. It should include your strategy, risk management rules...",
      video_url: "https://example.com/videos/lesson5.mp4",
      duration_minutes: 50,
      order_index: 5,
      is_published: true
    }
  ],
  "technical-analysis-mastery": [
    {
      title: "Advanced Chart Patterns",
      description: "Complex patterns and their trading implications",
      content: "Beyond basic patterns, advanced chart patterns provide deeper insights into market psychology...",
      video_url: "https://example.com/videos/advanced1.mp4",
      duration_minutes: 45,
      order_index: 1,
      is_published: true
    },
    {
      title: "Technical Indicators Deep Dive",
      description: "Mastering RSI, MACD, and other key indicators",
      content: "Technical indicators are mathematical calculations based on price, volume, or other market data...",
      video_url: "https://example.com/videos/advanced2.mp4",
      duration_minutes: 50,
      order_index: 2,
      is_published: true
    },
    {
      title: "Multi-Timeframe Analysis",
      description: "Combining different timeframes for better analysis",
      content: "Multi-timeframe analysis involves examining the same market across different time periods...",
      video_url: "https://example.com/videos/advanced3.mp4",
      duration_minutes: 55,
      order_index: 3,
      is_published: true
    },
    {
      title: "Harmonic Patterns",
      description: "Advanced geometric patterns for precise entries",
      content: "Harmonic patterns are geometric price patterns that use Fibonacci numbers to identify potential reversal points...",
      video_url: "https://example.com/videos/advanced4.mp4",
      duration_minutes: 60,
      order_index: 4,
      is_published: true
    },
    {
      title: "Strategy Development",
      description: "Building your own trading system",
      content: "A trading system is a set of rules that guide your trading decisions. It should be systematic, repeatable...",
      video_url: "https://example.com/videos/advanced5.mp4",
      duration_minutes: 30,
      order_index: 5,
      is_published: true
    }
  ]
};

async function createSampleCourses() {
  try {
    console.log('🚀 Starting to create sample courses...');
    
    for (const courseData of sampleCourses) {
      console.log(`📚 Creating course: ${courseData.title}`);
      
      // Create the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();
      
      if (courseError) {
        console.error(`❌ Error creating course ${courseData.title}:`, courseError);
        continue;
      }
      
      console.log(`✅ Course created: ${course.title} (ID: ${course.id})`);
      
      // Add lessons if they exist for this course
      const lessons = sampleLessons[courseData.slug];
      if (lessons) {
        console.log(`📖 Adding ${lessons.length} lessons to ${course.title}...`);
        
        for (const lessonData of lessons) {
          const lessonWithCourseId = {
            ...lessonData,
            course_id: course.id
          };
          
          const { data: lesson, error: lessonError } = await supabase
            .from('lessons')
            .insert([lessonWithCourseId])
            .select()
            .single();
          
          if (lessonError) {
            console.error(`❌ Error creating lesson ${lessonData.title}:`, lessonError);
          } else {
            console.log(`  ✅ Lesson created: ${lesson.title}`);
          }
        }
      }
      
      console.log('---');
    }
    
    console.log('🎉 Sample courses creation completed!');
    
    // Show final stats
    const { data: courses } = await supabase
      .from('courses')
      .select('*', { count: 'exact' });
    
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact' });
    
    console.log(`📊 Final Stats:`);
    console.log(`   Courses: ${courses?.length || 0}`);
    console.log(`   Lessons: ${lessons?.length || 0}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the script
createSampleCourses();
