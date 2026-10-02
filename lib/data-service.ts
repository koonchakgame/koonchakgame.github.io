import "server-only";
import { excelRepository } from "./excel";
import { getDriveDataset } from "./drive";
export async function getAnalysisDataset() {
  if (process.env.ANALYSIS_SOURCE === "local")
    return {
      rows: await excelRepository.getAll(),
      files: ["stock-analysis.xlsx"],
      warnings: [] as string[],
      fetchedAt: new Date().toISOString(),
      stale: false,
    };
  const result = await getDriveDataset();
  return {
    ...result.data,
    fetchedAt: result.fetchedAt,
    stale: result.stale,
    warnings: [
      ...result.data.warnings,
      ...(result.error ? [`ข้อมูลเดิม: ${result.error}`] : []),
    ],
  };
}
const sorted = (rows: Awaited<ReturnType<typeof getAnalysisDataset>>["rows"]) =>
  [...rows].sort(
    (a, b) =>
      (b.asOf || `${b.date}T${b.time}`).localeCompare(
        a.asOf || `${a.date}T${a.time}`,
      ) || a.ticker.localeCompare(b.ticker),
  );
export async function getAnalyses() {
  return sorted((await getAnalysisDataset()).rows);
}
export async function getDashboardData() {
  const dataset = await getAnalysisDataset();
  const rows = sorted(dataset.rows);
  const latest = new Map<string, (typeof rows)[number]>();
  for (const row of rows)
    if (!latest.has(row.ticker)) latest.set(row.ticker, row);
  return {
    market: rows[0] ?? null,
    stocks: [...latest.values()],
    count: rows.length,
    dataset,
  };
}
export async function getStockHistory(ticker: string) {
  return (await getAnalyses()).filter(
    (row) => row.ticker === ticker.toUpperCase(),
  );
}
