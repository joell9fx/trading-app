/**
 * @jest-environment node
 */
import { assertAdmin, assertOwner, isAdminRole, isModeratorRole } from '@/utils/auth'
import { secretMatches } from '@/lib/api/internal-auth'

jest.mock('@/app/api/admin/auth', () => ({ requireAdmin: jest.fn() }))
jest.mock('@/lib/supabase/admin', () => ({ createAdminClient: jest.fn() }))

describe('isAdminRole', () => {
  it.each(['admin', 'ADMIN', 'owner', 'Owner'])('accepts %s', (role) => {
    expect(isAdminRole(role)).toBe(true)
  })

  it.each(['member', 'moderator', 'MEMBER', '', null, undefined])('rejects %p', (role) => {
    expect(isAdminRole(role)).toBe(false)
  })

  it('treats is_owner as admin regardless of role', () => {
    expect(isAdminRole('member', true)).toBe(true)
  })
})

describe('isModeratorRole', () => {
  it('accepts admins, owners, moderators and the is_admin flag', () => {
    expect(isModeratorRole('admin')).toBe(true)
    expect(isModeratorRole('MODERATOR')).toBe(true)
    expect(isModeratorRole('member', { is_admin: true })).toBe(true)
    expect(isModeratorRole('member', { is_owner: true })).toBe(true)
  })

  it('rejects plain members', () => {
    expect(isModeratorRole('member')).toBe(false)
    expect(isModeratorRole('member', { is_admin: false, is_owner: false })).toBe(false)
  })
})

describe('assertAdmin / assertOwner', () => {
  it('throws Unauthorized without a user', () => {
    expect(() => assertAdmin(null)).toThrow('Unauthorized')
    expect(() => assertOwner(null)).toThrow('Unauthorized')
  })

  it('throws Banned for banned admins', () => {
    expect(() => assertAdmin({ role: 'admin', banned: true })).toThrow('Banned')
  })

  it('allows lowercase admin, forbids members', () => {
    expect(() => assertAdmin({ role: 'admin' })).not.toThrow()
    expect(() => assertAdmin({ role: 'member' })).toThrow('Forbidden')
  })

  it('owner check requires is_owner', () => {
    expect(() => assertOwner({ role: 'owner', is_owner: false })).toThrow('Forbidden')
    expect(() => assertOwner({ is_owner: true })).not.toThrow()
  })
})

describe('secretMatches', () => {
  it('matches identical secrets', () => {
    expect(secretMatches('s3cret-value', 's3cret-value')).toBe(true)
  })

  it('rejects different, missing or empty secrets', () => {
    expect(secretMatches('wrong', 's3cret-value')).toBe(false)
    expect(secretMatches(null, 's3cret-value')).toBe(false)
    expect(secretMatches('s3cret-value', undefined)).toBe(false)
    expect(secretMatches('', '')).toBe(false)
  })
})
