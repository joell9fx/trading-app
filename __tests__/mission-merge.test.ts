/**
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals'
import { mergeMission } from '@/lib/trader-mission/mission-service'

const plan = (goal: string) => ({
  date: '2026-11-26',
  sessionFocus: 'London' as const,
  primaryAsset: 'XAUUSD',
  secondaryAsset: 'EURUSD',
  maxTrades: 3,
  riskPerTrade: '0.5R',
  goal,
})

describe('mergeMission', () => {
  it('prefers the server copy of each part', () => {
    const { merged, localHadMore } = mergeMission({ plan: plan('server') }, { plan: plan('local') })
    expect(merged.plan?.goal).toBe('server')
    expect(localHadMore).toBe(false)
  })

  it('keeps local-only parts and flags them for upload', () => {
    const discipline = { date: '2026-11-26', rules: { usedStopLoss: true } as never }
    const { merged, localHadMore } = mergeMission({ plan: plan('server') }, { discipline })
    expect(merged.plan?.goal).toBe('server')
    expect(merged.discipline).toEqual(discipline)
    expect(localHadMore).toBe(true)
  })

  it('handles no server row', () => {
    const { merged, localHadMore } = mergeMission(null, { plan: plan('offline') })
    expect(merged.plan?.goal).toBe('offline')
    expect(merged.completion).toBeNull()
    expect(localHadMore).toBe(true)
  })

  it('returns all-null parts when neither side has data', () => {
    expect(mergeMission(null, null)).toEqual({
      merged: { plan: null, discipline: null, psychology: null, completion: null },
      localHadMore: false,
    })
  })
})
