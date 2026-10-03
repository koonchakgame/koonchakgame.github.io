"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { date, dayKey, number, percent, timestamp, tone } from "@/lib/format";
import type { LiveDashboardData } from "@/types/live";
export default function LiveDashboard() {
  const [data, setData] = useState<LiveDashboardData | null>(null);
  const [error, setError] = useState("");
  const [scope, setScope] = useState<"today" | "week">("today");
  const [currency, setCurrency] = useState("ALL");
  const [impact, setImpact] = useState("ALL");
  const router = useRouter();
  useEffect(() => {
    let busy = false;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function update() {
      if (busy) return;
      clearTimeout(timer);
      if (document.hidden) return;
      busy = true;
      try {
        const response = await fetch("/api/live", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload: LiveDashboardData = await response.json();
        if (controller.signal.aborted) return;
        setData(payload);
        router.refresh();
        setError("");
      } catch (err) {
        if (!controller.signal.aborted)
          setError(
            `อัปเดตไม่สำเร็จ: ${err instanceof Error ? err.message : "Network error"}`,
          );
      } finally {
        busy = false;
        if (!controller.signal.aborted)
          timer = setTimeout(() => void update(), 60_000);
      }
    }
    void update();
    const onVisible = () => {
      if (!document.hidden) void update();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);
  const today = data?.today ?? dayKey(new Date());
  const calendar = data?.calendar;
  const events = (calendar?.data ?? []).filter(
    (event) =>
      (scope === "week" || dayKey(new Date(event.date)) === today) &&
      (currency === "ALL" || currency === event.currency) &&
      (impact === "ALL" || impact === event.impact),
  );
  const coveredDays = (calendar?.data ?? [])
    .map((e) => dayKey(new Date(e.date)))
    .sort();
  const outsideCoverage =
    coveredDays.length > 0 &&
    (today < coveredDays[0] || today > coveredDays.at(-1)!);
  return (
    <>
      <section className="section">
        {data && (
          <p className="feed-caption" role="status">
            รีเฟรชข้อมูลล่าสุด {timestamp(data.refreshedAt)} · Asia/Bangkok
          </p>
        )}
        <div className="section-heading">
          <h2>
            Market overview <span className="count">YAHOO</span>
          </h2>
          <span className="muted text-xs">
            รีเฟรชพร้อมกันทุก 60 วินาที · ราคาล่าสุดอาจล่าช้า
          </span>
        </div>
        {error && (
          <p className="feed-warning" role="status">
            {error}
            {data && " · แสดงข้อมูลที่ได้รับก่อนหน้า"}
          </p>
        )}
        {data?.market.error && (
          <p className="feed-warning">{data.market.error}</p>
        )}
        <dl className="market-grid live-market">
          {(
            data?.market.data ??
            [
              { key: "us10y", label: "US 10Y" },
              { key: "us30y", label: "US 30Y" },
              { key: "nasdaq", label: "Nasdaq" },
              { key: "vix", label: "VIX" },
              { key: "dxy", label: "DXY" },
              { key: "wti", label: "WTI" },
              { key: "brent", label: "Brent" },
              { key: "gold", label: "Gold" },
            ].map((q) => ({
              ...q,
              symbol: "",
              unit: "",
              description: "",
              value: null,
              changePercent: null,
              asOf: null,
              stale: false,
              error: undefined,
            }))
          ).map((q) => (
            <div key={q.key} className="market-tile">
              <dt>
                {q.label}
                <small>{q.symbol || "Yahoo Finance"}</small>
              </dt>
              <dd>
                {q.value == null
                  ? "—"
                  : `${q.unit === "$" ? "$" : ""}${number(q.value)}${q.unit === "%" ? "%" : ""}`}
              </dd>
              <p className={tone(q.changePercent)}>
                {percent(q.changePercent)}
              </p>
              <span>
                {q.asOf
                  ? timestamp(q.asOf)
                  : data
                    ? "ไม่มีข้อมูลจาก Yahoo"
                    : "กำลังโหลด…"}
                {q.stale && " · ข้อมูลเดิม"}
              </span>
              <small className="muted quote-description">{q.description}</small>
              {q.error && <small className="negative">{q.error}</small>}
            </div>
          ))}
        </dl>
        <p className="feed-caption">
          เวลา Asia/Bangkok · WTI / Brent / Gold เป็น futures ·
          เวลาบนแต่ละการ์ดคือเวลา quote จาก Yahoo ไม่ใช่เวลาที่เว็บรีเฟรช
        </p>
      </section>
      <section className="section news-window">
        <div className="section-heading">
          <h2>
            ปฏิทินเศรษฐกิจ <span className="count">{date(today)}</span>
          </h2>
          <a
            className="positive text-xs"
            href="https://www.forexfactory.com/calendar"
            target="_blank"
            rel="noreferrer"
          >
            Forex Factory ↗
          </a>
        </div>
        <div className="panel">
          <div className="calendar-toolbar">
            <div className="segmented" aria-label="Calendar period">
              <button
                className={scope === "today" ? "selected" : ""}
                onClick={() => setScope("today")}
              >
                วันนี้
              </button>
              <button
                className={scope === "week" ? "selected" : ""}
                onClick={() => setScope("week")}
              >
                สัปดาห์นี้
              </button>
            </div>
            <label>
              สกุลเงิน{" "}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="ALL">ทั้งหมด</option>
                {[...new Set(calendar?.data.map((e) => e.currency) ?? [])]
                  .sort()
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
            </label>
            <label>
              ผลกระทบ{" "}
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Holiday">Holiday</option>
              </select>
            </label>
          </div>
          {calendar?.error && (
            <p className="feed-warning">
              {calendar.error}
              {calendar.stale && " · แสดงตารางที่ได้รับก่อนหน้า"}
            </p>
          )}
          <div className="table-scroll">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th>เวลาไทย</th>
                  <th>Currency</th>
                  <th>Impact</th>
                  <th>Event</th>
                  <th>Actual</th>
                  <th>Forecast</th>
                  <th>Previous</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={`${event.date}-${event.title}-${index}`}>
                    <td>{timestamp(event.date)}</td>
                    <td>
                      <span className="currency-tag">{event.currency}</span>
                    </td>
                    <td>
                      <span
                        className={`impact impact-${event.impact.toLowerCase()}`}
                      >
                        {event.impact || "—"}
                      </span>
                    </td>
                    <td className="event-title">{event.title}</td>
                    <td>{event.actual || "—"}</td>
                    <td>{event.forecast || "—"}</td>
                    <td>{event.previous || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!events.length && (
            <p className="empty-feed">
              {!data
                ? "กำลังโหลดปฏิทิน…"
                : calendar?.error && !calendar.data.length
                  ? "ดึงปฏิทินไม่ได้ในขณะนี้"
                  : outsideCoverage
                    ? "Feed ที่ได้รับยังไม่ครอบคลุมวันนี้ ดูวันที่ในแท็บสัปดาห์นี้หรือเปิด Forex Factory"
                    : scope === "today"
                      ? "ไม่มีรายการวันนี้ตามตัวกรองใน feed ที่ได้รับ"
                      : "ไม่มีรายการที่ตรงกับตัวกรอง"}
            </p>
          )}
          <p className="feed-caption">
            Forex Factory weekly export · รีเฟรชทุก 60 วินาที · เวลา Asia/Bangkok ·
            Actual แสดงเฉพาะเมื่อ feed มีค่า
            {calendar?.fetchedAt &&
              ` · ดึงล่าสุด ${timestamp(calendar.fetchedAt)}`}
          </p>
        </div>
      </section>
    </>
  );
}
