/**
 * Economic Calendar — placeholder service layer.
 * Structured for future integration with external economic calendar APIs
 * (e.g. ForexFactory-style providers, FXStreet, Investing.com APIs).
 * Do not scrape sites directly; use official APIs or licensed data.
 */

export type ImpactLevel = 'low' | 'medium' | 'high';

export interface EconomicEvent {
  id: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Time in HH:mm 24h (e.g. "08:30", "14:00") */
  time: string;
  /** Currency code (USD, EUR, GBP, JPY, etc.) */
  currency: string;
  /** Event name */
  eventName: string;
  impact: ImpactLevel;
  previous: string | null;
  forecast: string | null;
  actual: string | null;
}

export interface GetEconomicEventsOptions {
  /** Start date ISO */
  from: string;
  /** End date ISO */
  to: string;
  /** Filter by impact */
  impactOnly?: ImpactLevel | 'all';
  /** Filter by currency codes; empty = all */
  currencies?: string[];
}

/**
 * Placeholder: returns simulated ForexFactory-style events.
 * Replace implementation with API client when connecting to a real source.
 */
export async function getEconomicEvents(
  options: GetEconomicEventsOptions
): Promise<EconomicEvent[]> {
  const { from, to, impactOnly = 'all', currencies = [] } = options;
  const all = generatePlaceholderEvents(from, to);
  let filtered = all;
  if (impactOnly !== 'all') {
    filtered = filtered.filter((e) => e.impact === impactOnly);
  }
  if (currencies.length > 0) {
    const set = new Set(currencies.map((c) => c.toUpperCase()));
    filtered = filtered.filter((e) => set.has(e.currency.toUpperCase()));
  }
  return filtered;
}

/** Build list of placeholder events for demo. Replace with API response. */
function generatePlaceholderEvents(from: string, to: string): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  const start = new Date(from);
  const end = new Date(to);
  const templates: Omit<EconomicEvent, 'id' | 'date' | 'time'>[] = [
    { currency: 'USD', eventName: 'Non-Farm Payrolls', impact: 'high', previous: '175K', forecast: '180K', actual: null },
    { currency: 'USD', eventName: 'CPI m/m', impact: 'high', previous: '0.3%', forecast: '0.2%', actual: null },
    { currency: 'USD', eventName: 'Federal Funds Rate', impact: 'high', previous: '5.50%', forecast: '5.50%', actual: null },
    { currency: 'USD', eventName: 'Retail Sales m/m', impact: 'medium', previous: '0.6%', forecast: '0.4%', actual: null },
    { currency: 'USD', eventName: 'Initial Jobless Claims', impact: 'medium', previous: '217K', forecast: '215K', actual: null },
    { currency: 'EUR', eventName: 'ECB Main Refinancing Rate', impact: 'high', previous: '4.50%', forecast: '4.50%', actual: null },
    { currency: 'EUR', eventName: 'German CPI m/m', impact: 'medium', previous: '0.2%', forecast: '0.3%', actual: null },
    { currency: 'GBP', eventName: 'Bank of England Official Bank Rate', impact: 'high', previous: '5.25%', forecast: '5.25%', actual: null },
    { currency: 'GBP', eventName: 'GDP m/m', impact: 'medium', previous: '0.2%', forecast: '0.1%', actual: null },
    { currency: 'JPY', eventName: 'BOJ Policy Rate', impact: 'high', previous: '-0.10%', forecast: '0.00%', actual: null },
    { currency: 'JPY', eventName: 'Tokyo CPI y/y', impact: 'medium', previous: '2.2%', forecast: '2.3%', actual: null },
    { currency: 'USD', eventName: 'FOMC Statement', impact: 'high', previous: '—', forecast: '—', actual: null },
    { currency: 'USD', eventName: 'Core PCE Price Index m/m', impact: 'high', previous: '0.2%', forecast: '0.2%', actual: null },
    { currency: 'USD', eventName: 'Building Permits', impact: 'low', previous: '1.45M', forecast: '1.48M', actual: null },
    { currency: 'EUR', eventName: 'French Flash Manufacturing PMI', impact: 'medium', previous: '45.4', forecast: '45.8', actual: null },
  ];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    templates.forEach((t, i) => {
      const timeSlots = ['07:00', '08:30', '10:00', '12:30', '14:00', '15:30'];
      const time = timeSlots[i % timeSlots.length];
      events.push({
        id: `ev-${dateStr}-${t.currency}-${i}-${time}`,
        date: dateStr,
        time,
        ...t,
      });
    });
  }
  return events.sort((a, b) => {
    const da = a.date + a.time;
    const db = b.date + b.time;
    return da.localeCompare(db);
  });
}
