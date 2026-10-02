import Link from "next/link";
import type { StockAnalysis } from "@/types/stock";
import { date, percent, price, number, tone, priceRange } from "@/lib/format";
import { Status } from "./Panels";
export default function StockCard({ stock: s }: { stock: StockAnalysis }) {
  const nearest = (values: (number | null)[]) =>
    s.price == null
      ? null
      : (values
          .filter((n): n is number => n != null)
          .sort((a, b) => Math.abs(a - s.price!) - Math.abs(b - s.price!))[0] ??
        null);
  const zone = (side: string, values: (number | null)[]) => {
    if (!s.levels?.length) return price(nearest(values));
    if (s.price == null) return "—";
    const levels = s.levels
      .filter((l) => l.side === side && l.low != null && l.high != null)
      .sort(
        (a, b) =>
          Math.max(a.low! - s.price!, s.price! - a.high!, 0) -
          Math.max(b.low! - s.price!, s.price! - b.high!, 0),
      );
    return levels[0] ? priceRange(levels[0].low, levels[0].high) : "—";
  };
  return (
    <Link
      href={`/stocks/${encodeURIComponent(s.ticker)}`}
      className="stock-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="ticker-icon">{s.ticker.slice(0, 2)}</span>
          <div>
            <h2>{s.ticker}</h2>
            <span className="muted text-xs">
              {date(s.date)} · {s.time}
            </span>
          </div>
        </div>
        <span className="muted">↗</span>
      </div>
      <div className="card-price">
        <strong>{price(s.price)}</strong>
        <span className={tone(s.changePercent)}>
          {percent(s.changePercent)}
        </span>
      </div>
      <Status bias={s.tradingBias} risk={s.riskLevel} />
      <dl className="card-levels">
        <div>
          <dt>Nearest support</dt>
          <dd>{zone("support", [s.support1, s.support2, s.support3])}</dd>
        </div>
        <div>
          <dt>Nearest resistance</dt>
          <dd>
            {zone("resistance", [s.resistance1, s.resistance2, s.resistance3])}
          </dd>
        </div>
        <div>
          <dt>RSI</dt>
          <dd>{number(s.rsi, 1)}</dd>
        </div>
      </dl>
      <p className="card-summary">{s.analysisSummary}</p>
      {s.dataStatus && (
        <p className="muted text-xs mt-3">Data · {s.dataStatus}</p>
      )}
      <span className="card-link">
        ดูบทวิเคราะห์ <span>→</span>
      </span>
    </Link>
  );
}
