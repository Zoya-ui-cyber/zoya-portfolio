import { NextResponse } from "next/server";

// 共此刻：签发 Cloudflare TURN 临时凭证。密钥只放在服务器环境变量里。
const TTL = 4 * 3600;
const LIMIT = 60;
const WINDOW = 10 * 60_000;
const hits = new Map<string, { n: number; end: number }>();

type Ice = { urls: string | string[]; username?: string; credential?: string };

export async function POST(request: Request) {
  const json = (body: unknown, status = 200) =>
    NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

  const id = process.env.KAIROS_TURN_ID?.trim();
  const token = process.env.KAIROS_TURN_TOKEN?.trim();
  if (!id || !token) return json({ error: "off" }, 503);

  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    sameOrigin = !!origin && new URL(origin).host === request.headers.get("host");
  } catch {}
  if (!sameOrigin) return json({ error: "forbidden" }, 403);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "?";
  const now = Date.now();
  if (hits.size > 2000) hits.clear();
  const hit = hits.get(ip);
  if (hit && hit.end > now) {
    if (++hit.n > LIMIT) return json({ error: "slow down" }, 429);
  } else hits.set(ip, { n: 1, end: now + WINDOW });

  try {
    const r = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(id)}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ttl: TTL }),
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!r.ok) {
      console.error("kairos-turn", r.status);
      return json({ error: "upstream" }, 502);
    }
    const data = (await r.json()) as { iceServers: Ice[] };
    // 浏览器会拦 53 端口，去掉以免等待超时
    const iceServers = data.iceServers
      .filter((s) => s.credential)
      .map((s) => ({ ...s, urls: [s.urls].flat().filter((u) => !/:53(\?|$)/.test(u)) }));
    return json({ iceServers, ttl: TTL });
  } catch {
    return json({ error: "upstream" }, 502);
  }
}
