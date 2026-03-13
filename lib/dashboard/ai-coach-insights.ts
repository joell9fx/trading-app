/**
 * Rule-based coaching insights from journal entries and performance data.
 * No external AI; deterministic summaries and recommendations.
 */

import type { Database } from '@/types/supabase';
import {
  generatePerformanceReport,
  type PerformanceReportData,
  type GroupedStat,
  type RuleFollowedStats,
  type BucketStat,
} from './performance-report-generator';
import {
  computeConsistencyScores,
  type ConsistencyScores,
} from './consistency-scores';
import {
  computePerformanceMetrics,
  type PerformanceMetricsResult,
} from './performance-metrics';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

export interface CoachInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral';
}

export interface CoachOutput {
  insights: CoachInsight[];
  weeklySummary: string;
  nextActions: string[];
}

const DEFAULT_SUMMARY =
  'Add journal entries with setup type, session, and rule-followed data to get a personalised coaching summary.';

const DEFAULT_ACTIONS = [
  'Log your next 5 trades in the Growth Journal with setup type and session.',
  'Mark whether you followed your rules on each trade to see rule-followed vs rule-broken impact.',
  'Review Performance Analytics to spot your best setup and session.',
];

function bestFromGrouped(grouped: GroupedStat[], label: string): CoachInsight | null {
  const top = grouped.filter((g) => g.key && g.key !== '—')[0];
  if (!top || top.count < 2) return null;
  const avg = top.avgR.toFixed(1);
  const wr = top.winRatePct.toFixed(0);
  return {
    id: `best-${label.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Best performing ${label}`,
    description: `${top.key} is your strongest ${label} (${top.count} trades, ${wr}% win rate, ${Number(avg) >= 0 ? '+' : ''}${avg}R avg).`,
    type: 'positive',
  };
}

function worstMistake(mistakes: { phrase: string; count: number }[]): CoachInsight | null {
  const top = mistakes[0];
  if (!top || top.count < 2) return null;
  return {
    id: 'worst-mistake',
    title: 'Worst recurring mistake',
    description: `"${top.phrase}" appears in ${top.count} entries. Focus on reducing this pattern.`,
    type: 'warning',
  };
}

function ruleImpact(stats: RuleFollowedStats): CoachInsight | null {
  if (stats.followed.count < 1 && stats.broken.count < 1) return null;
  const f = stats.followed;
  const b = stats.broken;
  if (f.count >= 1 && b.count >= 1) {
    const diff = f.avgR - b.avgR;
    const followBetter = diff > 0;
    return {
      id: 'rule-impact',
      title: 'Rule-followed vs rule-broken impact',
      description: followBetter
        ? `When you followed your rules (${f.count} trades): ${f.avgR.toFixed(1)}R avg. When you didn't (${b.count} trades): ${b.avgR.toFixed(1)}R avg. Rule-following outperforms by ${diff.toFixed(1)}R.`
        : `Rule-broken trades (${b.count}) averaged ${b.avgR.toFixed(1)}R; rule-followed (${f.count}) averaged ${f.avgR.toFixed(1)}R. Stick to your plan.`,
      type: followBetter ? 'positive' : 'warning',
    };
  }
  if (f.count >= 2) {
    return {
      id: 'rule-impact',
      title: 'Rule-followed vs rule-broken impact',
      description: `You followed your rules on ${f.count} trades (avg ${f.avgR.toFixed(1)}R). Keep logging rule adherence to compare with rule-broken trades.`,
      type: 'neutral',
    };
  }
  if (b.count >= 2) {
    return {
      id: 'rule-impact',
      title: 'Rule-followed vs rule-broken impact',
      description: `You marked ${b.count} trades as rule-broken (avg ${b.avgR.toFixed(1)}R). Try to increase rule-followed trades next week.`,
      type: 'warning',
    };
  }
  return null;
}

function confidenceInsight(buckets: BucketStat[]): CoachInsight | null {
  const withScore = buckets.filter((b) => b.bucket !== 'No score' && b.count > 0);
  if (withScore.length < 2) return null;
  const best = withScore.reduce((a, b) => (a.avgR >= b.avgR ? a : b));
  const worst = withScore.reduce((a, b) => (a.avgR <= b.avgR ? a : b));
  if (best.count < 1 || worst.count < 1) return null;
  return {
    id: 'confidence-insight',
    title: 'Confidence score insight',
    description: `Your ${best.bucket} confidence trades average ${best.avgR.toFixed(1)}R; ${worst.bucket} average ${worst.avgR.toFixed(1)}R. ${best.avgR >= worst.avgR ? 'Trade more when confidence aligns with your edge.' : 'Review whether lower-confidence trades are worth taking.'}`,
    type: best.avgR >= 0 ? 'positive' : 'neutral',
  };
}

