import "server-only";
import { getDashboardData } from "./data-service";
import { cachedLoader } from "./cache";
import { fetchYahooQuote } from "./live";
import type { MarketQuote } from "@/types/live";

const loaders = new Map<string, ReturnType<typeof cachedLoader<MarketQuote>>>();

export async function getStockQuotes() {
  const { stocks } = await getDashboardData();
  const tickers = [...new Set(stocks.map((stock) => stock.ticker))];
  // Drop removed analyses so this cache only tracks the current watchlist.
  for (const ticker of loaders.keys()) {
    if (!tickers.includes(ticker)) loaders.delete(ticker);
  }
  return Promise.all(tickers.map(async (ticker): Promise<MarketQuote> => {
    const definition = { key: ticker, label: ticker, symbol: ticker, unit: "$", description: "Yahoo Finance · USD" };
    let load = loaders.get(ticker);
    if (!load) {
      load = cachedLoader(() => fetchYahooQuote(definition), 60_000);
      loaders.set(ticker, load);
    }
    try {
      const result = await load();
      return { ...result.data, stale: result.stale, error: result.error };
    } catch (error) {
      return { ...definition, value: null, changePercent: null, asOf: null, stale: false,
        error: error instanceof Error ? error.message : "Yahoo unavailable" };
    }
  }));
}
