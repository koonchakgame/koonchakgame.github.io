import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as XLSX from "xlsx";
import { readExcel } from "../lib/excel";
import { getDashboardData, getStockHistory } from "../lib/data-service";
process.env.ANALYSIS_SOURCE = "local";
async function withWorkbook(
  rows: Record<string, unknown>[],
  check: (file: string) => Promise<void>,
) {
  const dir = await mkdtemp(path.join(tmpdir(), "stocklens-test-"));
  try {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(rows),
      "Analysis",
    );
    const file = path.join(dir, "test.xlsx");
    await writeFile(
      file,
      XLSX.write(book, { type: "buffer", bookType: "xlsx" }),
    );
    await check(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
async function sampleRow() {
  const book = XLSX.read(await readFile("data/stock-analysis.xlsx"), {
    type: "buffer",
  });
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(
    book.Sheets[book.SheetNames[0]],
  )[0];
}
test("Excel sample and service preserve status and select newest history", async () => {
  const rows = await readExcel();
  assert.equal(rows.length, 12);
  const dashboard = await getDashboardData();
  assert.equal(dashboard.stocks.length, 4);
  assert.ok(dashboard.stocks.every((row) => row.date === "2026-10-02"));
  const history = await getStockHistory("sndk");
  assert.deepEqual(
    history.map((row) => row.date),
    ["2026-10-02", "2026-10-01", "2026-09-30"],
  );
  assert.deepEqual(
    history.map((row) => row.tradingBias),
    ["BUY ZONE", "WATCH", "WAIT"],
  );
});
test("native Excel serial dates and times normalize correctly", async () => {
  const row = await sampleRow();
  await withWorkbook([{ ...row, Date: 46297, Time: 0.5 }], async (file) => {
    const [actual] = await readExcel(file);
    assert.equal(actual.date, "2026-10-02");
    assert.equal(actual.time, "12:00:00");
  });
});
test("bad values report row and column rather than silently substituting zero", async () => {
  const row = await sampleRow();
  for (const RSI of [null, "", "abc"]) {
    await withWorkbook([{ ...row, RSI }], (file) =>
      assert.rejects(readExcel(file), /Excel row 2: Invalid or missing RSI/),
    );
  }
  await withWorkbook([{ ...row, Date: "2026-02-30" }], (file) =>
    assert.rejects(readExcel(file), /Excel row 2: Date must/),
  );
  await withWorkbook([row, row], (file) =>
    assert.rejects(readExcel(file), /Excel row 3: Duplicate/),
  );
});
