import type { StockAnalysis } from "@/types/stock";
import { price, priceRange, number } from "@/lib/format";
import { Panel, Metrics } from "./Panels";
export default function TradingPlan({ stock: s }: { stock: StockAnalysis }) {
  if (s.plans)
    return (
      <Panel title="Trading plan" subtitle="เงื่อนไขจาก Excel">
        <div className="plan-list">
          {s.plans.map((p) => (
            <div className="plan-item" key={p.name}>
              <h3 className="positive">Plan {p.name}</h3>
              <Metrics
                items={[
                  ["Entry zone", priceRange(p.low, p.high)],
                  ["Entry example", price(p.entry)],
                  ["Stop Loss", price(p.stop)],
                  ...p.targets.map((target, index): [string, string] => [
                    `Target ${index + 1}`,
                    price(target),
                  ]),
                  ["RR to Target 1", number(p.rr)],
                ]}
              />
              <p className="summary-text mt-3">{p.trigger}</p>
              <p className="summary-text mt-3">
                <span className="negative">ยกเลิกแผน: </span>
                {p.invalidation}
              </p>
              <small className="muted mt-3">{p.status}</small>
            </div>
          ))}
        </div>
      </Panel>
    );
  return (
    <Panel title="Trading plan" subtitle="บันทึกจาก Excel">
      <Metrics
        items={[
          ["Entry A", price(s.entryA)],
          ["Entry B", price(s.entryB)],
          ["Entry C", price(s.entryC)],
          ["Stop Loss", price(s.stopLoss)],
          ["Target 1", price(s.target1)],
          ["Target 2", price(s.target2)],
          ["Target 3", price(s.target3)],
        ]}
      />
    </Panel>
  );
}
