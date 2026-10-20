import catalog from "@/server/little-table/catalog.json";
export const runtime = "nodejs";
// Default recipes are public; personal data remains protected by Supabase RLS.
export async function GET() {
  return Response.json(catalog, { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } });
}
