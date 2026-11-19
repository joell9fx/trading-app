/**
 * Single source of truth for "is this an admin?". Roles are stored lowercase
 * since migration 041, but legacy rows/code may still use 'ADMIN'.
 */
export function isAdminRole(role: unknown, isOwner?: boolean | null): boolean {
  if (isOwner === true) return true
  const normalized = (role ?? '').toString().toLowerCase()
  return normalized === 'admin' || normalized === 'owner'
}

/** Admin/owner, the legacy 'moderator' role, or the is_admin flag: may moderate community content. */
export function isModeratorRole(
  role: unknown,
  flags?: { is_owner?: boolean | null; is_admin?: boolean | null } | null,
): boolean {
  if (isAdminRole(role, flags?.is_owner) || flags?.is_admin === true) return true
  return (role ?? '').toString().toLowerCase() === 'moderator'
}

export function assertAdmin(user: any) {
  if (!user) throw new Error('Unauthorized')
  if (user.banned) throw new Error('Banned')
  if (!isAdminRole(user.role, user.is_owner)) {
    throw new Error('Forbidden')
  }
}

export function assertOwner(user: any) {
  if (!user) throw new Error('Unauthorized')
  if (user.banned) throw new Error('Banned')
  if (!user.is_owner) throw new Error('Forbidden')
}