function executionInsight(buckets: BucketStat[]): CoachInsight | null {
  const withScore = buckets.filter((b) => b.bucket !== 'No score' && b.count > 0);
  if (withScore.length < 2) return null;
  const best = withScore.reduce((a, b) => (a.avgR >= b.avgR ? a : b));
  const worst = withScore.reduce((a, b) => (a.avgR <= b.avgR ? a : b));
  if (best.count < 1 || worst.count < 1) return null;
  return {
    id: 'execution-insight',
    title: 'Execution quality insight',
    description: `Execution ${best.bucket} averages ${best.avgR.toFixed(1)}R; ${worst.bucket} averages ${worst.avgR.toFixed(1)}R. Focus on process to improve execution consistency.`,
    type: best.avgR >= 0 ? 'positive' : 'warning',
  };
}

function mostImprovedArea(data: PerformanceReportData, totalTrades: number): CoachInsight | null {
  if (totalTrades < 5) return null;
  const setup = data.setup_type_breakdown?.filter((s) => s.key && s.key !== '—') ?? [];
  const session = data.session_breakdown?.filter((s) => s.key && s.key !== '—') ?? [];
  const byAvgR = [...setup, ...session].filter((s) => s.count >= 2).sort((a, b) => b.avgR - a.avgR);
  const top = byAvgR[0];
  if (!top) return null;
  const label = setup.some((s) => s.key === top.key) ? 'setup' : 'session';
  return {
    id: 'most-improved',
    title: 'Strongest area',
    description: `Your best ${label} by average R is "${top.key}" (${top.avgR.toFixed(1)}R avg over ${top.count} trades). Lean into what works.`,
    type: 'positive',
  };
}

function biggestLeak(
  mistakes: { phrase: string; count: number }[],
  ruleStats: RuleFollowedStats
): CoachInsight | null {
  const topMistake = mistakes[0];
  const brokenWorse =
    ruleStats.broken.count >= 2 &&
    ruleStats.followed.count >= 2 &&
    ruleStats.broken.avgR < ruleStats.followed.avgR;
  if (topMistake && topMistake.count >= 2) {
    return {
      id: 'biggest-leak',
      title: 'Biggest leak',
      description: brokenWorse
        ? `Recurring mistake "${topMistake.phrase}" (${topMistake.count}×) and rule-broken trades (${ruleStats.broken.avgR.toFixed(1)}R avg) are hurting results. Address both next week.`
        : `Your most frequent mistake: "${topMistake.phrase}" (${topMistake.count}×). Plan one change to reduce it.`,
      type: 'warning',
    };
  }
  if (brokenWorse) {
    return {
      id: 'biggest-leak',
      title: 'Biggest leak',
      description: `Rule-broken trades average ${ruleStats.broken.avgR.toFixed(1)}R vs ${ruleStats.followed.avgR.toFixed(1)}R when you followed rules. Reducing rule breaks is a high-impact lever.`,
      type: 'warning',
    };
  }
  return null;
}

function buildSummary(
  data: PerformanceReportData,
  totalTrades: number,
  _winRate: number,
  _totalR: number,
  consistency: ConsistencyScores | null,
  perf: PerformanceMetricsResult | null
): string {
  if (totalTrades < 2) return DEFAULT_SUMMARY;
  const session = data.session_breakdown?.filter((s) => s.key && s.key !== '—')[0];
  const setup = data.setup_type_breakdown?.filter((s) => s.key && s.key !== '—')[0];
  const mistake = data.mistake_patterns?.[0];
  const rule = data.rule_followed_stats;
  const parts: string[] = [];
  if (session && setup) {
    parts.push(
      `You perform best during ${session.key} session on ${setup.key} setups.`
    );
  } else if (session) {
    parts.push(`Your strongest session is ${session.key}.`);
  } else if (setup) {
    parts.push(`Your best-performing setup type is ${setup.key}.`);
  }
  if (mistake && mistake.count >= 2) {
    parts.push(`Your biggest recurring leak is ${mistake.phrase}.`);
  }
  if (rule.followed.count >= 1 && rule.broken.count >= 1) {
    const diff = rule.followed.avgR - rule.broken.avgR;
    if (diff > 0.5) {
      parts.push(
        'Trades where rules were followed outperform rule-broken trades significantly.'
      );
    }
  }
  if (perf && totalTrades >= 5) {
    const pf = perf.profitFactor != null ? perf.profitFactor.toFixed(1) : null;
    const exp = perf.expectancy.toFixed(2);
    const dd = perf.maxDrawdown > 0 ? perf.maxDrawdown.toFixed(1) : null;
    if (pf != null || exp || dd) {
      const perfParts: string[] = [];
      if (pf != null) perfParts.push(`profit factor is ${pf}`);
      perfParts.push(`expectancy is ${perf.expectancy >= 0 ? '+' : ''}${exp}R per trade`);
      if (dd != null) perfParts.push(`max drawdown was -${dd}R`);
      parts.push(`Your ${perfParts.join(', and your ')}.`);
    }
  }
  if (consistency && totalTrades >= 3) {
    if (consistency.discipline >= 70) {
      parts.push('Your discipline score is strong; keep following your rules.');
    } else if (consistency.discipline < 50 && (rule.followed.count + rule.broken.count) >= 3) {
      parts.push('Improving discipline (rule-following) will help; review your plan before each trade.');
    }
    if (consistency.overallConsistency >= 65) {
      parts.push('Consistency and process quality are solid.');
    } else if (consistency.overallConsistency > 0 && consistency.overallConsistency < 50) {
      parts.push('Focus on consistency: journaling streaks and complete data lift your score.');
    }
  }
  parts.push(
    `Focus next week on ${mistake && mistake.count >= 2 ? 'reducing that pattern and ' : ''}execution quality and patience.`
  );
  return parts.join(' ');
}

