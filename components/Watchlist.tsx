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
  const tracked = stocks.flatMap((stock) => {
    const quote = quotes.find((item) => item.symbol === stock.ticker);
    if (!quote || quote.value == null) return [];
    const support = nearestSupport(stock, quote.value);
    return support ? [{ stock, quote, support, stale: error || quote.stale || Boolean(quote.error) }] : [];
  }).sort((a, b) => a.support.distance - b.support.distance);
  const nearby = tracked.filter((item) => !item.stale && item.support.distance <= 5);
  const unavailable = stocks.filter((stock) => !tracked.some((item) => item.stock.ticker === stock.ticker));
  const filtered = stocks.map((stock, index) => ({ stock, index })).filter(({ stock }) => stock.ticker.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <section className="section support-dashboard">
      <div className="section-heading"><h2>หุ้นใกล้แนวรับ <span className="count">{nearby.length}</span></h2><span className="muted text-xs">{nearby.length} ตัวอยู่ห่างไม่เกิน 5%</span></div>
      <p className="feed-caption">เรียงหุ้นตามระยะลงถึงแนวรับ · 3–5% ใกล้แนวรับ / ต่ำกว่า 3% ใกล้มาก · แสดงหุ้นที่ยังห่างไว้ให้ติดตามด้วย</p>
      {error && <p className="feed-warning" role="status">อัปเดตราคาไม่สำเร็จ · เก็บข้อมูลเดิมไว้ให้ดู ระบบจะลองใหม่ในรอบถัดไป</p>}
      <div className="support-grid">{tracked.map(({ stock, quote, support, stale }) => <Link className="support-card" href={`/stocks/${encodeURIComponent(stock.ticker)}`} key={stock.ticker}>
        <div className="flex justify-between gap-3"><strong>{stock.ticker}</strong><span className={`badge ${!stale && support.distance < 3 ? "positive" : "neutral"}`}>{support.distance === 0 ? "อยู่ในแนวรับ" : `อีก ${number(support.distance)}%`}</span></div>
        <p>ราคาล่าสุด <strong>{price(quote.value)}</strong></p><small className="muted">แนวรับ {priceRange(support.low, support.high)}</small>
        <p className={stale ? "negative" : support.distance <= 5 ? "positive" : "muted"}>{stale ? "ข้อมูลเดิม · รออัปเดตราคา" : support.distance > 5 ? "ยังห่างแนวรับ" : support.distance < 3 ? "ใกล้มาก" : "ใกล้แนวรับ"}</p>
      </Link>)}</div>
      {!tracked.length && <p className="empty-feed">{!stocks.length ? "ยังไม่มีบทวิเคราะห์ให้ติดตาม" : error ? "ดึงราคาล่าสุดไม่สำเร็จ รออัปเดตรอบถัดไป" : !quotes.length ? "กำลังตรวจราคาหุ้น…" : "ยังไม่มีราคาและแนวรับที่พร้อมคำนวณ"}</p>}
      {!!unavailable.length && !!quotes.length && <p className="feed-caption">ยังคำนวณไม่ได้: {unavailable.map((stock) => stock.ticker).join(", ")} · ราคาไม่พร้อมใช้งาน ไม่มีแนวรับ หรือราคาต่ำกว่าแนวรับที่บันทึกไว้</p>}
    </section>
    <section className="section">
      <div className="section-heading watchlist-toolbar"><h2>Stock watchlist <span className="count">{filtered.length} / {stocks.length}</span></h2><label className="watchlist-search">ค้นหาหุ้น<input type="search" placeholder="เช่น NVDA, NBIS" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
      <div className="stock-grid">{filtered.map(({ stock, index }) => <div key={stock.ticker}>{cards[index]}</div>)}</div>
      {!filtered.length && <p className="empty-feed">{stocks.length ? "ไม่พบหุ้นที่ตรงกับคำค้นหา" : "ยังไม่มีบทวิเคราะห์"}</p>}
    </section>
  </>;
}
