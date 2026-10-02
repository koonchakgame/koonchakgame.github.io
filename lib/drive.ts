import "server-only";
import { parseExcel } from "./excel";
import { cachedLoader } from "./cache";
import type { StockAnalysis } from "@/types/stock";
export const DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID || "1DRqwz7l0oyqI1aJyFrs_kMbwspfeuNQq";
export const DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}
const excelMime =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const sheetMime = "application/vnd.google-apps.spreadsheet";
const supported = (f: DriveFile) =>
  [excelMime, sheetMime, "application/vnd.ms-excel"].includes(f.mimeType) ||
  /\.(xlsx|xls)$/i.test(f.name);
export function parsePublicFolder(html: string): DriveFile[] {
  const match = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'((?:\\.|[^'])*)'/);
  if (!match)
    throw new Error(
      "อ่านโฟลเดอร์ Drive ไม่ได้ ตรวจสิทธิ์ Anyone with the link หรือกำหนด GOOGLE_DRIVE_API_KEY",
    );
  const decoded = match[1]
    .replace(/\\x([0-9a-f]{2})/gi, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/\\\//g, "/")
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
  const payload = JSON.parse(decoded);
  if (
    !Array.isArray(payload) ||
    (payload[0] != null && !Array.isArray(payload[0]))
  )
    throw new Error("รูปแบบรายการ Drive เปลี่ยน กรุณาใช้ Drive API key");
  // Public HTML only exposes the initial page. Never silently omit further pages.
  if (payload[1] != null)
    throw new Error(
      "โฟลเดอร์มีหลายหน้า กรุณากำหนด GOOGLE_DRIVE_API_KEY เพื่ออ่านครบ",
    );
  return (payload[0] ?? [])
    .map((row: unknown[]) => ({
      id: String(row[0]),
      name: String(row[2]),
      mimeType: String(row[3]),
    }))
    .filter(supported);
}
async function driveFetch(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Google Drive HTTP ${response.status}`);
  return response;
}
async function listFiles(): Promise<DriveFile[]> {
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  if (!key)
    return parsePublicFolder(await (await driveFetch(DRIVE_FOLDER_URL)).text());
  const files: DriveFile[] = [];
  let pageToken = "";
  do {
    const query = new URLSearchParams({
      key,
      q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false`,
      pageSize: "100",
      fields: "nextPageToken,files(id,name,mimeType)",
      ...(pageToken ? { pageToken } : {}),
    });
    const body = await (
      await driveFetch(`https://www.googleapis.com/drive/v3/files?${query}`)
    ).json();
    if (!Array.isArray(body.files))
      throw new Error("Drive returned an invalid file list");
    files.push(...body.files.filter(supported));
    pageToken = body.nextPageToken || "";
  } while (pageToken);
  return files;
}
async function download(file: DriveFile): Promise<Buffer> {
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  const url = key
    ? `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}${file.mimeType === sheetMime ? `/export?mimeType=${encodeURIComponent(excelMime)}` : "?alt=media"}&key=${encodeURIComponent(key)}`
    : file.mimeType === sheetMime
      ? `https://docs.google.com/spreadsheets/d/${encodeURIComponent(file.id)}/export?format=xlsx`
      : `https://drive.google.com/uc?export=download&id=${encodeURIComponent(file.id)}`;
  const response = await driveFetch(url);
  if (response.headers.get("content-type")?.includes("text/html"))
    throw new Error("ดาวน์โหลดไม่ได้: Drive ขอ login/ยืนยันสิทธิ์");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 20 * 1024 * 1024) throw new Error("ไฟล์เกินขนาด 20 MB");
  return bytes;
}
export const getDriveDataset = cachedLoader(async () => {
  const files = await listFiles();
  const rows: StockAnalysis[] = [],
    warnings: string[] = [];
  // Bounded batches avoid flooding Drive when more workbooks are added.
  for (let i = 0; i < files.length; i += 4) {
    const batch = await Promise.allSettled(
      files
        .slice(i, i + 4)
        .map(async (file) =>
          parseExcel(await download(file)).map((row) => ({
            ...row,
            sourceFile: file.name,
            sourceUrl: `https://drive.google.com/file/d/${file.id}/view`,
          })),
        ),
    );
    batch.forEach((result, index) => {
      if (result.status === "fulfilled") rows.push(...result.value);
      else
        warnings.push(
          `${files[i + index].name}: ${result.reason instanceof Error ? result.reason.message : "อ่านไฟล์ไม่สำเร็จ"}`,
        );
    });
  }
  const unique = new Map<string, StockAnalysis>();
  for (const row of rows) {
    const key = row.analysisId || `${row.ticker}|${row.date}|${row.time}`;
    if (unique.has(key)) warnings.push(`พบ snapshot ซ้ำ ${key}; ใช้รายการแรก`);
    else unique.set(key, row);
  }
  return {
    rows: [...unique.values()],
    files: files.map((f) => f.name),
    warnings,
  };
}, 60_000);
