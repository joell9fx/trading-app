/**
 * Market Risk Radar — rule-based risk assessment from economic calendar + global news.
 * Uses existing mock data only; no scraping or external APIs.
 * Structured for future: live calendar, live news, AI summaries, user timezone.
 */

import { getEconomicEvents, type EconomicEvent, type ImpactLevel } from './economic-calendar';
import { getGlobalNews, type GlobalNewsItem } from './global-news';

export type DailyRiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface RiskWindow {
  start: string; // HH:mm
  end: string;
  label: string;
  reason: string;
  severity: 'elevated' | 'high' | 'extreme';
}

export interface RiskRadarOutput {
  dailyRiskLevel: DailyRiskLevel;
  riskScore: number; // 0–100
  highRiskWindows: RiskWindow[];
  affectedAssets: string[];
  traderNotes: string[];
  keyDrivers: string[];
  overallSummary: string;
  /** Count of high-impact events today (for summary strip) */
  highImpactCountToday: number;
  /** Primary macro driver sentence */
  mainMacroDriver: string;
}

const TODAY = new Date().toISOString().slice(0, 10);

/** Event name patterns that strongly raise risk */
const TIER_ONE_EVENTS = [
  'non-farm payrolls',
  'nfp',
  'cpi',
  'ppi',
  'fomc',
  'federal funds rate',
  'core pce',
  'rate decision',
  'official bank rate',
  'main refinancing rate',
  'boj policy rate',
];

