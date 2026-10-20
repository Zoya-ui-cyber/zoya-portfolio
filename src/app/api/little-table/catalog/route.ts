import { authorizeCatalog } from "@/server/little-table/catalog-access";
import catalog from "@/server/little-table/catalog.json";
import settings from "@/server/little-table/settings.json";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const access = await authorizeCatalog(request, settings);
  const headers = { "Cache-Control": "private, no-store", "Vary": "Authorization" };
  if (access.status !== 200) {
    return Response.json({ error: access.error }, { status: access.status, headers });
  }
  return Response.json(catalog, { headers });
}
