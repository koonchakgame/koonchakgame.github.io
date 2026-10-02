import type { StockAnalysis } from "@/types/stock";
import MarketOverview from "./MarketOverview";
import { Panel } from "./Panels";
export default function MacroPanel({ stock }: { stock: StockAnalysis }) {
  return (
    <Panel title="Macro snapshot" subtitle={`${stock.date} · ${stock.time}`}>
      <MarketOverview stock={stock} />
    </Panel>
  );
}
