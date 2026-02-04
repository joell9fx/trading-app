# Role-Based Access Control System

## Overview

The dashboard now implements a comprehensive role-based access control (RBAC) system that restricts access to features based on user roles and subscription plans.

## User Roles

### 1. **VIEWER** (Read-only)
- Can view basic courses
- Can view community posts
- Can view basic trading signals
- **Cannot**: Post, enroll, chat, or access premium features

### 2. **MEMBER** (Standard Member)
- All VIEWER permissions
- Can enroll in courses
- Can post in community
- Can participate in chat
- Can view basic trading signals
- **Cannot**: Create signals, access mentorship, premium courses

### 3. **TRADER** (Enhanced Trading Features)
- All MEMBER permissions
- Can view all courses (including premium)
- Can create trading signals
- Can view priority trading signals
- Can book mentorship sessions (requires subscription)
- **Cannot**: Moderate content, manage users

### 4. **MODERATOR** (Community Management)
- All TRADER permissions
- Can moderate community posts
- Can delete posts
- Can moderate chat
- Can view all signals
- **Cannot**: Manage users, system settings

### 5. **ADMIN** (Full Access)
- All permissions
- Can manage courses
- Can manage users and roles
- Can assign subscriptions
- Can manage system settings
- Full access to all features

## Subscription Plans

### Free Plan
- Basic courses only
- Basic trading signals
- Email support
- No mentorship

### Pro Plan
- All basic courses
- Premium courses
- Priority trading signals
- Monthly mentorship sessions
- Priority support

### Enterprise Plan
- All courses
- Premium courses
- Premium trading signals
- Weekly mentorship sessions
- 24/7 phone support

## Setup Instructions

### 1. Run Database Migration

Run the migration file to update the database schema:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/migrations/002_add_roles_and_permissions.sql
```

This will:
- Expand the role system to support VIEWER, MEMBER, TRADER, MODERATOR, ADMIN
- Create role_permissions table
- Create plan_features table
- Add permission checking functions

### 2. Assign Roles to Users

#### Via Admin Panel:
1. Go to Dashboard → Admin Panel
2. Find the user
3. Click "Change Role"
4. Select the desired role
5. Click "Update Role"

#### Via API:
```typescript
PUT /api/admin/users/[userId]/role
Body: { role: 'TRADER' }
```

### 3. Assign Subscriptions

#### Via Admin Panel:
1. Go to Dashboard → Admin Panel
2. Find the user
3. Click "Subscription" button
4. Select a plan
5. Click "Assign Plan"

#### Via API:
```typescript
POST /api/admin/users/[userId]/subscription
Body: { planId: 'plan-uuid', status: 'active' }
```

## How It Works

### Permission Checking

The system uses the `hasPermission()` function from `lib/permissions.ts`:

```typescript
import { hasPermission } from '@/lib/permissions';

if (hasPermission(userRole, 'signals', 'create')) {
  // User can create signals
}
```

### Dashboard Access Control

- **Sidebar**: Only shows menu items the user has permission to access
- **Sections**: Each section checks permissions before rendering
- **Access Denied**: Shows a clear message if user lacks permission

### Subscription Features

Features are gated by both role AND subscription:
- Premium courses require Pro/Enterprise subscription
- Mentorship requires subscription (frequency depends on plan)
- Trading signal priority depends on subscription tier

## Testing Roles

1. **Create test users** with different roles
2. **Sign in** as each user
3. **Check dashboard** - verify correct features are visible
4. **Test access** - try accessing restricted sections

## API Endpoints

### Get User Permissions
```typescript
GET /api/subscriptions
// Returns user's active subscription
```

### Update User Role (Admin only)
```typescript
PUT /api/admin/users/[userId]/role
Body: { role: 'TRADER' }
```

### Assign Subscription (Admin only)
```typescript
POST /api/admin/users/[userId]/subscription
Body: { planId: 'uuid', status: 'active' }
```

## Files Created/Modified

### New Files:
- `supabase/migrations/002_add_roles_and_permissions.sql` - Database migration
- `lib/permissions.ts` - Permission checking utilities
- `hooks/use-permissions.ts` - React hook for permissions
- `app/api/subscriptions/route.ts` - Subscription API
- `app/api/admin/users/[userId]/role/route.ts` - Role management API
- `app/api/admin/users/[userId]/subscription/route.ts` - Subscription assignment API

### Modified Files:
- `components/dashboard/dashboard-layout.tsx` - Added permission checks
- `components/dashboard/dashboard-sidebar.tsx` - Filter menu by permissions
- `components/dashboard/admin-panel.tsx` - Role and subscription management
- `components/dashboard/profile-section.tsx` - Show subscription status

## Next Steps

1. **Run the migration** in Supabase SQL Editor
2. **Test the system** with different user roles
3. **Assign subscriptions** to test users via Admin Panel
4. **Verify** that features are properly gated

## Notes

- Roles are hierarchical (higher roles inherit lower permissions)
- Subscriptions enhance features but don't replace role permissions
- Admin role always has full access regardless of subscription
- All permission checks happen both client-side and server-side

