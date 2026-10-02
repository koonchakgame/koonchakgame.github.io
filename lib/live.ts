import "server-only";
import { XMLParser } from "fast-xml-parser";
import { cachedLoader } from "./cache";
import { dayKey } from "./format";
import type {
  EconomicEvent,
  Headline,
  MarketQuote,
  LiveDashboardData,
  Feed,
} from "@/types/live";
export const marketSymbols = [
  {
    key: "us10y",
    label: "US 10Y",
    symbol: "^TNX",
    unit: "%",
    description: "Cboe 10-year yield index",
  },
  {
    key: "us30y",
    label: "US 30Y",
    symbol: "^TYX",
    unit: "%",
    description: "Cboe 30-year yield index",
  },
  {
    key: "nasdaq",
    label: "Nasdaq",
    symbol: "^IXIC",
    unit: "",
    description: "Nasdaq Composite",
  },
  {
    key: "vix",
    label: "VIX",
    symbol: "^VIX",
    unit: "",
    description: "Cboe Volatility Index",
  },
  {
    key: "dxy",
    label: "DXY",
    symbol: "DX-Y.NYB",
    unit: "",
    description: "US Dollar Index",
  },
  {
    key: "wti",
    label: "WTI",
    symbol: "CL=F",
    unit: "$",
    description: "WTI futures · USD/barrel",
  },
  {
    key: "brent",
    label: "Brent",
    symbol: "BZ=F",
    unit: "$",
    description: "Brent futures · USD/barrel",
  },
  {
    key: "gold",
    label: "Gold",
    symbol: "GC=F",
    unit: "$",
    description: "Gold futures · USD/oz",
  },
];
const finite = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const agent = {
  "User-Agent": "Mozilla/5.0",
  Accept: "application/json, application/xml, text/xml, */*",
};
async function fetchSource(url: string) {
  const response = await fetch(url, {
    headers: agent,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
  return response;
}
export function parseYahooQuote(
  payload: unknown,
  definition: (typeof marketSymbols)[number],
): MarketQuote {
  const root = payload as {
    chart?: { result?: { meta?: Record<string, unknown> }[]; error?: unknown };
  };
  const meta = root?.chart?.result?.[0]?.meta;
  const value = finite(meta?.regularMarketPrice),
    epoch = finite(meta?.regularMarketTime);
  if (root.chart?.error || !meta || value == null || epoch == null)
    throw new Error("Yahoo ไม่มีราคาหรือเวลาอ้างอิง");
  if (meta.symbol !== definition.symbol)
    throw new Error("Yahoo symbol mismatch");
  const previous =
    finite(meta.previousClose) ?? finite(meta.chartPreviousClose);
  const changePercent =
    finite(meta.regularMarketChangePercent) ??
    (previous != null && previous !== 0 ? (value / previous - 1) * 100 : null);
  return {
    ...definition,
    value,
    changePercent,
    asOf: new Date(epoch * 1000).toISOString(),
    stale: false,
  };
}
const quoteLoaders = marketSymbols.map((definition) =>
  cachedLoader(async () => {
    let failure: unknown;
    for (const host of [
      "query1.finance.yahoo.com",
      "query2.finance.yahoo.com",
    ]) {
      try {
        const response = await fetchSource(
          `https://${host}/v8/finance/chart/${encodeURIComponent(definition.symbol)}?interval=1d&range=1d`,
        );
        return parseYahooQuote(await response.json(), definition);
      } catch (error) {
        failure = error;
      }
    }
    throw failure;
  }, 60_000),
);
export function parseCalendar(payload: unknown): EconomicEvent[] {
  if (!Array.isArray(payload)) throw new Error("Invalid calendar feed");
  return payload
    .map((row: Record<string, unknown>) => {
      if (
        !row ||
        typeof row.title !== "string" ||
        typeof row.date !== "string" ||
        !Number.isFinite(Date.parse(row.date)) ||
        !/(Z|[+-]\d{2}:\d{2})$/.test(row.date)
      )
        throw new Error("Invalid calendar event or timezone");
      return {
        title: row.title,
        currency: String(row.country ?? ""),
        date: new Date(row.date).toISOString(),
        impact: String(row.impact ?? ""),
        actual: row.actual == null ? "" : String(row.actual),
        forecast: row.forecast == null ? "" : String(row.forecast),
        previous: row.previous == null ? "" : String(row.previous),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function parseNews(xml: string): Headline[] {
  const parsed = new XMLParser({
    ignoreAttributes: true,
    processEntities: false,
  }).parse(xml);
  if (!parsed.rss?.channel) throw new Error("Invalid Yahoo RSS feed");
  const items = parsed.rss.channel.item ?? [];
  return (Array.isArray(items) ? items : [items])
    .flatMap((item: Record<string, unknown>) => {
      const url = safeExternalUrl(String(item.link ?? "")),
        epoch = Date.parse(String(item.pubDate ?? ""));
      return url && Number.isFinite(epoch) && typeof item.title === "string"
        ? [
            {
              title: item.title,
              url,
              publishedAt: new Date(epoch).toISOString(),
            },
          ]
        : [];
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
const calendarLoader = cachedLoader(
  async () =>
    parseCalendar(
      await (
        await fetchSource(
          "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
        )
      ).json(),
    ),
  15 * 60_000,
);
const newsLoader = cachedLoader(
  async () =>
    parseNews(
      await (
        await fetchSource("https://finance.yahoo.com/rss/topstories")
      ).text(),
    ),
  5 * 60_000,
);
async function optionalFeed<T>(
  load: () => Promise<Feed<T>>,
  empty: T,
): Promise<Feed<T>> {
  try {
    return await load();
  } catch (error) {
    return {
      data: empty,
      fetchedAt: null,
      stale: false,
      error: error instanceof Error ? error.message : "Source unavailable",
    };
  }
}
async function getMarket(): Promise<Feed<MarketQuote[]>> {
  const results = await Promise.allSettled(quoteLoaders.map((load) => load()));
  const data = results.map((result, index): MarketQuote =>
    result.status === "fulfilled"
      ? {
          ...result.value.data,
          stale: result.value.stale,
          error: result.value.error,
        }
      : {
          ...marketSymbols[index],
          value: null,
          changePercent: null,
          asOf: null,
          stale: false,
          error:
            result.reason instanceof Error
              ? result.reason.message
              : "Yahoo unavailable",
        },
  );
  return {
    data,
    fetchedAt: new Date().toISOString(),
    stale: data.some((q) => q.stale),
    ...(data.some((q) => q.error)
      ? { error: "บางรายการดึงไม่ได้หรือใช้ข้อมูลเดิม ดูสถานะบนแต่ละการ์ด" }
      : {}),
  };
}
export async function getLiveDashboardData(): Promise<LiveDashboardData> {
  const [market, calendar, news] = await Promise.all([
    getMarket(),
    optionalFeed(calendarLoader, []),
    optionalFeed(newsLoader, []),
  ]);
  return {
    market,
    calendar,
    news,
    today: dayKey(new Date()),
    timezone: "Asia/Bangkok",
    refreshedAt: new Date().toISOString(),
  };
}