function isTierOneEvent(event: EconomicEvent): boolean {
  const name = (event.eventName || '').toLowerCase();
  return TIER_ONE_EVENTS.some((t) => name.includes(t));
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Bucket time into session windows (UTC). */
function getSessionBucket(time: string): string {
  const min = timeToMinutes(time);
  if (min >= 6 * 60 && min < 10 * 60) return '07:00-10:00'; // London open / GBP cluster
  if (min >= 11 * 60 && min < 14 * 60) return '12:00-14:00'; // London-NY overlap prep
  if (min >= 12 * 60 + 30 && min < 16 * 60) return '13:30-16:00'; // US data / NY
  if (min >= 18 * 60 && min < 22 * 60) return '18:00-22:00'; // Late US / volatility
  return 'other';
}

/** Assets affected by currency / theme */
function getAssetsForCurrency(currency: string): string[] {
  const c = currency.toUpperCase();
  if (c === 'USD')
    return ['USD pairs', 'Gold', 'US30', 'NAS100', 'EUR/USD', 'GBP/USD', 'USD/JPY'];
  if (c === 'GBP') return ['GBP pairs', 'EUR/GBP', 'GBP/USD'];
  if (c === 'EUR') return ['EUR pairs', 'EUR/USD', 'GER40'];
  if (c === 'JPY') return ['JPY pairs', 'USD/JPY'];
  return [`${c} pairs`];
}

export async function getRiskRadar(): Promise<RiskRadarOutput> {
  const [events, newsSections] = await Promise.all([
    getEconomicEvents({
      from: TODAY,
      to: TODAY,
      impactOnly: 'all',
      currencies: [],
    }),
    getGlobalNews(),
  ]);

  const todayEvents = events.filter((e) => e.date === TODAY);
  const highImpactToday = todayEvents.filter((e) => e.impact === 'high');
  const tierOneToday = highImpactToday.filter(isTierOneEvent);

  const allNewsItems: GlobalNewsItem[] = [];
  for (const section of newsSections) {
    allNewsItems.push(...section.items);
  }
  const hasGeopolitical = allNewsItems.some(
    (n) => n.category === 'Geopolitics' || /escalat|tension|tariff|election|war|middle east/i.test(n.headline + n.summary)
  );
  const hasCentralBankSpeech = allNewsItems.some(
    (n) => n.category === 'Central Bank' || /speech|speak|fed|ecb|boe|boj/i.test(n.headline)
  );
  const hasEnergyRisk = allNewsItems.some(
    (n) => n.category === 'Energy' || /oil|energy|supply/i.test(n.headline)
  );

  const affectedSet = new Set<string>();
  for (const e of highImpactToday) {
    getAssetsForCurrency(e.currency).forEach((a) => affectedSet.add(a));
  }
  if (hasEnergyRisk) affectedSet.add('Oil');
  if (hasGeopolitical || highImpactToday.length >= 2) affectedSet.add('BTC');

  const keyDrivers: string[] = [];
  if (highImpactToday.length > 0) {
    keyDrivers.push(`${highImpactToday.length} high-impact ${highImpactToday.length === 1 ? 'event' : 'events'} today`);
  }
  if (tierOneToday.length > 0) {
    keyDrivers.push(
      tierOneToday.map((e) => e.eventName).slice(0, 2).join(', ')
    );
  }
  if (hasCentralBankSpeech) keyDrivers.push('Central bank speech / rhetoric in focus');
  if (hasGeopolitical) keyDrivers.push('Geopolitical uncertainty elevated');
  if (hasEnergyRisk) keyDrivers.push('Energy / supply-side risk');
  const weekStart = new Date();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEvents = await getEconomicEvents({
    from: weekStart.toISOString().slice(0, 10),
    to: weekEnd.toISOString().slice(0, 10),
    impactOnly: 'high',
    currencies: [],
  });
  const rateDecisionThisWeek = weekEvents.some((e) =>
    /rate decision|federal funds|official bank rate|main refinancing|boj policy/i.test(e.eventName)
  );
  if (rateDecisionThisWeek && !tierOneToday.length) {
    keyDrivers.push('Rate decision this week');
  }

  const sessionCount: Record<string, number> = {};
  for (const e of highImpactToday) {
    const bucket = getSessionBucket(e.time);
    sessionCount[bucket] = (sessionCount[bucket] ?? 0) + 1;
  }

  const highRiskWindows: RiskWindow[] = [];
  const bucketLabels: Record<string, string> = {
    '07:00-10:00': '07:00–10:00 UTC — London open / GBP data cluster',
    '12:00-14:00': '12:00–14:00 UTC — Pre-US session',
    '13:30-16:00': '13:30–16:00 UTC — US data / Fed risk',
    '18:00-22:00': '18:00–22:00 UTC — Late session volatility',
  };
  for (const [bucket, count] of Object.entries(sessionCount)) {
    if (count < 1) continue;
    const [start, end] = bucket.split('-');
    const label = bucketLabels[bucket] ?? `${start}–${end} UTC`;
    const severity =
      count >= 2 || tierOneToday.some((e) => getSessionBucket(e.time) === bucket)
        ? 'extreme'
        : count >= 1
          ? 'high'
          : 'elevated';
    highRiskWindows.push({
      start,
      end,
      label,
      reason:
        count >= 2
          ? `${count} high-impact events in this window`
          : tierOneToday.some((e) => getSessionBucket(e.time) === bucket)
            ? 'Major release (CPI/NFP/FOMC/Rate) in this window'
            : 'High-impact release',
      severity,
    });
  }
  highRiskWindows.sort((a, b) => a.start.localeCompare(b.start));

  if (hasGeopolitical && highRiskWindows.length === 0) {
    highRiskWindows.push({
      start: '13:30',
      end: '16:00',
      label: '13:30–16:00 UTC — NY open volatility risk from geopolitical uncertainty',
      reason: 'Macro uncertainty may amplify moves during liquid hours',
      severity: 'elevated',
    });
  }

  const traderNotes: string[] = [];
  if (highImpactToday.length > 0) {
    traderNotes.push('Expect volatility spikes around red-folder events.');
  }
  if (Object.values(sessionCount).some((c) => c >= 2)) {
    traderNotes.push('Avoid tight stops during overlapping high-impact releases.');
  }
  if (highImpactToday.some((e) => e.currency === 'USD')) {
    traderNotes.push('Watch gold and USD pairs during US inflation/data releases.');
  }
  if (hasGeopolitical) {
    traderNotes.push('Geopolitical uncertainty may create irregular price reactions.');
  }
  if (highImpactToday.length === 0 && !hasGeopolitical && !hasCentralBankSpeech) {
    traderNotes.push('No major scheduled catalysts today; focus on technicals and flow.');
  }

  let riskScore = 0;
  if (highImpactToday.length >= 3) riskScore += 40;
  else if (highImpactToday.length >= 2) riskScore += 30;
  else if (highImpactToday.length >= 1) riskScore += 15;
  if (tierOneToday.length >= 1) riskScore += 25;
  if (hasCentralBankSpeech && highImpactToday.length >= 1) riskScore += 15;
  if (hasGeopolitical) riskScore += 15;
  if (hasEnergyRisk) riskScore += 5;
  riskScore = Math.min(100, riskScore);

  let dailyRiskLevel: DailyRiskLevel = 'low';
  if (riskScore >= 70) dailyRiskLevel = 'extreme';
  else if (riskScore >= 50) dailyRiskLevel = 'high';
  else if (riskScore >= 25) dailyRiskLevel = 'moderate';

  const mainMacroDriver =
    keyDrivers[0] ?? (hasGeopolitical ? 'Geopolitical uncertainty' : 'No major catalysts');

  const overallSummary =
    dailyRiskLevel === 'extreme'
      ? 'Very high event and/or macro risk today. Reduce size and avoid tight stops around key times.'
      : dailyRiskLevel === 'high'
        ? 'Elevated risk from data and/or macro themes. Trade with caution during high-impact windows.'
        : dailyRiskLevel === 'moderate'
          ? 'Moderate risk; several factors may increase volatility. Plan around event times.'
          : 'Lower risk environment; standard risk management applies.';

  return {
    dailyRiskLevel,
    riskScore,
    highRiskWindows,
    affectedAssets: Array.from(affectedSet).sort(),
    traderNotes,
    keyDrivers,
    overallSummary,
    highImpactCountToday: highImpactToday.length,
    mainMacroDriver,
  };
}
