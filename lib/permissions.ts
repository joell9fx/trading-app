/**
 * Role-based access control utilities
 * Handles permissions checking based on user roles and subscriptions
 */

export type UserRole = 'VIEWER' | 'MEMBER' | 'TRADER' | 'MODERATOR' | 'ADMIN';

export type Resource = 
  | 'courses' 
  | 'community' 
  | 'signals' 
  | 'mentorship' 
  | 'chat' 
  | 'users' 
  | 'settings';

export type Action = 
  | 'view' 
  | 'view_basic' 
  | 'view_all' 
  | 'view_priority' 
  | 'enroll' 
  | 'post' 
  | 'create' 
  | 'manage' 
  | 'moderate' 
  | 'delete_posts' 
  | 'book' 
  | 'participate';

export interface UserPermissions {
  role: UserRole;
  subscription?: {
    planId: string;
    planName: string;
    status: string;
    isActive: boolean;
  };
}

export interface PlanFeatures {
  basicCourses: boolean;
  premiumCourses: boolean;
  tradingSignals: 'basic' | 'priority' | 'premium' | 'none';
  mentorship: 'none' | 'monthly' | 'weekly' | 'unlimited';
  support: 'email' | 'priority' | '24/7';
}

/**
 * Role hierarchy - higher roles inherit lower role permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  TRADER: 3,
  MODERATOR: 4,
  ADMIN: 5,
};

/**
 * Default permissions for each role
 */
const ROLE_PERMISSIONS: Record<UserRole, Record<Resource, Action[]>> = {
  VIEWER: {
    courses: ['view_basic'],
    community: ['view'],
    signals: ['view_basic'],
    mentorship: [],
    chat: [],
    users: [],
    settings: [],
  },
  MEMBER: {
    courses: ['view_basic', 'enroll'],
    community: ['view', 'post'],
    signals: ['view_basic'],
    mentorship: [],
    chat: ['participate'],
    users: [],
    settings: [],
  },
  TRADER: {
    courses: ['view_all', 'enroll'],
    community: ['view', 'post'],
    signals: ['view_priority', 'create'],
    mentorship: ['book'],
    chat: ['participate'],
    users: [],
    settings: [],
  },
  MODERATOR: {
    courses: ['view_all'],
    community: ['view', 'post', 'moderate', 'delete_posts'],
    signals: ['view_all'],
    mentorship: [],
    chat: ['participate', 'moderate'],
    users: [],
    settings: [],
  },
  ADMIN: {
    courses: ['view_all', 'enroll', 'manage'],
    community: ['view', 'post', 'manage', 'moderate', 'delete_posts'],
    signals: ['view_all', 'create', 'manage'],
    mentorship: ['book', 'manage'],
    chat: ['participate', 'manage', 'moderate'],
    users: ['manage'],
    settings: ['manage'],
  },
};

/**
 * Plan features mapping
 */
export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    basicCourses: true,
    premiumCourses: false,
    tradingSignals: 'basic',
    mentorship: 'none',
    support: 'email',
  },
  pro: {
    basicCourses: true,
    premiumCourses: true,
    tradingSignals: 'priority',
    mentorship: 'monthly',
    support: 'priority',
  },
  enterprise: {
    basicCourses: true,
    premiumCourses: true,
    tradingSignals: 'premium',
    mentorship: 'weekly',
    support: '24/7',
  },
};

/**
 * Check if user has permission for a resource and action
 */
export function hasPermission(
  userRole: UserRole,
  resource: Resource,
  action: Action
): boolean {
  const rolePerms = ROLE_PERMISSIONS[userRole];
  if (!rolePerms) return false;

  const resourcePerms = rolePerms[resource];
  if (!resourcePerms) return false;

  // Check exact match
  if (resourcePerms.includes(action)) return true;

  // Check hierarchy (view_all includes view, view_priority includes view_basic, etc.)
  if (action === 'view' && resourcePerms.includes('view_all')) return true;
  if (action === 'view_basic' && resourcePerms.includes('view_priority')) return true;
  if (action === 'view_basic' && resourcePerms.includes('view_all')) return true;
  if (action === 'view_priority' && resourcePerms.includes('view_all')) return true;

  return false;
}

/**
 * Check if user role is at least the minimum required role
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Get plan features based on plan name
 */
export function getPlanFeatures(planName: string): PlanFeatures {
  const normalizedName = planName.toLowerCase();
  return PLAN_FEATURES[normalizedName] || PLAN_FEATURES.free;
}

/**
 * Check if user can access premium courses
 */
export function canAccessPremiumCourses(
  userRole: UserRole,
  subscription?: { planName: string; isActive: boolean }
): boolean {
  // Admins and moderators always have access
  if (hasMinimumRole(userRole, 'MODERATOR')) return true;

  // Check subscription
  if (subscription?.isActive) {
    const features = getPlanFeatures(subscription.planName);
    return features.premiumCourses;
  }

  return false;
}

/**
 * Check if user can access mentorship
 */
export function canAccessMentorship(
  userRole: UserRole,
  subscription?: { planName: string; isActive: boolean }
): 'none' | 'monthly' | 'weekly' | 'unlimited' {
  // Admins have unlimited access
  if (userRole === 'ADMIN') return 'unlimited';

  // Check subscription
  if (subscription?.isActive) {
    const features = getPlanFeatures(subscription.planName);
    return features.mentorship;
  }

  // Traders can book but need subscription for frequency
  if (userRole === 'TRADER') return 'monthly';

  return 'none';
}

/**
 * Get trading signals access level
 */
export function getSignalsAccess(
  userRole: UserRole,
  subscription?: { planName: string; isActive: boolean }
): 'none' | 'basic' | 'priority' | 'premium' {
  // Admins and moderators have premium access
  if (hasMinimumRole(userRole, 'MODERATOR')) return 'premium';

  // Check subscription
  if (subscription?.isActive) {
    const features = getPlanFeatures(subscription.planName);
    return features.tradingSignals;
  }

  // Default based on role
  if (userRole === 'TRADER') return 'priority';
  if (userRole === 'MEMBER' || userRole === 'VIEWER') return 'basic';

  return 'none';
}

/**
 * Check if user can create signals
 */
export function canCreateSignals(userRole: UserRole): boolean {
  return hasPermission(userRole, 'signals', 'create') || hasPermission(userRole, 'signals', 'manage');
}

/**
 * Get support level
 */
export function getSupportLevel(
  subscription?: { planName: string; isActive: boolean }
): 'email' | 'priority' | '24/7' {
  if (subscription?.isActive) {
    const features = getPlanFeatures(subscription.planName);
    return features.support;
  }
  return 'email';
}

