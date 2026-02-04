# Supabase Database Setup Guide

This guide will help you set up the database tables for the Trading Academy community platform.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Your Supabase project URL and anon key

## Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your:
   - Project URL
   - Anon (public) key
   - Service role key (for admin operations)

### 2. Update Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Run the Database Migration

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `supabase/migrations/20241220000000_community_schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the migration

#### Option B: Using Supabase CLI

If you have Docker installed:

```bash
# Start local Supabase
npx supabase start

# Apply migration
npx supabase db push

# Stop local Supabase
npx supabase stop
```

### 4. Verify Setup

After running the migration, you should see these tables in your Supabase dashboard:

- `profiles` - User profiles and roles
- `posts` - Community feed posts
- `comments` - Post comments
- `likes` - Post likes
- `signals` - Trading signals
- `messages` - Real-time chat messages
- `events` - Community events
- `courses` - Educational courses
- `mentors` - Mentor profiles
- `bookings` - Mentorship bookings
- `audit_log` - System audit trail

### 5. Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3001/signup
3. Create a new account
4. You should be redirected to the dashboard

## Database Schema Overview

### Core Tables

#### `profiles`
- Stores user information and roles
- Automatically created when users sign up
- Supports ADMIN and MEMBER roles

#### `posts`
- Community feed posts
- Users can create, edit, and delete their own posts
- Supports tags and real-time updates

#### `signals`
- Trading signals (ADMIN only)
- Includes entry, stop-loss, take-profit levels
- Automatic risk/reward ratio calculation

#### `messages`
- Real-time chat messages
- Global channel support
- Real-time subscriptions enabled

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** (ADMIN vs MEMBER)
- **Audit logging** for sensitive operations
- **Automatic profile creation** on user signup

### Sample Data

The migration includes sample data:
- Admin user (admin@tradingacademy.com)
- Sample members (John Smith, Maria Johnson)
- Sample courses and events
- Sample posts and messages
- Sample trading signals

## Troubleshooting

### Common Issues

1. **"Cannot connect to Supabase"**
   - Check your environment variables
   - Verify your Supabase project is active

2. **"Permission denied"**
   - Ensure RLS policies are properly set
   - Check user authentication status

3. **"Table not found"**
   - Run the migration again
   - Check if all tables were created

### Getting Help

1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Test with the sample data provided

## Next Steps

After setting up the database:

1. Test user registration and authentication
2. Verify role-based access control
3. Test real-time features (chat, posts)
4. Customize the sample data as needed

## Security Notes

- The database includes comprehensive RLS policies
- Admin operations are logged in the audit_log table
- User data is protected by role-based permissions
- All sensitive operations require proper authentication

