export interface StockAnalysis {
  date: string;
  time: string;
  ticker: string;
  price: number | null;
  previousClose: number | null;
  changePercent: number | null;
  support1: number | null;
  support2: number | null;
  support3: number | null;
  resistance1: number | null;
  resistance2: number | null;
  resistance3: number | null;
  rsi: number | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  volume: number | null;
  us10y: number | null;
  us30y: number | null;
  nasdaq: number | null;
  vix: number | null;
  dxy: number | null;
  wti: number | null;
  brent: number | null;
  gold: number | null;
  entryA: number | null;
  entryB: number | null;
  entryC: number | null;
  stopLoss: number | null;
  target1: number | null;
  target2: number | null;
  target3: number | null;
  newsSummary: string;
  analysisSummary: string;
  tradingBias: string;
  riskLevel: string;
  analysisId?: string;
  asOf?: string;
  sessionDate?: string;
  sourceFile?: string;
  sourceUrl?: string;
  dataStatus?: string;
  confidence?: string;
  levels?: AnalysisLevel[];
  plans?: AnalysisPlan[];
  metrics?: AnalysisMetric[];
  news?: AnalysisNews[];
}
export interface AnalysisLevel {
  side: string;
  rank: number;
  low: number | null;
  high: number | null;
  reason: string;
  status: string;
}
export interface AnalysisPlan {
  name: string;
  low: number | null;
  high: number | null;
  entry: number | null;
  stop: number | null;
  targets: (number | null)[];
  rr: number | null;
  trigger: string;
  invalidation: string;
  status: string;
}
export interface AnalysisMetric {
  name: string;
  value: number | null;
  unit: string;
  status: string;
  asOf: string;
  note: string;
  source: string;
  url: string;
}
export interface AnalysisNews {
  date: string;
  headline: string;
  fact: string;
  readthrough: string;
  impact: string;
  url: string;
}
export interface AnalysisRepository {
  getAll(): Promise<StockAnalysis[]>;
}
