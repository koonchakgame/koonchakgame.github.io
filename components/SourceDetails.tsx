import type { StockAnalysis } from "@/types/stock";
import { number } from "@/lib/format";
import { Panel } from "./Panels";
function SourceLink({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return /^https?:\/\//i.test(url) ? (
    <a className="source-link" href={url} target="_blank" rel="noreferrer">
      {children} ↗
    </a>
  ) : (
    <span className="muted">{children || "ไม่มี URL"}</span>
  );
}
export function StockNews({ stock }: { stock: StockAnalysis }) {
  return (
    <Panel title="News summary">
      {stock.news?.length ? (
        stock.news.map((item, index) => (
          <article className="news-source" key={index}>
            <small className="muted">
              {item.date} · {item.impact}
            </small>
            <h3 className="my-3 font-semibold">{item.headline}</h3>
            <p className="summary-text">{item.fact}</p>
            <p className="metric-note my-3">{item.readthrough}</p>
            <SourceLink url={item.url}>แหล่งข่าว</SourceLink>
          </article>
        ))
      ) : (
        <p className="summary-text">
          {stock.newsSummary || "ไม่มีข้อมูลข่าวในไฟล์"}
        </p>
      )}
    </Panel>
  );
}
export function MetricProvenance({ stock }: { stock: StockAnalysis }) {
  if (!stock.metrics?.length) return null;
  return (
    <div className="metric-provenance">
      <Panel
        title="Data status & sources"
        subtitle="ค่าและหมายเหตุจาก Metrics ใน Excel"
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
                <th>Source time / note</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {stock.metrics.map((metric, index) => (
                <tr key={index}>
                  <td>{metric.name}</td>
                  <td>
                    {number(metric.value)}
                    <small>{metric.unit}</small>
                  </td>
                  <td>{metric.status}</td>
                  <td>
                    <small>{metric.asOf}</small>
                    <p className="metric-note mt-2">{metric.note}</p>
                  </td>
                  <td>
                    <SourceLink url={metric.url}>{metric.source}</SourceLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
