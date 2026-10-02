# StockLens — Drive + Yahoo Dashboard

Next.js App Router / TypeScript / Tailwind CSS / SheetJS เว็บแสดงบทวิเคราะห์เท่านั้น ไม่มี Auto Trade หรือส่งคำสั่งซื้อขาย

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000 จาก root repository โดยค่าเริ่มต้นเชื่อมโฟลเดอร์ [Google Drive ที่ผู้ใช้กำหนด](https://drive.google.com/drive/folders/1DRqwz7l0oyqI1aJyFrs_kMbwspfeuNQq) อัตโนมัติ ไม่ต้องใส่ key สำหรับโฟลเดอร์และไฟล์ที่เปิดให้อ่านแบบ public

## บทวิเคราะห์จาก Drive

- อ่าน Excel `.xlsx` / `.xls` และ native Google Sheets ในโฟลเดอร์โดยตรง ไม่รวมโฟลเดอร์ย่อย
- แสดงเฉพาะ ticker ที่มีในแถวข้อมูลที่อ่านสำเร็จ เช่นมีไฟล์ NBIS เท่านั้นก็แสดง NBIS เท่านั้น ไม่รวมข้อมูลสาธิตในเครื่อง
- เพิ่ม/แก้/ลบไฟล์บน Drive แล้วเว็บตรวจใหม่ทุก 60 วินาทีเมื่อหน้า Dashboard เปิดอยู่; cache ฝั่ง server 60 วินาที รีเฟรชหน้าหรือกลับมาเปิด tab เพื่อดึงข้อมูล
- แต่ละ ticker เลือกบทวิเคราะห์ล่าสุดตามเวลาของข้อมูล รายการเดิมที่ยังอยู่ใน Excel/โฟลเดอร์ปรากฏในหน้าประวัติ ไม่ได้เก็บฐานข้อมูลหรือสำรองไฟล์ที่ถูกลบ
- ไฟล์อ่านไม่ได้จะแจ้งชื่อไฟล์และข้อผิดพลาด ไม่ดึงหุ้นตัวอย่างมาทดแทน ถ้า Drive ทั้งโฟลเดอร์ล่มหลังโหลดสำเร็จ จะใช้ข้อมูลเดิมพร้อมแจ้งสถานะ; การลบไฟล์ที่อ่านรายการได้สำเร็จจะถูกสะท้อนในรอบ sync ถัดไป
- แสดงชื่อและลิงก์ไฟล์ต้นทางในหน้าหุ้น

### Schema ที่รองรับ

1. Schema หลายชีตจาก `NBIS_AI_2026-10-03.xlsx`: `Analysis`, `Metrics`, `Levels`, `Plans`, `News` (ชีต Report เป็นรายงานประกอบ ไม่ใช้แทนข้อมูลหลัก)
2. Schema แบบแถวเดียวต่อ snapshot รุ่นแรกใน `data/stock-analysis.xlsx`:

```text
Date, Time, Ticker, Price, PreviousClose, ChangePercent
Support1, Support2, Support3, Resistance1, Resistance2, Resistance3
RSI, EMA20, EMA50, EMA200, Volume
US10Y, US30Y, Nasdaq, VIX, DXY, WTI, Brent, Gold
EntryA, EntryB, EntryC, StopLoss, Target1, Target2, Target3
NewsSummary, AnalysisSummary, TradingBias, RiskLevel
```

แบบหลายชีต join ด้วย `analysis_id` ไม่ใช่ ticker โดยใช้ `price_asof_epoch_ms` เรียงเวลาและแสดง Asia/Bangkok ส่วน `session_date` แสดงแยกเป็นวันตลาดสหรัฐ

ค่าที่ไม่มี/ระบุ unavailable, not_yet_available หรือ conflicting ไม่ถูกแทนด้วย 0 สถานะ `action` และ Confidence อ่านตามต้นฉบับ ไม่แปลงเป็น BUY/SELL; Risk Level ที่ไม่มีจะระบุว่าไม่ระบุ ไม่อนุมานจาก confidence แนวรับ/ต้านแสดงช่วง `low_usd–high_usd` พร้อมเหตุผลและสถานะ ส่วนแผนแต่ละ A/B/C มี Stop Loss และ Targets ของตัวเอง ไม่รวมเป็นแผนเดียว Target 3 ที่ไม่มีแสดง —

หน้า Data status & sources แสดง Metrics, provenance, หมายเหตุ และลิงก์จากไฟล์ ค่า `VIX_implied_level` ที่คำนวณมาในไฟล์แสดงในตาราง Metrics พร้อม status derived แต่ไม่ใช้แทน VIX ล่าสุดใน snapshot โดยอัตโนมัติ UI ไม่คำนวณ indicator หรือสัญญาณเทรด

### การตั้งค่า

ดู `.env.example` และสร้าง `.env.local` หากต้องการเปลี่ยนค่า:

```dotenv
ANALYSIS_SOURCE=drive
GOOGLE_DRIVE_FOLDER_ID=1DRqwz7l0oyqI1aJyFrs_kMbwspfeuNQq
GOOGLE_DRIVE_API_KEY=
```

ไม่มี key จะอ่าน metadata จาก public folder HTML ของ Google ซึ่งเป็น interface ที่อาจเปลี่ยนได้; หากพบ pagination จะไม่แสดงข้อมูลบางส่วนเงียบ ๆ แต่ขอให้ใช้ key สำหรับ official Drive API ที่รองรับทุกหน้า API key ต้องเปิด Google Drive API และเก็บเฉพาะฝั่ง server **API key ไม่ให้สิทธิ์อ่านไฟล์ส่วนตัว** โฟลเดอร์และทุกไฟล์ยังต้องเปิดอ่าน public หากต้องใช้ข้อมูลส่วนตัวต้องเพิ่ม OAuth/service account adapter ในอนาคต การเชื่อม Google Drive ในแชตไม่ได้ให้ credentials กับเว็บไซต์ที่ deploy

ใช้ `ANALYSIS_SOURCE=local` เพื่อเปิดข้อมูลสาธิตใน `data/stock-analysis.xlsx` แทน Drive เท่านั้น สร้างตัวอย่างใหม่ด้วย `npm run sample` (ไม่เขียนทับไฟล์เดิมเว้นแต่ `npm run sample -- --force`)

## Market Overview — Yahoo Finance

เรียก Yahoo chart endpoint ผ่าน `/api/live` บน server เพื่อหลีกเลี่ยง CORS ไม่ต้องใช้ API key และไม่อ่าน Macro จาก Excel มาแทนข้อมูลตลาดหน้าแรก อัปเดตทุก 60 วินาทีและรวมคำขอซ้ำด้วย cache

| รายการ | Yahoo symbol | ความหมาย |
| --- | --- | --- |
| US 10Y | ^TNX | Cboe 10-year yield index (%) |
| US 30Y | ^TYX | Cboe 30-year yield index (%) |
| Nasdaq | ^IXIC | Nasdaq Composite |
| VIX | ^VIX | Cboe Volatility Index |
| DXY | DX-Y.NYB | US Dollar Index |
| WTI | CL=F | WTI futures (USD/barrel) |
| Brent | BZ=F | Brent futures (USD/barrel) |
| Gold | GC=F | Gold futures (USD/oz) |

Yahoo chart เป็น endpoint ที่ไม่ได้มี public API SLA อาจ rate limit หรือเปลี่ยนรูปแบบ รองรับ query1/query2 และ timeout; แต่ละการ์ดแสดง quote timestamp จาก Yahoo การรีเฟรชทุกนาทีไม่ได้รับรอง tick-by-tick realtime ข้อมูลอาจล่าช้าตามตลาดหรือค้างที่ราคาล่าสุดเมื่อปิดตลาด [Yahoo exchange delays](https://help.yahoo.com/kb/yahoo-finance-plus/partnerships-sln2310.html)

หากบาง symbol ล้มเหลว ตัวอื่นยังแสดงได้ หากเคยโหลดได้จะแสดงข้อมูลเดิมพร้อมป้ายสถานะ ถ้าไม่เคยโหลดได้จะแสดง — และเหตุผล ไม่แสดงค่าจำลอง ทั้ง Drive และ live data มี timeout และแจ้ง error แยกกัน

Macro ในหน้าหุ้นยังเป็นค่าจาก Excel ณ เวลาบทวิเคราะห์ ไม่อัปเดตทับด้วยราคาปัจจุบัน เพื่อรักษาข้อมูลเปรียบเทียบย้อนหลัง

## ข่าวและปฏิทินวันนี้

- ปฏิทิน Forex Factory ใช้ [weekly JSON export](https://nfs.faireconomy.media/ff_calendar_thisweek.json) cache 15 นาที
- มีแท็บวันนี้/สัปดาห์นี้ และตัวกรอง currency / impact พร้อมเวลาไทย, Actual, Forecast, Previous
- คำนวณ “วันนี้” ตาม Asia/Bangkok จากวันที่จริงขณะใช้งาน ไม่ hardcode วันตัวอย่าง
- Actual แสดงเฉพาะถ้า upstream มีข้อมูล feed นี้อาจมีเพียง forecast/previous และไม่ใช่บริการ actual แบบ realtime
- ถ้าไม่มีรายการหรือ feed ไม่ครอบคลุมวันปัจจุบัน จะแจ้งให้ทราบและมีลิงก์เปิด [Forex Factory](https://www.forexfactory.com/calendar)
- พาดหัวข่าวใช้ [Yahoo Finance RSS](https://finance.yahoo.com/rss/topstories) cache 5 นาที แสดงเฉพาะข่าวที่ลงวันที่วันนี้ตามเวลาไทย พร้อมลิงก์อ่านต้นฉบับ ไม่เก็บบทความเต็ม ไม่เอาข่าวเก่ามาแสดงเป็นข่าววันนี้

## Architecture / deployment

```text
UI → Data Service → Drive / local Excel repository → SheetJS parser
Live UI → /api/live → Yahoo quotes / Forex Factory calendar / Yahoo RSS
```

`lib/data-service.ts` เป็นจุดแยกแหล่งข้อมูล; `lib/drive.ts` ดูรายการและดาวน์โหลด; `lib/excel.ts` parse ทั้งสอง schema; `lib/live.ts` ดึงตลาดและข่าว; `lib/cache.ts` รวมคำขอพร้อมกันและรองรับข้อมูลเดิมเมื่อแหล่งล้มเหลว

ใช้ Next.js Node runtime hosting ไม่ใช่ GitHub Pages static export โปรเจกต์ไม่มีการ deploy ให้อัตโนมัติ cache เป็น memory ต่อ server process/instance จึงไม่ใช่ rate limiter รวมทุก instance หากใช้งานหลาย instance หรือผู้ใช้มากควรเพิ่ม Redis/shared cache

## ตรวจสอบ

```bash
npm run lint
npm run test:data
npm run build
npm run test:e2e
npm start
```

Data tests ตรวจทั้งสอง schema, nullable values, plans, Drive discovery, Yahoo timestamp, calendar timezone, RSS link safety และ stale cache โดยไม่พึ่ง network Browser tests ใช้ local demo กับ mock live feed เพื่อให้ผลทำซ้ำได้ ตรวจ Dashboard/detail/history, calendar filters, 404 และ responsive overflow ที่ 390/768/1440 px ค่าเริ่มต้นใช้ Chrome ที่ติดตั้ง; เปลี่ยนด้วย `PLAYWRIGHT_CHANNEL=msedge` หรือ `chromium` พร้อม `npx playwright install chromium`

SheetJS แพ็กเกจชื่อ `xlsx` 0.20.3 จาก [แหล่งทางการ](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/) ตาม lockfile
