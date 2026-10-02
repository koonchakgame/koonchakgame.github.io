import { getDashboardData } from "@/lib/data-service";
import { DRIVE_FOLDER_URL } from "@/lib/drive";
import { date, timestamp } from "@/lib/format";
import StockCard from "@/components/StockCard";
import LiveDashboard from "@/components/LiveDashboard";
export const dynamic = "force-dynamic";
export default async function Home() {
  const result = await getDashboardData()
    .then((data) => ({ data, error: "" }))
    .catch((error) => ({
      data: null,
      error: error instanceof Error ? error.message : "อ่าน Drive ไม่สำเร็จ",
    }));
  const { stocks = [], market = null, count = 0, dataset } = result.data ?? {};
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR RESEARCH, IN ONE PLACE</p>
          <h1>
            Market dashboard<span>.</span>
          </h1>
          <p className="muted">
            บทวิเคราะห์จาก Google Drive · ตลาดและข่าวจากแหล่งข้อมูลออนไลน์
          </p>
        </div>
        <div className="snapshot">
          <span className="muted text-xs">LATEST ANALYSIS</span>
          <strong>{market ? date(market.date) : "ยังไม่มีบทวิเคราะห์"}</strong>
          <span className="muted text-xs">
            {market?.time} · {stocks.length} symbols
          </span>
        </div>
      </div>
      <div className="notice">
        <span className="notice-dot" />
        แสดงเฉพาะหุ้นที่มีในแหล่งข้อมูล · ค่าที่ขาดแสดง — · สถานะและแผนอ่านจาก
        Excel โดยตรง
      </div>
      <LiveDashboard />
      <section className="section">
        <div className="section-heading">
          <h2>
            Stock watchlist <span className="count">{stocks.length}</span>
          </h2>
          <a
            className="positive text-xs"
            href={DRIVE_FOLDER_URL}
            target="_blank"
            rel="noreferrer"
          >
            เปิดโฟลเดอร์ Drive ↗
          </a>
        </div>
        {result.error && (
          <p className="feed-warning" role="alert">
            {result.error}
          </p>
        )}
        {dataset?.warnings.map((warning, index) => (
          <p className="feed-warning" key={index}>
            {warning}
          </p>
        ))}
        {dataset && (
          <p className="feed-caption source-summary">
            {dataset.files.length} files · {count} snapshots · sync{" "}
            {timestamp(dataset.fetchedAt)}
            {dataset.stale && " · ข้อมูลเดิม"} · ตรวจ Drive ทุก 60 วินาที
          </p>
        )}
        {stocks.length ? (
          <div className="stock-grid">
            {stocks.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} />
            ))}
          </div>
        ) : (
          <div className="panel muted">
            {result.error
              ? "ยังโหลดบทวิเคราะห์ไม่ได้ เว็บไซต์จะลองใหม่ในรอบถัดไป"
              : "ไม่มีบทวิเคราะห์ในไฟล์ที่อ่านได้ เพิ่มไฟล์ Excel ลงโฟลเดอร์ Drive แล้วรีเฟรชหน้า"}
          </div>
        )}
      </section>
      <div className="workflow">
        <span>
          01 <b>ChatGPT วิเคราะห์</b>
        </span>
        <i>→</i>
        <span>
          02 <b>Excel บน Drive</b>
        </span>
        <i>→</i>
        <span>
          03 <b>Dashboard แสดงผล</b>
        </span>
        <small>Research workflow · ไม่มีการซื้อขายอัตโนมัติ</small>
      </div>
    </>
  );
}
