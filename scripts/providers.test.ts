import { test } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { parseExcel } from "../lib/excel";
import { parsePublicFolder, getDriveDataset } from "../lib/drive";
import {
  parseYahooQuote,
  marketSymbols,
  parseCalendar,
  parseNews,
  getLiveDashboardData,
} from "../lib/live";
import { cachedLoader } from "../lib/cache";
import { getStockQuotes } from "../lib/stock-quotes";
import { dayKey, price } from "../lib/format";
test("dashboard refreshes every source together and shares concurrent snapshots", async () => {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = originalNow();
  let calls = 0;
  globalThis.fetch = async (input) => {
    calls++;
    const url = String(input);
    if (url.includes("ff_calendar")) return Response.json([]);
    if (url.includes("rss")) return new Response("<rss><channel></channel></rss>");
    const symbol = decodeURIComponent(new URL(url).pathname.split("/").at(-1)!);
    return Response.json({ chart: { result: [{ meta: {
      symbol, regularMarketPrice: calls, regularMarketTime: 1790966558,
    } }] } });
  };
  Date.now = () => now;
  try {
    const [first, shared] = await Promise.all([getLiveDashboardData(), getLiveDashboardData()]);
    assert.equal(first, shared);
    assert.equal(calls, 10);
    now += 59_999;
    assert.equal(await getLiveDashboardData(), first);
    assert.equal(calls, 10);
    now += 1;
    const next = await getLiveDashboardData();
    assert.equal(calls, 20);
    assert.notEqual(next, first);
    assert.notEqual(next.market.data[0].value, first.market.data[0].value);
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
  }
});
function relationalBytes() {
  const book = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries({
    Analysis: [
      {
        analysis_id: "NBIS_test",
        ticker: "NBIS",
        session_date: "2026-10-02",
        price_asof_epoch_ms: 1790966558000,
        reference_price_usd: 242.09,
        action: "WAIT_FOR_CONFIRMATION",
        confidence: "low",
        data_status: "partial_data",
        summary_th: "รอยืนยัน",
      },
    ],
    Metrics: [
      {
        analysis_id: "NBIS_test",
        metric: "RSI14_D",
        value: null,
        data_status: "unavailable",
      },
      {
        analysis_id: "NBIS_test",
        metric: "US10Y",
        value: 5.28,
        data_status: "conflicting",
      },
      {
        analysis_id: "NBIS_test",
        metric: "previous_close",
        value: 232.28,
        data_status: "derived",
      },
      {
        analysis_id: "NBIS_test",
        metric: "latest",
        value: 242.09,
        change_pct: 4.22,
        data_status: "snapshot",
      },
    ],
    Levels: [
      {
        analysis_id: "NBIS_test",
        side: "support",
        rank: 1,
        low_usd: 235,
        high_usd: 237,
        reason_th: "โซนราคาเปิด",
        status: "provisional",
      },
      {
        analysis_id: "another_stock",
        side: "support",
        rank: 1,
        low_usd: 1,
        high_usd: 2,
      },
    ],
    Plans: [
      {
        analysis_id: "NBIS_test",
        plan: "A",
        entry_low_usd: 235,
        entry_high_usd: 237,
        entry_example_usd: 237,
        stop_usd: 232,
        tp1_usd: 248,
        tp2_usd: 250,
      },
      {
        analysis_id: "NBIS_test",
        plan: "B",
        entry_example_usd: 233,
        stop_usd: 229,
        tp1_usd: 246,
        tp2_usd: 250,
      },
    ],
    News: [
      {
        analysis_id: "NBIS_test",
        headline_th: "ข่าวตัวอย่าง",
        fact_th: "ข้อเท็จจริง",
        source_url: "https://example.com/news",
      },
    ],
  }))
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), name);
  return XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
