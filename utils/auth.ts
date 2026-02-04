export function assertAdmin(user: any) {
  if (!user) throw new Error('Unauthorized')
  if (user.banned) throw new Error('Banned')
  const role = (user.role || '').toString().toLowerCase()
  if (!(role === 'admin' || role === 'owner' || user.is_owner === true)) {
    throw new Error('Forbidden')
  }
}

export function assertOwner(user: any) {
  if (!user) throw new Error('Unauthorized')
  if (user.banned) throw new Error('Banned')
  if (!user.is_owner) throw new Error('Forbidden')
}


