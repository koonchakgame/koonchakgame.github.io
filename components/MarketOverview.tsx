import type { StockAnalysis } from "@/types/stock";
import { number } from "@/lib/format";
export const macroFields = [
  ["US 10Y", "us10y", "%"],
  ["US 30Y", "us30y", "%"],
  ["Nasdaq", "nasdaq", ""],
  ["VIX", "vix", ""],
  ["DXY", "dxy", ""],
  ["WTI", "wti", "$"],
  ["Brent", "brent", "$"],
  ["Gold", "gold", "$"],
] as const;
export default function MarketOverview({ stock }: { stock: StockAnalysis }) {
  return (
    <dl className="market-grid">
      {macroFields.map(([label, key, unit]) => (
        <div className="market-tile" key={key}>
          <dt>{label}</dt>
          <dd>
            {stock[key] == null
              ? "—"
              : `${unit === "$" ? "$" : ""}${number(stock[key])}${unit === "%" ? "%" : ""}`}
          </dd>
          <span>Excel snapshot · ไม่ใช่ live</span>
        </div>
      ))}
    </dl>
  );
}
