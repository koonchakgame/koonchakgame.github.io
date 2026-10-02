import type { StockAnalysis } from "@/types/stock";
import { price, priceRange } from "@/lib/format";
import { Panel, Metrics } from "./Panels";
export default function SupportResistance({
  stock: s,
}: {
  stock: StockAnalysis;
}) {
  if (s.levels)
    return (
      <Panel title="Support & resistance">
        <div className="level-list">
          {s.levels.map((l) => (
            <div className="level-item" key={`${l.side}-${l.rank}`}>
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className={l.side === "support" ? "positive" : "negative"}>
                  {l.side} {l.rank}
                </h3>
                <strong>{priceRange(l.low, l.high)}</strong>
              </div>
              <p>{l.reason}</p>
              <small className="muted">{l.status}</small>
            </div>
          ))}
        </div>
      </Panel>
    );
  return (
    <Panel title="Support & resistance">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <p className="positive mb-3 text-xs">SUPPORT</p>
          <Metrics
            items={[
              ["Support 1", price(s.support1)],
              ["Support 2", price(s.support2)],
              ["Support 3", price(s.support3)],
            ]}
          />
        </div>
        <div>
          <p className="negative mb-3 text-xs">RESISTANCE</p>
          <Metrics
            items={[
              ["Resistance 1", price(s.resistance1)],
              ["Resistance 2", price(s.resistance2)],
              ["Resistance 3", price(s.resistance3)],
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
