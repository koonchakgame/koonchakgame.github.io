import { getLiveDashboardData } from "@/lib/live";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(await getLiveDashboardData(), {
    headers: { "Cache-Control": "no-store" },
  });
}
