import type { StockAnalysis } from "@/types/stock";
import { price, priceRange, number } from "@/lib/format";
import { Panel } from "./Panels";
function Targets({ values }: { values: (number | null)[] }) {
  return <dl className="plan-targets">{values.map((value, index) =>
    <div key={index}><dt>TP{index + 1}</dt><dd>{price(value)}</dd></div>,
  )}</dl>;
}
export default function TradingPlan({ stock: s }: { stock: StockAnalysis }) {
  if (s.plans?.length)
    return (
      <Panel title="Trading plan" subtitle="จุดเข้า → Stop → เป้าหมาย">
        <div className="trade-plan-grid">
          {s.plans.map((p, index) => (
            <article className="trade-plan-card" key={`${p.name}-${index}`}>
              <div className="trade-plan-heading"><h3>Plan {p.name}</h3><span className="muted">RR {number(p.rr)}</span></div>
              <dl className="plan-key-prices">
                <div><dt>จุดเข้า</dt><dd className="positive">{p.low != null || p.high != null ? priceRange(p.low, p.high) : price(p.entry)}</dd></div>
                <div><dt>Stop Loss</dt><dd className="negative">{price(p.stop)}</dd></div>
              </dl>
              <Targets values={p.targets} />
              {p.status && <p className="plan-status muted">{p.status}</p>}
              {(p.trigger || p.invalidation || p.entry != null) && <details className="trade-details">
                <summary>เงื่อนไขเข้า / ยกเลิกแผน</summary>
                {p.entry != null && <p>ตัวอย่างจุดเข้า <strong>{price(p.entry)}</strong></p>}
                {p.trigger && <p><strong>เข้าเมื่อ: </strong>{p.trigger}</p>}
                {p.invalidation && <p><strong className="negative">ยกเลิกเมื่อ: </strong>{p.invalidation}</p>}
              </details>}
            </article>
          ))}
        </div>
      </Panel>
    );
  return (
    <Panel title="Trading plan" subtitle="จุดเข้า → Stop → เป้าหมาย">
      <dl className="plan-entries">{[s.entryA, s.entryB, s.entryC].map((value, index) =>
        <div key={index}><dt>จุดเข้า {String.fromCharCode(65 + index)}</dt><dd className="positive">{price(value)}</dd></div>,
      )}</dl>
      <div className="plan-exit-row"><div className="plan-stop"><span>Stop Loss</span><strong className="negative">{price(s.stopLoss)}</strong></div><Targets values={[s.target1, s.target2, s.target3]} /></div>
    </Panel>
  );
}
