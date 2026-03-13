/**
 * Trader Mission — daily plan, discipline tracking, and mission completion.
 * Mission plan and discipline/psychology stored in localStorage (per device).
 * Trade count from journal_entries. Ready for future Supabase table + AI coaching.
 */

import { createSupabaseClient } from '@/lib/supabase/client';

export type SessionFocus = 'Asia' | 'London' | 'New York';

export const PRIMARY_ASSETS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'US30', 'NAS100', 'BTC'] as const;
export const RISK_OPTIONS = ['0.25R', '0.5R', '1R', 'Custom'] as const;

export interface MissionPlan {
  date: string; // YYYY-MM-DD
  sessionFocus: SessionFocus;
  primaryAsset: string;
  secondaryAsset: string;
  maxTrades: number;
  riskPerTrade: string;
  goal: string;
}

export const DISCIPLINE_RULES = [
  { key: 'usedStopLoss', label: 'Used Stop Loss' },
  { key: 'followedEntryRules', label: 'Followed Entry Rules' },
  { key: 'stayedWithinMaxTrades', label: 'Stayed Within Max Trades' },
  { key: 'followedRiskPlan', label: 'Followed Risk Plan' },
  { key: 'avoidedRevengeTrading', label: 'Avoided Revenge Trading' },
] as const;

export type DisciplineRuleKey = (typeof DISCIPLINE_RULES)[number]['key'];

export interface DisciplineState {
  date: string;
  rules: Record<DisciplineRuleKey, boolean>;
}

export type BeforeTradingMood = 'Focused' | 'Calm' | 'Tired' | 'Stressed' | 'Overconfident';
export type PlanFollowed = 'Yes' | 'Partially' | 'No';

export interface PsychologyState {
  date: string;
  beforeMood?: BeforeTradingMood;
  afterPlanFollowed?: PlanFollowed;
}

export interface MissionCompletionState {
  date: string;
  completed: boolean;
  summaryPoints: string[];
  suggestions: string[];
}

const STORAGE_PREFIX = 'trader-mission';

function getDateKey(date: string): string {
  return `${STORAGE_PREFIX}-${date}`;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Get full mission state for today (plan + discipline + psychology + completion). */
export function getTodayMission(): {
  plan: MissionPlan | null;
  discipline: DisciplineState | null;
  psychology: PsychologyState | null;
  completion: MissionCompletionState | null;
} {
  const date = getTodayDate();
  const key = getDateKey(date);
  if (typeof window === 'undefined') {
    return { plan: null, discipline: null, psychology: null, completion: null };
  }
  try {
    const raw = localStorage.getItem(key);
    const stored = raw ? JSON.parse(raw) : {};
    return {
      plan: stored.plan ?? null,
      discipline: stored.discipline ?? null,
      psychology: stored.psychology ?? null,
      completion: stored.completion ?? null,
    };
  } catch {
    return { plan: null, discipline: null, psychology: null, completion: null };
  }
}

function persistMission(date: string, payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const key = getDateKey(date);
  try {
    const existing = localStorage.getItem(key);
    const merged = existing ? { ...JSON.parse(existing), ...payload } : payload;
    localStorage.setItem(key, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function saveMissionPlan(plan: Omit<MissionPlan, 'date'>): void {
  const date = getTodayDate();
  persistMission(date, { plan: { ...plan, date } });
}

export function updateDiscipline(rules: Partial<Record<DisciplineRuleKey, boolean>>): void {
  const date = getTodayDate();
  const { discipline } = getTodayMission();
  const nextRules: Record<DisciplineRuleKey, boolean> = {
    usedStopLoss: false,
    followedEntryRules: false,
    stayedWithinMaxTrades: false,
    followedRiskPlan: false,
    avoidedRevengeTrading: false,
    ...(discipline?.rules ?? {}),
    ...rules,
  };
  persistMission(date, { discipline: { date, rules: nextRules } });
}

export function getDisciplineScore(discipline: DisciplineState | null): number {
  if (!discipline) return 0;
  const keys = DISCIPLINE_RULES.map((r) => r.key);
  const followed = keys.filter((k) => discipline.rules[k as DisciplineRuleKey]).length;
  return keys.length > 0 ? Math.round((followed / keys.length) * 100) : 0;
}

export function savePsychology(state: Partial<Omit<PsychologyState, 'date'>>): void {
  const date = getTodayDate();
  const { psychology } = getTodayMission();
  persistMission(date, {
    psychology: { date, ...(psychology ?? {}), ...state },
  });
}

/** Get count of journal_entries for the current user today (entry_date = today). */
export async function getTradeCountToday(userId: string | undefined): Promise<number> {
  if (!userId) return 0;
  const supabase = createSupabaseClient();
  const today = getTodayDate();
  const { count, error } = await supabase
    .from('journal_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('entry_date', today);
  if (error) return 0;
  return count ?? 0;
}

export function completeMission(payload: {
  summaryPoints: string[];
  suggestions: string[];
}): void {
  const date = getTodayDate();
  persistMission(date, {
    completion: {
      date,
      completed: true,
      summaryPoints: payload.summaryPoints,
      suggestions: payload.suggestions,
    },
  });
}
