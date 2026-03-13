/**
 * Global Market News — placeholder data layer.
 * Structured for future integration with NewsAPI, financial RSS feeds,
 * or custom AI summaries. Each item has category, time, and optional link.
 */

export type NewsCategory = 'Geopolitics' | 'Central Bank' | 'Economy' | 'Energy' | 'Markets';

export interface GlobalNewsItem {
  id: string;
  headline: string;
  summary: string;
  category: NewsCategory;
  /** ISO date string */
  date: string;
  /** Optional time HH:mm */
  time?: string;
  source: string;
  /** Optional URL for "read more" */
  url?: string;
  /** Highlight as key story */
  highlighted?: boolean;
}

export type NewsSectionKey = 'today' | 'weekly' | 'geopolitical';

export interface GlobalNewsSection {
  key: NewsSectionKey;
  title: string;
  items: GlobalNewsItem[];
}

export interface GetGlobalNewsOptions {
  /** Optional: limit to section keys */
  sections?: NewsSectionKey[];
}

/**
 * Placeholder: returns structured global/macro news.
 * Replace with API or RSS parsing when connecting real sources.
 */
export async function getGlobalNews(_options?: GetGlobalNewsOptions): Promise<GlobalNewsSection[]> {
  return [
    {
      key: 'today',
      title: "Today's Key Stories",
      items: [
        {
          id: 'n1',
          headline: 'Fed signals data-dependent path; rate cut timing in focus',
          summary: 'Federal Reserve officials emphasize upcoming inflation and jobs data will guide the first rate cut, with markets pricing a June move.',
          category: 'Central Bank',
          date: new Date().toISOString().slice(0, 10),
          time: '14:30',
          source: 'Market Brief',
          highlighted: true,
        },
        {
          id: 'n2',
          headline: 'Oil edges higher on Middle East supply concerns',
          summary: 'Crude prices rise as tensions persist; traders watch Red Sea and OPEC+ compliance.',
          category: 'Energy',
          date: new Date().toISOString().slice(0, 10),
          source: 'Energy Desk',
        },
        {
          id: 'n3',
          headline: 'Eurozone PMI data points to fragile recovery',
          summary: 'Manufacturing remains in contraction while services hold up; ECB outlook unchanged.',
          category: 'Economy',
          date: new Date().toISOString().slice(0, 10),
          source: 'EU Wire',
        },
      ],
    },
    {
      key: 'weekly',
      title: 'Weekly Market Themes',
      items: [
        {
          id: 'n4',
          headline: 'Dollar strength and yen weakness dominate FX',
          summary: 'Widening rate differentials keep USD supported; BOJ rhetoric in focus for JPY.',
          category: 'Markets',
          date: new Date().toISOString().slice(0, 10),
          source: 'FX Weekly',
          highlighted: true,
        },
        {
          id: 'n5',
          headline: 'Equities balance earnings resilience vs rate uncertainty',
          summary: 'Big tech results and Treasury yields drive rotation; volatility elevated.',
          category: 'Markets',
          date: new Date().toISOString().slice(0, 10),
          source: 'Equity Digest',
        },
      ],
    },
    {
      key: 'geopolitical',
      title: 'Geopolitical Watch',
      items: [
        {
          id: 'n6',
          headline: 'Trade and tariff rhetoric escalates ahead of elections',
          summary: 'Policy uncertainty may weigh on risk sentiment and supply chain pricing.',
          category: 'Geopolitics',
          date: new Date().toISOString().slice(0, 10),
          source: 'Policy Brief',
          highlighted: true,
        },
        {
          id: 'n7',
          headline: 'Central bank speeches calendar: Fed, ECB, BOE',
          summary: 'Key officials to speak this week; any shift in tone could move rates and FX.',
          category: 'Central Bank',
          date: new Date().toISOString().slice(0, 10),
          source: 'Central Bank Watch',
        },
      ],
    },
  ];
}
