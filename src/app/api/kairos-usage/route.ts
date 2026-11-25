import { FREE, STOP, ask, monthUsage, usageBefore } from "@/lib/kairos-usage";

// 管理页查看用量；每天由 Vercel 定时调用一次，跨过提醒线就发邮件。
const LINES = [0.5, 0.8, 0.95];
const gb = (n: number) => (n / 1e9).toFixed(1);

export async function GET(request: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  const cron = !!secret && auth === `Bearer ${secret}`;
  if (!cron && !(await ask("kairos_is_admin", auth))) return json({ error: "forbidden" }, 403);

  let now;
  try {
    now = await monthUsage(cron);
  } catch (e) {
    console.error("kairos-usage", String(e));
    if (cron) await mail("共此刻：查不到中转用量", "今天没能从 Cloudflare 查到中转用量，请检查 KAIROS_CF_ACCOUNT 和 KAIROS_CF_ANALYTICS_TOKEN。");
    return json({ ok: false, error: "unavailable" }, 502);
  }
  const body = { ok: true, bytes: now.bytes, limit: FREE, stopAt: FREE * STOP, month: now.month };
  if (!cron) return json(body);

  // 跨过新的一条线才发；超过 95% 每天都发
  let sent = null;
  const used = now.bytes / FREE;
  const line = LINES.filter((x) => used >= x).pop();
  if (line) {
    let before = 0;
    try {
      before = (await usageBefore()) / FREE;
    } catch {}
    if (line >= STOP || before < line)
      sent = await mail(
        `共此刻：中转用量到 ${Math.round(used * 100)}%`,
        `${now.month} 已用 ${gb(now.bytes)} GB，共 ${gb(FREE)} GB。` +
          (line >= STOP ? "已自动停发中转，直连仍可用，下个月自动恢复。" : `到 ${STOP * 100}% 会自动停发中转，避免产生费用。`),
      );
  }
  return json({ ...body, sent });
}

async function mail(subject: string, text: string) {
  const key = process.env.KAIROS_RESEND_KEY?.trim();
  const to = process.env.KAIROS_ALERT_TO?.trim();
  const from = process.env.KAIROS_ALERT_FROM?.trim();
  if (!key || !to || !from) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) console.error("kairos-usage mail", r.status);
    return r.ok;
  } catch {
    return false;
  }
}
