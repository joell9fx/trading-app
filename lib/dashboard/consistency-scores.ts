/**
 * Deterministic consistency, discipline, and process-quality scores from journal entries.
 * All scores 0–100. Used by Consistency section and AI Coach.
 */

import type { Database } from '@/types/supabase';
import { generatePerformanceReport } from './performance-report-generator';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

export interface TrendSnapshot {
  count: number;
  winRatePct: number;
  totalR: number;
  avgR: number;
  ruleFollowedPct: number;
  avgExecution: number | null;
}

export interface ConsistencyScores {
  /** 0–100 overall process consistency */
  overallConsistency: number;
  /** 0–100 rule-following discipline */
  discipline: number;
  /** 0–100 execution quality */
  execution: number;
  /** 0–100 confidence score stability (low variance = high) */
  confidenceStability: number;
  /** Consecutive days with at least one entry (by entry_date) */
  journalStreak: number;
  /** Consecutive entries (newest first) where rule_followed === true */
  ruleFollowedStreak: number;
  /** Last 7 entries */
  trendLast7: TrendSnapshot;
  /** Last 30 entries */
  trendLast30: TrendSnapshot;
  /** What is helping the score */
  helping: string[];
  /** What is hurting the score */
  hurting: string[];
}

const EMPTY_TREND: TrendSnapshot = {
  count: 0,
  winRatePct: 0,
  totalR: 0,
  avgR: 0,
  ruleFollowedPct: 0,
  avgExecution: null,
};

function parseR(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).trim().replace(/,/g, '').replace(/[Rr]/g, '');
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toScore(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(((clamped - min) / (max - min)) * 100);
}

/** Entries ordered by entry_date desc (newest first). Count consecutive calendar days with ≥1 entry. */
function computeJournalStreak(rows: JournalEntryRow[]): number {
  if (rows.length === 0) return 0;
  const sorted = [...rows].sort(
    (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );
  const uniqueDates = new Set<string>();
  for (const r of sorted) {
    uniqueDates.add(r.entry_date);
  }
  const dates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a));
  if (dates.length === 0) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) streak += 1;
    else break;
  }
  return streak;
}

