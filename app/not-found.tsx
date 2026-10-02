import Link from "next/link";
export default function NotFound() {
  return (
    <div className="panel section">
      <h1>ไม่พบข้อมูล</h1>
      <p className="muted mb-5">ไม่พบหุ้นหรือ snapshot ที่เลือกใน Excel</p>
      <Link href="/" className="positive">
        ← กลับ Dashboard
      </Link>
    </div>
  );
}
