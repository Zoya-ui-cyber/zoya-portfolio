// 共此刻：查询 Cloudflare 中转本月用量（只算收费的下行）。密钥只在服务器。
export const FREE = Number(process.env.KAIROS_TURN_FREE_GB || 1000) * 1e9;
export const STOP = 0.95; // 到这里就停发中转凭证，避免产生费用
const KEEP = 10 * 60_000;

let cached: { at: number; bytes: number; month: string } | null = null;

const day = (d: Date) => d.toISOString().slice(0, 10);

/** 某个自然月（UTC）从 1 号到 to 当天的用量，单位字节 */
async function query(from: string, to: string): Promise<number> {
  const accountId = process.env.KAIROS_CF_ACCOUNT?.trim();
  const token = process.env.KAIROS_CF_ANALYTICS_TOKEN?.trim();
  if (!accountId || !token) throw new Error("not configured");
  const r = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query:
        "query($a: string!, $f: Date!, $t: Date!) { viewer { accounts(filter: { accountTag: $a }) { callsTurnUsageAdaptiveGroups(limit: 10000, filter: { date_geq: $f, date_leq: $t }) { sum { egressBytes } } } } }",
      variables: { a: accountId, f: from, t: to },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!r.ok) throw new Error("cloudflare " + r.status);
  const d = await r.json();
  const accounts = d?.data?.viewer?.accounts;
  if (d?.errors?.length || !Array.isArray(accounts) || !accounts.length) throw new Error("cloudflare query failed");
  return accounts[0].callsTurnUsageAdaptiveGroups.reduce(
    (n: number, g: { sum: { egressBytes: number } }) => n + Number(g.sum.egressBytes || 0),
    0,
  );
}

export async function monthUsage(fresh = false) {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  if (!fresh && cached && cached.month === month && Date.now() - cached.at < KEEP) return cached;
  cached = { at: Date.now(), bytes: await query(month + "-01", day(now)), month };
  return cached;
}

/** 本月截至前天结束的用量，用来判断这一天里有没有跨过提醒线 */
export async function usageBefore() {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  const before = day(new Date(now.getTime() - 2 * 86400_000));
  return before < month + "-01" ? 0 : query(month + "-01", before);
}

/** 是否该停发：查不到用量时按上次结果，没有上次结果则放行 */
export async function overLimit() {
  if (!process.env.KAIROS_CF_ANALYTICS_TOKEN) return false;
  try {
    return (await monthUsage()).bytes >= FREE * STOP;
  } catch {
    const month = new Date().toISOString().slice(0, 7);
    return !!cached && cached.month === month && cached.bytes >= FREE * STOP;
  }
}

/** 用登录凭证问账号后端：kairos_can_online / kairos_is_admin */
export async function ask(fn: "kairos_can_online" | "kairos_is_admin", authorization: string | null) {
  const url = process.env.KAIROS_ACCOUNT_URL?.trim();
  const key = process.env.KAIROS_ACCOUNT_KEY?.trim();
  if (!url || !key || !authorization?.startsWith("Bearer ")) return false;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: key, Authorization: authorization, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    return r.ok && (await r.json()) === true;
  } catch {
    return false;
  }
}