test("relational Excel preserves missing indicators, zones, independent stops, and raw action", () => {
  const [s] = parseExcel(relationalBytes());
  assert.equal(s.ticker, "NBIS");
  assert.equal(s.price, 242.09);
  assert.equal(s.rsi, null);
  assert.equal(s.us10y, null);
  assert.equal(s.riskLevel, "ไม่ระบุ");
  assert.equal(s.date, "2026-10-03");
  assert.equal(s.time, "01:42:38");
  assert.equal(s.sessionDate, "2026-10-02");
  assert.equal(s.tradingBias, "WAIT_FOR_CONFIRMATION");
  assert.equal(s.levels?.length, 1);
  assert.equal(s.levels?.[0].high, 237);
  assert.equal(s.plans?.[0].stop, 232);
  assert.equal(s.plans?.[1].stop, 229);
  assert.equal(s.plans?.[0].targets[2], null);
  assert.equal(s.stopLoss, null);
  assert.equal(price(s.rsi), "—");
});
test("public Drive parser discovers supported files without executing scripts", () => {
  const payload = JSON.stringify([
    [
      [
        "nbis-file",
        [],
        "NBIS.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      ["ignore", [], "readme.txt", "text/plain"],
    ],
    null,
  ]);
  assert.equal(
    parsePublicFolder(`window['_DRIVE_ivd'] = '${payload}'`)[0].id,
    "nbis-file",
  );
  assert.equal(
    parsePublicFolder(`window['_DRIVE_ivd'] = '${payload}'`).length,
    1,
  );
  assert.throws(
    () => parsePublicFolder("<html>login required</html>"),
    /อ่านโฟลเดอร์ Drive ไม่ได้/,
  );
  assert.throws(
    () => parsePublicFolder(`window['_DRIVE_ivd'] = '[[],"next"]'`),
    /หลายหน้า/,
  );
  assert.deepEqual(
    parsePublicFolder(`window['_DRIVE_ivd'] = '[null,null]'`),
    [],
  );
});
test("Drive source with one workbook returns only NBIS and never falls back to demo symbols", async () => {
  const original = globalThis.fetch;
  const payload = JSON.stringify([
    [
      [
        "nbis-file",
        [],
        "NBIS.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    ],
    null,
  ]);
  const requestedSymbols: string[] = [];
  globalThis.fetch = async (input) => {
    if (String(input).includes("finance/chart/")) {
      const symbol = decodeURIComponent(new URL(String(input)).pathname.split("/").at(-1)!);
      requestedSymbols.push(symbol);
      return Response.json({ chart: { result: [{ meta: { symbol, regularMarketPrice: 250, regularMarketTime: 1790966558 } }] } });
    }
    return String(input).includes("/drive/folders/")
      ? new Response(`window['_DRIVE_ivd'] = '${payload}'`)
      : new Response(new Uint8Array(relationalBytes()), {
          headers: {
            "content-type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });
  };
  try {
    const result = await getDriveDataset();
    assert.deepEqual(
      result.data.rows.map((row) => row.ticker),
      ["NBIS"],
    );
    assert.deepEqual(result.data.warnings, []);
    const quotes = await getStockQuotes();
    assert.deepEqual(requestedSymbols, ["NBIS"]);
    assert.equal(quotes[0].value, 250);
    assert.equal(quotes[0].symbol, "NBIS");
  } finally {
    globalThis.fetch = original;
  }
});
test("Yahoo quote uses supplied yield value, timestamp and excludes invalid/mismatched symbols", () => {
  const payload = {
    chart: {
      result: [
        {
          meta: {
            symbol: "^TNX",
            regularMarketPrice: 5.28,
            regularMarketTime: 1790966558,
            chartPreviousClose: 5.2,
          },
        },
      ],
    },
  };
  const quote = parseYahooQuote(payload, marketSymbols[0]);
  assert.equal(quote.value, 5.28);
  assert.equal(quote.asOf, "2026-10-02T18:42:38.000Z");
  assert.ok(quote.changePercent! > 1);
  assert.throws(() => parseYahooQuote(payload, marketSymbols[1]), /mismatch/);
  assert.throws(
    () => parseYahooQuote({ chart: { error: "rate limit" } }, marketSymbols[0]),
    /Yahoo/,
  );
});
test("calendar normalizes offsets, preserves absent actual, and rejects timezone-less events", () => {
  const [event] = parseCalendar([
    {
      title: "Release",
      country: "USD",
      date: "2026-10-02T14:30:00-04:00",
      impact: "High",
      forecast: "1.5%",
      previous: "1%",
    },
  ]);
  assert.equal(dayKey(new Date(event.date)), "2026-10-03");
  assert.equal(event.actual, "");
  assert.equal(event.forecast, "1.5%");
  assert.throws(
    () => parseCalendar([{ title: "Release", date: "2026-10-03T10:00:00" }]),
    /timezone/,
  );
});
test("RSS keeps published date and rejects unsafe URLs without retaining full articles", () => {
  const rows = parseNews(
    "<rss><channel><item><title>News</title><link>https://finance.yahoo.com/news/test</link><pubDate>Fri, 02 Oct 2026 18:30:00 GMT</pubDate><description>Do not include article text</description></item><item><title>Unsafe</title><link>javascript:alert(1)</link><pubDate>Fri, 02 Oct 2026 18:30:00 GMT</pubDate></item></channel></rss>",
  );
  assert.equal(rows.length, 1);
  assert.equal(dayKey(new Date(rows[0].publishedAt)), "2026-10-03");
  assert.deepEqual(Object.keys(rows[0]).sort(), [
    "publishedAt",
    "title",
    "url",
  ]);
});
test("cache coalesces concurrent work, marks failures stale, and preserves last success time", async () => {
  let attempts = 0;
  const load = cachedLoader(async () => {
    attempts++;
    await Promise.resolve();
    if (attempts > 1) throw new Error("429");
    return 42;
  }, 0);
  const [first, same] = await Promise.all([load(), load()]);
  assert.equal(attempts, 1);
  assert.equal(first, same);
  const stale = await load();
  assert.equal(stale.data, 42);
  assert.equal(stale.stale, true);
  assert.equal(stale.fetchedAt, first.fetchedAt);
  assert.equal(stale.error, "429");
});
