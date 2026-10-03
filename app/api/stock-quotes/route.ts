import { getStockQuotes } from "@/lib/stock-quotes";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({ quotes: await getStockQuotes() }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "โหลดราคาหุ้นไม่สำเร็จ" }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
