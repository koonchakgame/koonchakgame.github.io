import Link from "next/link";
import LiveStockPrice from "@/components/LiveStockPrice";
import { notFound } from "next/navigation";
import { getStockHistory } from "@/lib/data-service";
import { date, price, percent, number, tone, priceRange } from "@/lib/format";
import { StockNews } from "@/components/SourceDetails";
import { Panel, Metrics, Status } from "@/components/Panels";
import TechnicalPanel from "@/components/TechnicalPanel";
import SupportResistance from "@/components/SupportResistance";
import TradingPlan from "@/components/TradingPlan";
import MacroPanel from "@/components/MacroPanel";
import NewsPanel from "@/components/NewsPanel";
import { macroFields } from "@/components/MarketOverview";
export const dynamic = "force-dynamic";
export default async function StockDetail({
  params,
  searchParams,
}: {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<{ snapshot?: string }>;
}) {
  const { ticker } = await params;
  const { snapshot } = await searchParams;
  const history = await getStockHistory(ticker);
  if (!history.length) notFound();
  const s = snapshot
    ? history.find(
        (row) => (row.analysisId || `${row.date}T${row.time}`) === snapshot,
      )
    : history[0];
  if (!s) notFound();
  const snapshotId = (row: typeof s) =>
    row.analysisId || `${row.date}T${row.time}`;
  const href = (row: typeof s) =>
    `/stocks/${encodeURIComponent(row.ticker)}?snapshot=${encodeURIComponent(snapshotId(row))}`;
  const levelsText = (row: typeof s, side: string) =>
    row.levels
      ? row.levels
          .filter((l) => l.side === side)
          .map((l) => priceRange(l.low, l.high))
          .join(" / ")
      : (side === "support"
          ? [row.support1, row.support2, row.support3]
          : [row.resistance1, row.resistance2, row.resistance3]
        )
          .map(price)
          .join(" / ");
  return (
    <>
      <Link href="/" className="back-link">
        ← กลับ Dashboard
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">STOCK ANALYSIS / {s.ticker}</p>
          <div className="stock-title-row"><h1>
            {s.ticker}
            <span>.</span>
          </h1><LiveStockPrice ticker={s.ticker} /></div>
          <p className="muted">
            {date(s.date)} · {s.time} · Asia/Bangkok
            {s.sessionDate && ` · วันตลาดสหรัฐ ${s.sessionDate}`}
          </p>
        </div>
        <Status bias={s.tradingBias} risk={s.riskLevel} />
      </div>
      <div className="notice">
        <span className="notice-dot" />
        แสดงบทวิเคราะห์จาก Excel · ค่าที่ไม่มีแสดง — · ไม่คำนวณสัญญาณซื้อขาย
        {s.dataStatus && ` · Data: ${s.dataStatus}`}
        {s.confidence && ` · Confidence: ${s.confidence}`}
        {s.sourceUrl && (
          <>
            <br />
            <a
              className="source-link"
              href={s.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {s.sourceFile} ↗
            </a>
          </>
        )}
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>Analysis history</h2>
          <span className="muted text-xs">
            เลือก snapshot เพื่อดูรายละเอียด
          </span>
        </div>
        <nav className="history-tabs" aria-label="Analysis snapshots">
          {history.map((row) => (
            <Link
              aria-current={row === s ? "page" : undefined}
              className={row === s ? "selected" : ""}
              key={snapshotId(row)}
              href={href(row)}
            >
              {date(row.date)}
              <small>{row.time}</small>
            </Link>
          ))}
        </nav>
      </section>
      <NewsPanel title="Analysis summary" text={s.analysisSummary} />
      <div className="detail-grid compact-analysis">
        <Panel title="Price snapshot">
          <div className="detail-price">
            {price(s.price)}
            <span className={tone(s.changePercent)}>
              {percent(s.changePercent)}
            </span>
          </div>
          <Metrics
            items={[
              ["Analysis price", price(s.price)],
              ["Previous close", price(s.previousClose)],
              ["Change %", percent(s.changePercent)],
            ]}
          />
        </Panel>
        <TechnicalPanel stock={s} />
        <SupportResistance stock={s} />
        <TradingPlan stock={s} />
      </div>
      <details className="analysis-fold section"><summary>Macro overview</summary>
      <div className="section">
        <MacroPanel stock={s} />
        <p className="feed-caption">
          Macro ในบทวิเคราะห์เก็บตามเวลาของแต่ละแหล่ง ไม่แทนด้วยราคาปัจจุบัน ·
          ดู Data status & sources ด้านล่าง
        </p>
      </div>
      </details>
      <details className="analysis-fold section"><summary>Historical comparison</summary>
      <section className="section">
        <Panel
          title="Historical comparison"
          subtitle="เลื่อนตารางแนวนอนเพื่อดูทุกคอลัมน์"
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    "Snapshot",
                    "Price",
                    "Change %",
                    "Support 1 / 2 / 3",
                    "Resistance 1 / 2 / 3",
                    "RSI",
                    "Trading bias",
                    "Risk",
                    ...macroFields.map(([label]) => label),
                  ].map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr
                    key={snapshotId(row)}
                    className={row === s ? "active-row" : ""}
                  >
                    <td>
                      <Link href={href(row)}>
                        {date(row.date)}
                        <small>{row.time}</small>
                      </Link>
                    </td>
                    <td>{price(row.price)}</td>
                    <td className={tone(row.changePercent)}>
                      {percent(row.changePercent)}
                    </td>
                    <td>{levelsText(row, "support") || "—"}</td>
                    <td>{levelsText(row, "resistance") || "—"}</td>
                    <td>{number(row.rsi, 1)}</td>
                    <td>{row.tradingBias}</td>
                    <td>{row.riskLevel}</td>
                    {macroFields.map(([, key, unit]) => (
                      <td key={key}>
                        {row[key] == null
                          ? "—"
                          : `${unit === "$" ? "$" : ""}${number(row[key])}${unit === "%" ? "%" : ""}`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
      </details>
      <details className="analysis-fold section"><summary>News summary</summary><StockNews stock={s} /></details>
    </>
  );
}
