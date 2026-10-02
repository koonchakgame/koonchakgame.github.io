import type { ReactNode } from "react";
export function Panel({
  title,
  children,
  subtitle,
}: {
  title: string;
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        {subtitle && <span className="muted text-xs">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}
export function Metrics({ items }: { items: [string, string][] }) {
  return (
    <dl className="metrics">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function Status({ bias, risk }: { bias: string; risk: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`badge ${bias === "BUY ZONE" ? "positive" : bias === "AVOID" ? "negative" : "neutral"}`}
      >
        {bias}
      </span>
      <span className="badge risk">Risk · {risk}</span>
    </div>
  );
}
