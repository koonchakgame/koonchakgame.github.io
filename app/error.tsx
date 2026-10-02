"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="panel section">
      <h1>อ่านข้อมูลไม่สำเร็จ</h1>
      <p className="muted my-4">
        ตรวจสิทธิ์โฟลเดอร์และไฟล์บน Google Drive รวมถึง schema ตาม README
        แล้วลองใหม่ รายละเอียดข้อผิดพลาดอยู่ใน server log
      </p>
      <button className="badge neutral cursor-pointer" onClick={reset}>
        ลองอีกครั้ง
      </button>
    </div>
  );
}
