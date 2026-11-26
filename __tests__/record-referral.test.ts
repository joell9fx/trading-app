/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import type { SupabaseClient } from '@supabase/supabase-js'
import { recordReferral } from '@/lib/referrals/record-referral'

type Row = Record<string, any>
type Tables = Record<string, Row[]>

/**
 * Minimal in-memory stand-in for the parts of the Supabase query builder that
 * recordReferral uses: select/eq/is/maybeSingle, insert and update.
 */
function fakeSupabase(tables: Tables, opts: { failInsertInto?: string } = {}) {
  const from = (table: string) => {
    const filters: Array<(r: Row) => boolean> = []
    let mode: 'select' | 'update' = 'select'
    let patch: Row = {}
    const rows = () => (tables[table] ??= [])
    const builder: any = {
      select: () => builder,
      eq: (col: string, val: unknown) => {
        filters.push((r) => r[col] === val)
        return builder
      },
      is: (col: string, val: unknown) => {
        filters.push((r) => (r[col] ?? null) === val)
        return builder
      },
      maybeSingle: async () => ({ data: rows().find((r) => filters.every((f) => f(r))) ?? null, error: null }),
      insert: async (values: Row[]) => {
        if (opts.failInsertInto === table) return { error: { message: 'insert failed' } }
        rows().push(...values)
        return { error: null }
      },
      update: (values: Row) => {
        mode = 'update'
        patch = values
        return builder
      },
      // Awaiting an update chain applies it.
      then: (resolve: (v: unknown) => void) => {
        if (mode === 'update') {
          rows()
            .filter((r) => filters.every((f) => f(r)))
            .forEach((r) => Object.assign(r, patch))
        }
        resolve({ error: null })
      },
    }
    return builder
  }
  return { from } as unknown as SupabaseClient
}

describe('recordReferral', () => {
  let tables: Tables

  beforeEach(() => {
    tables = {
      profiles: [
        { id: 'referrer', referral_code: 'GOLD123', referred_by: null },
        { id: 'newbie', referral_code: 'NEW1', referred_by: null },
      ],
      referrals: [],
      notifications: [],
    }
  })

  it('records the referral, sets referred_by and notifies the referrer', async () => {
    const result = await recordReferral(fakeSupabase(tables), 'newbie', ' GOLD123 ')
    expect(result).toEqual({ status: 'recorded' })
    expect(tables.referrals).toEqual([{ referrer_id: 'referrer', referred_user_id: 'newbie', referral_code: 'GOLD123' }])
    expect(tables.profiles.find((p) => p.id === 'newbie')?.referred_by).toBe('GOLD123')
    expect(tables.notifications).toHaveLength(1)
    expect(tables.notifications[0].user_id).toBe('referrer')
  })

  it('only records once', async () => {
    const db = fakeSupabase(tables)
    await recordReferral(db, 'newbie', 'GOLD123')
    const second = await recordReferral(db, 'newbie', 'GOLD123')
    expect(second).toEqual({ status: 'already_referred' })
    expect(tables.referrals).toHaveLength(1)
    expect(tables.notifications).toHaveLength(1)
  })

  it('ignores self-referral', async () => {
    const result = await recordReferral(fakeSupabase(tables), 'referrer', 'GOLD123')
    expect(result).toEqual({ status: 'ignored' })
    expect(tables.referrals).toHaveLength(0)
  })

  it('ignores unknown, empty and oversized codes', async () => {
    const db = fakeSupabase(tables)
    expect(await recordReferral(db, 'newbie', 'NOPE')).toEqual({ status: 'ignored' })
    expect(await recordReferral(db, 'newbie', '   ')).toEqual({ status: 'ignored' })
    expect(await recordReferral(db, 'newbie', 'x'.repeat(65))).toEqual({ status: 'ignored' })
    expect(tables.profiles.find((p) => p.id === 'newbie')?.referred_by).toBeNull()
  })

  it('ignores users without a profile', async () => {
    expect(await recordReferral(fakeSupabase(tables), 'ghost', 'GOLD123')).toEqual({ status: 'ignored' })
  })

  it('reports an error and leaves the profile untouched when the insert fails', async () => {
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {})
    const result = await recordReferral(fakeSupabase(tables, { failInsertInto: 'referrals' }), 'newbie', 'GOLD123')
    expect(result).toEqual({ status: 'error' })
    expect(logged).toHaveBeenCalled()
    logged.mockRestore()
    expect(tables.profiles.find((p) => p.id === 'newbie')?.referred_by).toBeNull()
    expect(tables.notifications).toHaveLength(0)
  })
})
