import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import type { AnalysisRepository, StockAnalysis } from "@/types/stock";
const texts = [
  "newsSummary",
  "analysisSummary",
  "tradingBias",
  "riskLevel",
] as const;
const numbers = [
  "price",
  "previousClose",
  "changePercent",
  "support1",
  "support2",
  "support3",
  "resistance1",
  "resistance2",
  "resistance3",
  "rsi",
  "ema20",
  "ema50",
  "ema200",
  "volume",
  "us10y",
  "us30y",
  "nasdaq",
  "vix",
  "dxy",
  "wti",
  "brent",
  "gold",
  "entryA",
  "entryB",
  "entryC",
  "stopLoss",
  "target1",
  "target2",
  "target3",
] as const;
const specialHeaders: Record<string, string> = {
  rsi: "RSI",
  ema20: "EMA20",
  ema50: "EMA50",
  ema200: "EMA200",
  us10y: "US10Y",
  us30y: "US30Y",
  vix: "VIX",
  dxy: "DXY",
  wti: "WTI",
};
const header = (key: string) =>
  specialHeaders[key] ?? key[0].toUpperCase() + key.slice(1);
function dateValue(value: unknown): string {
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value);
    if (!d) throw new Error("Invalid Excel date");
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const text = String(value ?? "").trim();
  const parsed = new Date(`${text}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(text) ||
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== text
  )
    throw new Error("Date must be YYYY-MM-DD or an Excel date");
  return text;
}
function timeValue(value: unknown): string {
  if (typeof value === "number" && value >= 0 && value < 1)
    return XLSX.SSF.format("hh:mm:ss", value);
  const text = String(value ?? "").trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(text))
    throw new Error("Time must be HH:mm or HH:mm:ss");
  return text.length === 5 ? `${text}:00` : text;
}
export async function readExcel(
  filePath = path.join(process.cwd(), "data", "stock-analysis.xlsx"),
): Promise<StockAnalysis[]> {
  return parseExcel(await readFile(filePath));
}
export function parseExcel(bytes: Buffer): StockAnalysis[] {
  const workbook = XLSX.read(bytes, { type: "buffer" });
  if (
    workbook.Sheets.Analysis &&
    XLSX.utils
      .sheet_to_json<unknown[]>(workbook.Sheets.Analysis, { header: 1 })[0]
      ?.includes("analysis_id")
  )
    return parseRelationalWorkbook(workbook);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("Excel workbook has no worksheet");
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });
  const seen = new Set<string>();
  return rows.map((row, index) => {
    try {
      const result = {
        date: dateValue(row.Date),
        time: timeValue(row.Time),
        ticker: String(row.Ticker ?? "")
          .trim()
          .toUpperCase(),
      } as StockAnalysis;
      if (!/^[A-Z0-9.^-]{1,20}$/.test(result.ticker))
        throw new Error("Invalid ticker");
      for (const key of numbers) {
        const value = row[header(key)];
        if (
          (typeof value !== "number" && typeof value !== "string") ||
          String(value).trim() === "" ||
          !Number.isFinite(Number(value))
        )
          throw new Error(`Invalid or missing ${header(key)}`);
        result[key] = Number(value);
      }
      for (const key of texts) {
        if (
          typeof row[header(key)] !== "string" ||
          !String(row[header(key)]).trim()
        )
          throw new Error(`Missing ${header(key)}`);
        result[key] = String(row[header(key)]).trim();
      }
      const id = `${result.ticker}|${result.date}|${result.time}`;
      if (seen.has(id)) throw new Error("Duplicate ticker/date/time");
      seen.add(id);
      return result;
    } catch (error) {
      throw new Error(
        `Excel row ${index + 2}: ${error instanceof Error ? error.message : "Invalid data"}`,
      );
    }
  });
}
export const excelRepository: AnalysisRepository = {
  getAll: () => readExcel(),
};

type Row = Record<string, unknown>;
const text = (value: unknown) => (value == null ? "" : String(value).trim());
const numeric = (value: unknown): number | null => {
  if (value == null || value === "") return null;
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    !Number.isFinite(Number(value))
  )
    throw new Error(`Invalid numeric value: ${String(value)}`);
  return Number(value);
};
function parseRelationalWorkbook(book: XLSX.WorkBook): StockAnalysis[] {
  const sheetRows = (name: string): Row[] =>
    book.Sheets[name]
      ? XLSX.utils.sheet_to_json<Row>(book.Sheets[name], { defval: null })
      : [];
  const metrics = sheetRows("Metrics"),
    levels = sheetRows("Levels"),
    plans = sheetRows("Plans"),
    news = sheetRows("News");
  const ids = new Set<string>();
  return sheetRows("Analysis").map((row, index) => {
    try {
      const id = text(row.analysis_id),
        ticker = text(row.ticker).toUpperCase();
      if (!id || !/^[A-Z0-9.^-]{1,20}$/.test(ticker))
        throw new Error("Missing analysis_id or invalid ticker");
      if (ids.has(id)) throw new Error("Duplicate analysis_id");
      ids.add(id);
      const epoch = numeric(row.price_asof_epoch_ms);
      if (epoch == null || !Number.isFinite(new Date(epoch).getTime()))
        throw new Error("Invalid price_asof_epoch_ms");
      const asOf = new Date(epoch).toISOString();
      const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(epoch));
      const time = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(epoch));
      const related = (items: Row[]) =>
        items.filter((r) => text(r.analysis_id) === id);
      const m = related(metrics);
      const metric = (name: string) => {
        const item = m.find((r) => text(r.metric) === name);
        return item &&
          !["unavailable", "conflicting", "not_yet_available"].includes(
            text(item.data_status),
          )
          ? numeric(item.value)
          : null;
      };
      const mappedLevels = related(levels)
        .map((r) => ({
          side: text(r.side),
          rank: Number(r.rank),
          low: numeric(r.low_usd),
          high: numeric(r.high_usd),
          reason: text(r.reason_th),
          status: text(r.status),
        }))
        .sort((a, b) => a.rank - b.rank);
      const level = (side: string, rank: number) =>
        mappedLevels.find((l) => l.side === side && l.rank === rank)?.low ??
        null;
      const mappedPlans = related(plans).map((r) => ({
        name: text(r.plan),
        low: numeric(r.entry_low_usd),
        high: numeric(r.entry_high_usd),
        entry: numeric(r.entry_example_usd),
        stop: numeric(r.stop_usd),
        targets: [numeric(r.tp1_usd), numeric(r.tp2_usd), numeric(r.tp3_usd)],
        rr: numeric(r.rr1),
        trigger: text(r.trigger_th),
        invalidation: text(r.invalidation_th),
        status: text(r.status),
      }));
      const mappedNews = related(news).map((r) => ({
        date: text(r.event_date),
        headline: text(r.headline_th),
        fact: text(r.fact_th),
        readthrough: text(r.readthrough_th),
        impact: text(r.impact),
        url: text(r.source_url),
      }));
      return {
        date,
        time,
        ticker,
        analysisId: id,
        asOf,
        sessionDate: text(row.session_date),
        price: numeric(row.reference_price_usd),
        previousClose: metric("previous_close"),
        changePercent: numeric(
          m.find((r) => r.metric === "latest")?.change_pct,
        ),
        support1: level("support", 1),
        support2: level("support", 2),
        support3: level("support", 3),
        resistance1: level("resistance", 1),
        resistance2: level("resistance", 2),
        resistance3: level("resistance", 3),
        rsi: metric("RSI14_D"),
        ema20: metric("EMA20_D"),
        ema50: metric("EMA50_D"),
        ema200: metric("EMA200_D"),
        volume: metric("session_volume"),
        us10y: metric("US10Y"),
        us30y: metric("US30Y"),
        nasdaq: metric("Nasdaq_Composite"),
        vix: metric("VIX"),
        dxy: metric("DXY"),
        wti: metric("WTI"),
        brent: metric("Brent"),
        gold: metric("Gold"),
        entryA: mappedPlans.find((p) => p.name === "A")?.entry ?? null,
        entryB: mappedPlans.find((p) => p.name === "B")?.entry ?? null,
        entryC: mappedPlans.find((p) => p.name === "C")?.entry ?? null,
        stopLoss: null,
        target1: null,
        target2: null,
        target3: null,
        tradingBias: text(row.action) || "ไม่ระบุ",
        riskLevel: text(row.risk_level) || "ไม่ระบุ",
        confidence: text(row.confidence),
        dataStatus: text(row.data_status),
        analysisSummary: text(row.summary_th),
        newsSummary: mappedNews
          .map((n) => `${n.date} · ${n.headline}\n${n.fact}\n${n.readthrough}`)
          .join("\n\n"),
        levels: mappedLevels,
        plans: mappedPlans,
        news: mappedNews,
        metrics: m.map((r) => ({
          name: text(r.metric),
          value: numeric(r.value),
          unit: text(r.unit),
          status: text(r.data_status),
          asOf: text(r.source_asof),
          note: text(r.note_th),
          source: text(r.source_name),
          url: text(r.source_url),
        })),
      };
    } catch (error) {
      throw new Error(
        `Analysis row ${index + 2}: ${error instanceof Error ? error.message : "Invalid data"}`,
      );
    }
  });
}
