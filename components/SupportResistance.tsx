import type { StockAnalysis, AnalysisLevel } from "@/types/stock";
import { priceRange } from "@/lib/format";
import { Panel } from "./Panels";
export default function SupportResistance({
  stock: s,
}: {
  stock: StockAnalysis;
}) {
  const levels: AnalysisLevel[] = s.levels?.length ? s.levels : [
    ...[s.support1, s.support2, s.support3].map((value, index) => ({ side: "support", rank: index + 1, low: value, high: value, reason: "", status: "" })),
    ...[s.resistance1, s.resistance2, s.resistance3].map((value, index) => ({ side: "resistance", rank: index + 1, low: value, high: value, reason: "", status: "" })),
  ];
  const sides = [...new Set(["support", "resistance", ...levels.map((level) => level.side)])];
  return <Panel title="Support & resistance" subtitle="แนวรับ / แนวต้าน">
    <div className="price-level-columns">{sides.map((side) => {
      const items = levels.filter((level) => level.side === side).sort((a, b) => a.rank - b.rank);
      const support = side === "support";
      const label = support ? "แนวรับ" : side === "resistance" ? "แนวต้าน" : side;
      return <div className={`price-level-group ${support ? "support" : "resistance"}`} key={side}>
        <h3>{label}</h3>
        <dl>{items.map((level, index) => <div className="price-level-row" key={`${level.rank}-${index}`}>
          <dt>{support ? "S" : side === "resistance" ? "R" : "L"}{level.rank}</dt>
          <dd><strong>{priceRange(level.low, level.high)}</strong>{level.status && <small className="muted">{level.status}</small>}</dd>
        </div>)}</dl>
        {!items.length && <p className="muted text-xs">ไม่มีข้อมูล</p>}
        {items.some((level) => level.reason) && <details className="trade-details"><summary>เหตุผลของ{label}</summary>{items.filter((level) => level.reason).map((level, index) => <p key={index}><strong>{label} {level.rank}: </strong>{level.reason}</p>)}</details>}
      </div>;
    })}</div>
  </Panel>;
}