/** Consecutive entries (newest first) where rule_followed === true. */
function computeRuleFollowedStreak(rows: JournalEntryRow[]): number {
  const sorted = [...rows].sort(
    (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );
  let streak = 0;
  for (const r of sorted) {
    if (r.rule_followed === true) streak += 1;
    else break;
  }
  return streak;
}

/** Proportion of entries with key fields filled (setup_type, session, rule_followed, execution_quality, confidence_score). */
function dataCompleteness(rows: JournalEntryRow[]): number {
  if (rows.length === 0) return 0;
  let complete = 0;
  for (const r of rows) {
    const hasSetup = (r.setup_type ?? '').trim() !== '';
    const hasSession = (r.session ?? '').trim() !== '';
    const hasRule = r.rule_followed !== null && r.rule_followed !== undefined;
    const hasExec =
      r.execution_quality !== null &&
      r.execution_quality !== undefined &&
      Number.isFinite(Number(r.execution_quality));
    const hasConf =
      r.confidence_score !== null &&
      r.confidence_score !== undefined &&
      Number.isFinite(Number(r.confidence_score));
    if (hasSetup && hasSession && hasRule && (hasExec || hasConf)) complete += 1;
  }
  return rows.length ? (complete / rows.length) * 100 : 0;
}

function buildTrend(rows: JournalEntryRow[]): TrendSnapshot {
  if (rows.length === 0) return EMPTY_TREND;
  const rValues = rows.map((r) => parseR(r.result_r));
  const wins = rValues.filter((v) => v > 0).length;
  const totalR = rValues.reduce((s, v) => s + v, 0);
  const followed = rows.filter((r) => r.rule_followed === true).length;
  const execScores = rows
    .map((r) => r.execution_quality)
    .filter((e) => e != null && Number.isFinite(Number(e))) as number[];
  const avgExecution =
    execScores.length > 0 ? execScores.reduce((a, b) => a + b, 0) / execScores.length : null;
  return {
    count: rows.length,
    winRatePct: (wins / rows.length) * 100,
    totalR,
    avgR: totalR / rows.length,
    ruleFollowedPct: (followed / rows.length) * 100,
    avgExecution,
  };
}

/**
 * Compute all consistency and discipline scores from journal entry rows.
 * Rows can be in any order; internally sorted by entry_date desc where needed.
 */
export function computeConsistencyScores(rows: JournalEntryRow[]): ConsistencyScores {
  const helping: string[] = [];
  const hurting: string[] = [];

  if (rows.length === 0) {
    return {
      overallConsistency: 0,
      discipline: 0,
      execution: 0,
      confidenceStability: 0,
      journalStreak: 0,
      ruleFollowedStreak: 0,
      trendLast7: EMPTY_TREND,
      trendLast30: EMPTY_TREND,
      helping: ['Log trades in the Growth Journal to see consistency scores.'],
      hurting: [],
    };
  }

  const report = generatePerformanceReport(rows, { dateFrom: '', dateTo: '' });
  const data = report.report_data;
  const ruleStats = data.rule_followed_stats;
  const mistakes = data.mistake_patterns ?? [];
  const totalWithRule = ruleStats.followed.count + ruleStats.broken.count;

  const sorted = [...rows].sort(
    (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );
  const last7 = sorted.slice(0, 7);
  const last30 = sorted.slice(0, 30);

  const journalStreak = computeJournalStreak(rows);
  const ruleFollowedStreak = computeRuleFollowedStreak(rows);
  const completeness = dataCompleteness(rows);
  const topMistakeCount = mistakes[0]?.count ?? 0;
  const mistakeRatio = rows.length > 0 ? topMistakeCount / rows.length : 0;

  const disciplinePct =
    totalWithRule > 0 ? (ruleStats.followed.count / totalWithRule) * 100 : 50;
  const discipline = Math.round(Math.min(100, Math.max(0, disciplinePct)));
  if (discipline >= 70) helping.push('Strong rule-following rate.');
  else if (totalWithRule >= 3 && discipline < 50) hurting.push('Rule-following rate is low; aim to stick to your plan.');

  const execScores = rows
    .map((r) => r.execution_quality)
    .filter((e) => e != null && Number.isFinite(Number(e))) as number[];
  const avgExec =
    execScores.length > 0
      ? execScores.reduce((a, b) => a + b, 0) / execScores.length
      : null;
  const execution =
    avgExec != null ? toScore(avgExec, 1, 10) : 0;
  if (avgExec != null && avgExec >= 7) helping.push('Good execution quality average.');
  else if (avgExec != null && avgExec < 5 && execScores.length >= 3)
    hurting.push('Execution quality is below 5 on average; focus on process.');

  const confScores = rows
    .map((r) => r.confidence_score)
    .filter((c) => c != null && Number.isFinite(Number(c))) as number[];
  let confidenceStability = 50;
  if (confScores.length >= 3) {
    const mean = confScores.reduce((a, b) => a + b, 0) / confScores.length;
    const variance =
      confScores.reduce((s, c) => s + (c - mean) ** 2, 0) / confScores.length;
    const std = Math.sqrt(variance);
    confidenceStability = Math.round(Math.max(0, 100 - std * 15));
    if (std <= 1.5) helping.push('Stable confidence scores.');
    else if (std >= 3) hurting.push('High variance in confidence; review when you trade.');
  }
  if (confScores.length < 2) confidenceStability = 0;

  const streakScore = Math.min(100, journalStreak * 12);
  const completenessScore = completeness;
  const lowMistakeScore = Math.max(0, 100 - mistakeRatio * 150);
  const overallConsistency = Math.round(
    (streakScore * 0.25 + completenessScore * 0.4 + lowMistakeScore * 0.2 + discipline * 0.15)
  );
  const overall = Math.min(100, Math.max(0, overallConsistency));

  if (journalStreak >= 3) helping.push(`${journalStreak}-day journaling streak.`);
  else if (rows.length >= 1) hurting.push('Build a journaling streak by logging on consecutive days.');
  if (completeness >= 70) helping.push('High data completeness (setup, session, rules).');
  else if (rows.length >= 5) hurting.push('Fill setup type, session, and rule-followed for better insights.');
  if (mistakeRatio <= 0.2 && mistakes.length > 0)
    helping.push('Limited repeat mistakes.');
  else if (topMistakeCount >= 3)
    hurting.push('Same mistake recurring; plan one change to address it.');
  if (ruleFollowedStreak >= 3)
    helping.push(`${ruleFollowedStreak} trades in a row with rules followed.`);

  return {
    overallConsistency: overall,
    discipline,
    execution,
    confidenceStability,
    journalStreak,
    ruleFollowedStreak,
    trendLast7: buildTrend(last7),
    trendLast30: buildTrend(last30),
    helping: helping.length ? helping : ['Keep logging to see what helps.'],
    hurting,
  };
}
