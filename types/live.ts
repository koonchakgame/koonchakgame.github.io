export interface MarketQuote {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  description: string;
  value: number | null;
  changePercent: number | null;
  asOf: string | null;
  stale: boolean;
  error?: string;
}
export interface EconomicEvent {
  title: string;
  currency: string;
  date: string;
  impact: string;
  actual: string;
  forecast: string;
  previous: string;
}
export interface Headline {
  title: string;
  url: string;
  publishedAt: string;
}
export interface Feed<T> {
  data: T;
  fetchedAt: string | null;
  stale: boolean;
  error?: string;
}
export interface LiveDashboardData {
  market: Feed<MarketQuote[]>;
  calendar: Feed<EconomicEvent[]>;
  news: Feed<Headline[]>;
  today: string;
  timezone: string;
  refreshedAt: string;
}
