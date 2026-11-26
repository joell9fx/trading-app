/**
 * Trader Mission — daily plan, discipline tracking, and mission completion.
 *
 * Storage: localStorage is the instant, synchronous cache the cards read from.
 * Every save is also written to the `trader_missions` table (migration 047) in
 * the background, and `hydrateTodayMission()` pulls the server copy into the
 * cache on load, so missions follow the member across devices. If the table
 * doesn't exist yet or the network fails, everything keeps working locally.
 * Trade count comes from journal_entries.
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

export type StoredMission = {
  plan?: MissionPlan | null;
  discipline?: DisciplineState | null;
  psychology?: PsychologyState | null;
  completion?: MissionCompletionState | null;
};

function persistMission(date: string, payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const key = getDateKey(date);
  let merged: StoredMission | null = null;
  try {
    const existing = localStorage.getItem(key);
    merged = existing ? { ...JSON.parse(existing), ...payload } : payload;
    localStorage.setItem(key, JSON.stringify(merged));
  } catch {
    // ignore
  }
  if (merged) void pushMissionToServer(date, merged);
}

const TABLE = 'trader_missions';

async function currentUserId(): Promise<string | null> {
  try {
    const supabase = createSupabaseClient();
    // getSession reads the local session (no network); RLS enforces ownership server-side.
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Best-effort upsert of one day's mission. Failures are ignored (local copy stays). */
async function pushMissionToServer(date: string, mission: StoredMission): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  try {
    const supabase = createSupabaseClient();
    await supabase.from(TABLE).upsert(
      {
        user_id: userId,
        mission_date: date,
        plan: mission.plan ?? null,
        discipline: mission.discipline ?? null,
        psychology: mission.psychology ?? null,
        completion: mission.completion ?? null,
      },
      { onConflict: 'user_id,mission_date' },
    );
  } catch {
    // offline or table not created yet
  }
}

const MISSION_PARTS = ['plan', 'discipline', 'psychology', 'completion'] as const;

/**
 * Merges the server and local copies of a day's mission, part by part.
 * Server parts win; parts only present locally are kept and flagged so they
 * can be pushed up.
 */
export function mergeMission(
  server: StoredMission | null,
  local: StoredMission | null,
): { merged: Required<StoredMission>; localHadMore: boolean } {
  const merged = {} as Required<StoredMission>;
  let localHadMore = false;
  for (const part of MISSION_PARTS) {
    const fromServer = server?.[part] ?? null;
    const fromLocal = local?.[part] ?? null;
    (merged as Record<string, unknown>)[part] = fromServer ?? fromLocal;
    if (!fromServer && fromLocal) localHadMore = true;
  }
  return { merged, localHadMore };
}

/**
 * Pulls today's mission from the server into the local cache.
 * Server parts win over local ones when present; local-only parts are kept and
 * pushed up, so a mission started offline isn't lost.
 * Resolves to true when the server copy was read.
 */
export async function hydrateTodayMission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const userId = await currentUserId();
  if (!userId) return false;
  const date = getTodayDate();
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('plan, discipline, psychology, completion')
      .eq('user_id', userId)
      .eq('mission_date', date)
      .maybeSingle();
    if (error) return false;

    const key = getDateKey(date);
    const local: StoredMission = JSON.parse(localStorage.getItem(key) || '{}');
    const { merged, localHadMore } = mergeMission(data ?? null, local);
    localStorage.setItem(key, JSON.stringify(merged));
    if (localHadMore) void pushMissionToServer(date, merged);
    return true;
  } catch {
    return false;
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