function buildNextActions(
  data: PerformanceReportData,
  totalTrades: number,
  ruleStats: RuleFollowedStats
): string[] {
  const actions: string[] = [];
  if (totalTrades < 3) {
    return DEFAULT_ACTIONS;
  }
  const mistake = data.mistake_patterns?.[0];
  if (mistake && mistake.count >= 2) {
    actions.push(`Reduce the "${mistake.phrase}" pattern: plan one concrete change before your next session.`);
  }
  if (ruleStats.broken.count >= 2 && ruleStats.followed.avgR > ruleStats.broken.avgR) {
    actions.push('Prioritise following your rules on every trade; review your plan before each entry.');
  }
  const lowExec = data.execution_quality_breakdown?.find(
    (b) => b.bucket === '1-3' && b.count > 0
  );
  if (lowExec && lowExec.avgR < 0) {
    actions.push('Improve execution on low-quality entries: wait for clearer setups or reduce size when confidence is low.');
  }
  const bestSession = data.session_breakdown?.filter((s) => s.key && s.key !== '—')[0];
  if (bestSession && bestSession.count >= 2) {
    actions.push(`Schedule more trading during ${bestSession.key} when your edge is strongest.`);
  }
  const bestSetup = data.setup_type_breakdown?.filter((s) => s.key && s.key !== '—')[0];
  if (bestSetup && bestSetup.count >= 2) {
    actions.push(`Focus on ${bestSetup.key} setups; consider passing on lower-conviction types.`);
  }
  if (actions.length < 3) {
    actions.push('Keep logging journal entries with setup type, session, and rule-followed to get more tailored actions.');
  }
  return actions.slice(0, 5);
}

/**
 * Generate coaching insights, weekly summary, and next actions from journal entry rows.
 */
export function generateCoachOutput(rows: JournalEntryRow[]): CoachOutput {
  if (!rows.length) {
    return {
      insights: [],
      weeklySummary: DEFAULT_SUMMARY,
      nextActions: DEFAULT_ACTIONS,
    };
  }

  const report = generatePerformanceReport(rows, {
    dateFrom: '',
    dateTo: '',
  });
  const data = report.report_data;
  const totalTrades = report.total_trades;
  const winRate = report.win_rate;
  const totalR = report.total_r;
  const ruleStats = data.rule_followed_stats;
  const mistakes = data.mistake_patterns ?? [];

  const consistency = computeConsistencyScores(rows);
  const perf = computePerformanceMetrics(rows);

  const insights: CoachInsight[] = [];
  const add = (i: CoachInsight | null) => {
    if (i) insights.push(i);
  };

  add(bestFromGrouped(data.setup_type_breakdown ?? [], 'setup'));
  add(bestFromGrouped(data.session_breakdown ?? [], 'session'));
  add(worstMistake(mistakes));
  add(ruleImpact(ruleStats));
  add(confidenceInsight(data.confidence_breakdown ?? []));
  add(executionInsight(data.execution_quality_breakdown ?? []));
  add(mostImprovedArea(data, totalTrades));
  add(biggestLeak(mistakes, ruleStats));

  const weeklySummary = buildSummary(
    data,
    totalTrades,
    winRate,
    totalR,
    consistency,
    perf
  );
  const nextActions = buildNextActions(data, totalTrades, ruleStats);

  return {
    insights,
    weeklySummary,
    nextActions,
  };
}
