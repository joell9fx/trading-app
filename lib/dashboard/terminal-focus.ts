/**
 * Deterministic "Today's Focus" points for the Terminal / Command Center.
 * Produces 3–5 practical focus points from journal-derived data.
 */

import type { PerformanceReportData, GroupedStat, RuleFollowedStats } from './performance-report-generator';
import type { ConsistencyScores } from './consistency-scores';

export interface TodaysFocusInput {
  reportData: PerformanceReportData;
  totalTrades: number;
  consistency: ConsistencyScores | null;
  nextActions: string[];
}

const DEFAULT_FOCUS = [
  'Log your trades in the Growth Journal to unlock personalised focus points.',
  'Add setup type and session to each entry for session/setup insights.',
  'Mark rule-followed on each trade to see discipline impact.',
];

/**
 * Build 3–5 practical focus points from the user's data.
 * Deterministic: same inputs always produce the same outputs.
 */
export function buildTodaysFocus(input: TodaysFocusInput): string[] {
  const { reportData, totalTrades, consistency, nextActions } = input;
  const points: string[] = [];

  if (totalTrades < 2) {
    return DEFAULT_FOCUS;
  }

  const setupBreakdown = (reportData.setup_type_breakdown ?? []).filter(
    (s) => s.key && s.key !== '—'
  );
  const sessionBreakdown = (reportData.session_breakdown ?? []).filter(
    (s) => s.key && s.key !== '—'
  );
  const bestSetup = setupBreakdown[0];
  const bestSession = sessionBreakdown[0];
  const mistakes = reportData.mistake_patterns ?? [];
  const ruleStats: RuleFollowedStats = reportData.rule_followed_stats;

  // 1. Best setup
  if (bestSetup && bestSetup.count >= 2) {
    points.push(`Prioritise ${bestSetup.key} setups (your best performer).`);
  }

  // 2. Best session
  if (bestSession && bestSession.count >= 2) {
    points.push(`Focus on ${bestSession.key} session.`);
  }

  // 3. Rule following
  if (ruleStats.followed.count >= 1 && ruleStats.broken.count >= 1) {
    if (ruleStats.followed.avgR > ruleStats.broken.avgR) {
      points.push('Follow your rules — rule-followed trades outperform.');
    } else {
      points.push('Stick to your plan; reduce rule breaks.');
    }
  } else if (consistency && consistency.discipline < 50 && totalTrades >= 3) {
    points.push('Follow your rules — mark rule-followed on each trade.');
  }

  // 4. Biggest mistake to avoid
  const topMistake = mistakes[0];
  if (topMistake && topMistake.count >= 2) {
    points.push(`Avoid: "${topMistake.phrase.slice(0, 50)}${topMistake.phrase.length > 50 ? '…' : ''}".`);
  }

  // 5. Consistency / process
  if (consistency) {
    if (consistency.overallConsistency < 50 && totalTrades >= 3) {
      points.push('Improve consistency: journal regularly and complete key fields.');
    } else if (consistency.journalStreak >= 3) {
      points.push(`Keep your ${consistency.journalStreak}-day journal streak.`);
    }
  }

  // 6. One concrete next action from coach if we have room
  if (points.length < 5 && nextActions.length > 0) {
    const action = nextActions[0];
    if (action && action.length < 80) {
      points.push(action);
    }
  }

  // Dedupe and cap
  const seen = new Set<string>();
  const unique = points.filter((p) => {
    const key = p.slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 5).length ? unique.slice(0, 5) : DEFAULT_FOCUS;
}
