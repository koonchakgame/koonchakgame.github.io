"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useStockQuotes } from "./LiveStockPrice";
import { nearestSupport } from "@/lib/support-distance";
import { number, price, priceRange } from "@/lib/format";
import type { StockAnalysis } from "@/types/stock";

export default function Watchlist({ stocks, cards }: { stocks: StockAnalysis[]; cards: ReactNode[] }) {
  const [query, setQuery] = useState("");
  const { quotes, error } = useStockQuotes();
  const nearby = stocks.flatMap((stock) => {
    const quote = quotes.find((item) => item.symbol === stock.ticker);
    if (error || !quote || quote.stale || quote.error || quote.value == null) return [];
    const support = nearestSupport(stock, quote.value);
    return support && support.distance <= 5 ? [{ stock, quote, support }] : [];
  }).sort((a, b) => a.support.distance - b.support.distance);
  const filtered = stocks.map((stock, index) => ({ stock, index })).filter(({ stock }) => stock.ticker.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <section className="section support-dashboard">
      <div className="section-heading"><h2>หุ้นใกล้แนวรับ <span className="count">{nearby.length}</span></h2><span className="muted text-xs">ระยะลงถึงแนวรับไม่เกิน 5%</span></div>
      <p className="feed-caption">เทียบราคาล่าสุด Yahoo กับแนวรับในบทวิเคราะห์ · 3–5% ใกล้แนวรับ / ต่ำกว่า 3% ใกล้มาก · ไม่รวมราคาที่ดึงไม่สำเร็จ</p>
      <div className="support-grid">{nearby.map(({ stock, quote, support }) => <Link className="support-card" href={`/stocks/${encodeURIComponent(stock.ticker)}`} key={stock.ticker}>
        <div className="flex justify-between gap-3"><strong>{stock.ticker}</strong><span className={`badge ${support.distance < 3 ? "positive" : "neutral"}`}>{support.distance === 0 ? "อยู่ในแนวรับ" : `อีก ${number(support.distance)}%`}</span></div>
        <p>ราคาล่าสุด <strong>{price(quote.value)}</strong></p><small className="muted">แนวรับ {priceRange(support.low, support.high)}</small>
      </Link>)}</div>
      {!nearby.length && <p className="empty-feed">{error ? "ดึงราคาล่าสุดไม่สำเร็จ รออัปเดตรอบถัดไป" : !quotes.length ? "กำลังตรวจราคาหุ้น…" : "ยังไม่มีหุ้นที่อยู่เหนือแนวรับไม่เกิน 5% จากราคาที่พร้อมใช้งาน"}</p>}
    </section>
    <section className="section">
      <div className="section-heading watchlist-toolbar"><h2>Stock watchlist <span className="count">{filtered.length} / {stocks.length}</span></h2><label className="watchlist-search">ค้นหาหุ้น<input type="search" placeholder="เช่น NVDA, NBIS" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
      <div className="stock-grid">{filtered.map(({ stock, index }) => <div key={stock.ticker}>{cards[index]}</div>)}</div>
      {!filtered.length && <p className="empty-feed">{stocks.length ? "ไม่พบหุ้นที่ตรงกับคำค้นหา" : "ยังไม่มีบทวิเคราะห์"}</p>}
    </section>
  </>;
}
