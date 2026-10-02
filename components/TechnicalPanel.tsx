import type { StockAnalysis } from "@/types/stock";
import { number, price } from "@/lib/format";
import { Panel, Metrics } from "./Panels";
export default function TechnicalPanel({ stock: s }: { stock: StockAnalysis }) {
  return (
    <Panel title="Technical indicators">
      <Metrics
        items={[
          ["RSI", number(s.rsi, 1)],
          ["EMA 20", price(s.ema20)],
          ["EMA 50", price(s.ema50)],
          ["EMA 200", price(s.ema200)],
          ["Volume", number(s.volume, 0)],
        ]}
      />
    </Panel>
  );
}
