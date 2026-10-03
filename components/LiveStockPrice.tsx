"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { percent, price, timestamp, tone } from "@/lib/format";
import type { MarketQuote } from "@/types/live";

const QuotesContext = createContext<{ quotes: MarketQuote[]; error: boolean }>({ quotes: [], error: false });
export function useStockQuotes() { return useContext(QuotesContext); }

export function StockQuotesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({ quotes: [] as MarketQuote[], error: false });
  const pathname = usePathname();
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let busy = false;
    async function update() {
      if (busy) return;
      clearTimeout(timer);
      if (document.hidden) return;
      busy = true;
      try {
        const response = await fetch("/api/stock-quotes", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Quote unavailable");
        const payload: { quotes: MarketQuote[] } = await response.json();
        if (!controller.signal.aborted) setState({ quotes: payload.quotes, error: false });
      } catch {
        if (!controller.signal.aborted) setState((previous) => ({ ...previous, error: true }));
      } finally {
        busy = false;
        if (!controller.signal.aborted) timer = setTimeout(() => void update(), 60_000);
      }
    }
    const onVisible = () => { if (!document.hidden) void update(); };
    void update();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);
  return <QuotesContext.Provider value={state}>{children}</QuotesContext.Provider>;
}

export default function LiveStockPrice({ ticker }: { ticker: string }) {
  const { quotes, error } = useContext(QuotesContext);
  const quote = quotes.find((item) => item.symbol === ticker);
  return (
    <div className="live-stock-price" aria-label={`ราคาล่าสุด ${ticker}`}>
      <small className="muted">ราคาล่าสุด · Yahoo</small>
      <div><strong>{price(quote?.value)}</strong> <span className={tone(quote?.changePercent)}>{percent(quote?.changePercent)}</span></div>
      <small className="muted">{quote?.asOf ? `${timestamp(quote.asOf)} · ไทย` : error || quote?.error ? "ราคาไม่พร้อมใช้งาน" : quote ? "ไม่มีราคา" : "กำลังโหลด…"}</small>
      {(error || quote?.stale || quote?.error) && <small className="negative">{quote?.value != null ? "ข้อมูลเดิม · อัปเดตไม่สำเร็จ" : "ดึงราคาไม่ได้"}</small>}
      <small className="muted">อัปเดตทุก 60 วินาที · ราคาอาจล่าช้า</small>
    </div>
  );
}
