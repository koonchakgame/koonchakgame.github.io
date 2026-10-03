import type { StockAnalysis } from "@/types/stock";

export function nearestSupport(stock: StockAnalysis, current: number) {
  if (!Number.isFinite(current) || current <= 0) return null;
  const zones = stock.levels?.length
    ? stock.levels.filter((level) => level.side === "support").map((level) => ({ low: level.low, high: level.high }))
    : [stock.support1, stock.support2, stock.support3].map((value) => ({ low: value, high: value }));
  const candidates = zones.flatMap(({ low, high }) => {
    if (low == null || high == null || !Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high < low || current < low) return [];
    const distance = current <= high ? 0 : (current - high) / current * 100;
    return [{ low, high, distance }];
  });
  return candidates.sort((a, b) => a.distance - b.distance)[0] ?? null;
}
