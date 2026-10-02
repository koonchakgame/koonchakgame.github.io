import * as XLSX from "xlsx";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
const destination = "data/stock-analysis.xlsx";
if (existsSync(destination) && !process.argv.includes("--force"))
  throw new Error(
    "Sample already exists. Use --force only to replace it with demo data.",
  );
const rows = [];
const symbols = [
  {
    ticker: "SNDK",
    base: 112.48,
    bias: ["WAIT", "WATCH", "BUY ZONE"],
    risk: "HIGH",
    summary:
      "ราคาตัวอย่างเข้าใกล้แนวรับที่บันทึกไว้ ติดตามการยืนเหนือ EMA20 และปริมาณซื้อขายก่อนพิจารณาแผนที่กำหนด",
  },
  {
    ticker: "MU",
    base: 145.32,
    bias: ["WATCH", "BUY ZONE", "WATCH"],
    risk: "MEDIUM",
    summary:
      "ข้อมูลจำลองแสดงการฟื้นตัวเหนือค่าเฉลี่ยระยะสั้น แนวต้านแรกยังเป็นระดับที่ต้องติดตามตามบทวิเคราะห์",
  },
  {
    ticker: "NBIS",
    base: 68.75,
    bias: ["WATCH", "WAIT", "AVOID"],
    risk: "HIGH",
    summary:
      "ตัวอย่างสถานะหลีกเลี่ยงเนื่องจากความผันผวนสูง รอการประเมินใหม่ในบทวิเคราะห์รอบถัดไป",
  },
  {
    ticker: "NVDA",
    base: 182.64,
    bias: ["WAIT", "WATCH", "WAIT"],
    risk: "MEDIUM",
    summary:
      "ตัวอย่างแผนรอราคาเข้าสู่บริเวณที่กำหนด ไม่ไล่ราคาบริเวณแนวต้าน และติดตามสภาพตลาดโดยรวม",
  },
];
const round = (n) => Math.round(n * 100) / 100;
for (let day = 0; day < 3; day++) {
  for (const [index, symbol] of symbols.entries()) {
    const p = round(symbol.base * (1 + (day - 2) * 0.015));
    const previous = round(p * (index === 2 ? 1.017 : 0.988));
    rows.push({
      Date: ["2026-09-30", "2026-10-01", "2026-10-02"][day],
      Time: "16:00:00",
      Ticker: symbol.ticker,
      Price: p,
      PreviousClose: previous,
      ChangePercent: round((p / previous - 1) * 100),
      Support1: round(p * 0.975),
      Support2: round(p * 0.95),
      Support3: round(p * 0.91),
      Resistance1: round(p * 1.025),
      Resistance2: round(p * 1.06),
      Resistance3: round(p * 1.1),
      RSI: round(46 + day * 3.8 + index * 2.1),
      EMA20: round(p * 0.98),
      EMA50: round(p * 0.94),
      EMA200: round(p * 0.82),
      Volume: 12500000 + index * 9000000 + day * 320000,
      US10Y: round(4.12 + day * 0.02),
      US30Y: round(4.64 + day * 0.01),
      Nasdaq: 22400 + day * 145,
      VIX: round(19.4 - day * 0.6),
      DXY: round(99.8 + day * 0.15),
      WTI: round(68.5 + day * 0.45),
      Brent: round(72.8 + day * 0.5),
      Gold: 3280 + day * 12,
      EntryA: round(p * 0.975),
      EntryB: round(p * 0.95),
      EntryC: round(p * 0.93),
      StopLoss: round(p * 0.89),
      Target1: round(p * 1.025),
      Target2: round(p * 1.06),
      Target3: round(p * 1.1),
      NewsSummary:
        "ข่าวจำลองสำหรับทดสอบ Dashboard เท่านั้น ไม่ใช่ข่าวจริง\nติดตามประกาศผลประกอบการ แนวโน้มอุตสาหกรรม และข้อมูลเศรษฐกิจในบทวิเคราะห์ที่ผู้ใช้บันทึกเอง",
      AnalysisSummary: symbol.summary,
      TradingBias: symbol.bias[day],
      RiskLevel: symbol.risk,
    });
  }
}
const sheet = XLSX.utils.json_to_sheet(rows);
sheet["!cols"] = Object.keys(rows[0]).map((key) => ({
  wch: key.endsWith("Summary") ? 65 : 19,
}));
sheet["!autofilter"] = { ref: sheet["!ref"] };
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, sheet, "StockAnalysis");
mkdirSync("data", { recursive: true });
writeFileSync(
  destination,
  XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
);
console.log(`Generated ${destination}: ${rows.length} fictional snapshots`);
