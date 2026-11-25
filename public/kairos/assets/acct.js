/* 账号：登录注册、房间云端保存、私人家具。没有配置 KAIROS_NET.account 时整套不启用 */
window.ACCT = (() => {
'use strict';
const cfg = window.KAIROS_NET?.account, on = !!cfg?.url, BUCKET = 'kairos-furniture', $ = id => document.getElementById(id);
const MAXW = 6.4, MAXH = 5.2, MINW = .15;   // 最大一个客厅
let sb = null, me = null, api = null, token = '';
const MSG = {
  invalid_credentials: '邮箱或密码不对', user_already_exists: '这个邮箱已经注册过，直接登录就好', email_exists: '这个邮箱已经注册过，直接登录就好', weak_password: '密码至少 8 位', email_not_confirmed: '还没确认邮箱，请先点邮件里的链接',
  email_address_invalid: '邮箱格式不对', validation_failed: '邮箱格式不对', over_email_send_rate_limit: '邮件发得太频繁，过一会儿再试', over_request_rate_limit: '操作太频繁，过一会儿再试', signup_disabled: '现在暂停注册', email_address_not_authorized: '邮件服务还没配置好', same_password: '新密码不能和旧密码一样',
  items_full: '家具库已经满了，先删掉不用的', space_full: '你的图片空间用完了，先删掉不用的家具', site_full: '网站空间暂时满了，请联系我们', file_too_big: '图片太大', bad_image: '这张图太扁或太窄，用不了', not_uploaded: '图片没有传完整，请重试', not_logged_in: '登录过期了，请重新登录', too_big: '房间里东西太多，最多 200 件',
};
const say = e => { const s = String(e?.code || '') + ' ' + (e?.message || ''); for (const k in MSG) if (s.includes(k)) return MSG[k]; return /fetch|network|Failed|Load failed/i.test(s) ? '网络连不上，请检查后重试' : '出错了，请稍后再试'; };
let libP = null;
const lib = () => window.supabase ? Promise.resolve() : libP ||= new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'assets/supabase.js?v=11252016'; s.onload = ok; s.onerror = () => { libP = null; no(Error('network')); }; document.head.append(s); });
async function rpc(f, a) { const { data, error } = await sb.rpc(f, a); if (error) throw error; return data; }
const src = path => `${cfg.url}/storage/v1/object/public/${BUCKET}/${path}`;
const maxW = (pw, ph) => Math.min(MAXW, MAXH * pw / ph), clampW = (w, pw, ph) => Math.max(Math.min(MINW, maxW(pw, ph)), Math.min(maxW(pw, ph), +w || 1));
const SLIDE = { to: (w, m) => Math.round(100 * Math.log(w / MINW) / Math.log(m / MINW)), from: (t, m) => MINW * (m / MINW) ** (t / 100) };
const meters = (w, pw, ph) => `宽 ${w.toFixed(1)} 米 · 高 ${(w * ph / pw).toFixed(1)} 米`;

/* ---------- 登录界面 ---------- */
let mode = 'in', recovering = false;
function paint(note) {
  const a = on && (!me || recovering); $('auth').hidden = !a; $('enter').hidden = a; $('acct').hidden = !on || !me || recovering; $('cardIntro').hidden = false;
  if (a) {
    if (recovering) mode = 'new';
    const T = { in: ['登录', '还没有账号？注册', '忘记密码'], up: ['注册', '已有账号？登录', ''], reset: ['发送重置邮件', '返回登录', ''], new: ['保存新密码', '', ''] }[mode];
    $('auGo').textContent = T[0]; $('auSwap').textContent = T[1]; $('auSwap').hidden = !T[1]; $('auForgot').textContent = T[2]; $('auForgot').hidden = !T[2];
    $('auBrowse').hidden = mode === 'new' || mode === 'reset'; $('auMailBox').hidden = mode === 'new'; $('auPassBox').hidden = mode === 'reset'; $('auPass').autocomplete = mode === 'in' ? 'current-password' : 'new-password'; $('auPassL').textContent = mode === 'in' ? '密码' : mode === 'new' ? '新密码（至少 8 位）' : '密码（至少 8 位）';
    $('auMail').required = mode !== 'new'; $('auPass').required = mode !== 'reset';
  } else if (me) { $('acMail').textContent = me.email || ''; $('acRole').textContent = me.role === 'pro' ? '高级账号' : '普通账号'; $('acAdmin').hidden = !me.is_admin; $('acRole').classList.toggle('pro', me.role === 'pro'); }
  $('auMsg').textContent = note || ''; api?.homeNote();
}
async function submit(e) {
  e.preventDefault(); const email = $('auMail').value.trim(), password = $('auPass').value; $('auGo').disabled = true; $('auMsg').textContent = '';
  try {
    await ready();
    if (mode !== 'in' && mode !== 'reset' && password.length < 8) return paint('密码至少 8 位');
    const back = location.origin + location.pathname + location.search;
    if (mode === 'reset') { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: back }); if (error) throw error; mode = 'in'; return paint('如果这个邮箱注册过，重置邮件已经发出'); }
    if (mode === 'new') { const { error } = await sb.auth.updateUser({ password }); if (error) throw error; recovering = false; mode = 'in'; $('auPass').value = ''; return await enter(); }
    const { data, error } = mode === 'in' ? await sb.auth.signInWithPassword({ email, password }) : await sb.auth.signUp({ email, password, options: { emailRedirectTo: back } });
    if (error) throw error; $('auPass').value = '';
    if (!data.session) { mode = 'in'; return paint('注册好了。请打开邮箱点确认链接，再回来登录'); }
    token = data.session.access_token; await enter();
  } catch (x) { paint(say(x)); } finally { $('auGo').disabled = false; }
}
async function enter() { me = await rpc('kairos_me'); await api.login(me); paint(); }
async function out() {
  if (!await api.canLeave()) return;
  await sb.auth.signOut({ scope: 'local' }).catch(() => {}); me = null; token = ''; api.logout(); mode = 'in'; paint();
}
let readyP = null;
function ready() {
  return readyP ||= (async () => {
    await lib(); sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { storageKey: 'kairos-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' } });
    sb.auth.onAuthStateChange((ev, s) => {
      token = s?.access_token || '';
      if (ev === 'PASSWORD_RECOVERY') { recovering = true; paint('请设置新密码'); }
      if (ev === 'SIGNED_OUT' && me) { me = null; api.logout(); mode = 'in'; paint('登录已失效，请重新登录'); }
    });
  })().catch(e => { readyP = null; throw e; });
}
async function init(a) {
  api = a; if (!on) return;
  $('auth').onsubmit = submit; $('auSwap').onclick = () => { mode = mode === 'in' ? 'up' : 'in'; paint(); }; $('auForgot').onclick = () => { mode = 'reset'; paint(); }; $('acOut').onclick = out; $('auBrowse').onclick = () => api.browse();
  paint('正在检查登录…'); $('auGo').disabled = true;
  try { await ready(); const { data } = await sb.auth.getSession(); if (data.session) { token = data.session.access_token; if (!recovering) await enter(); } paint(recovering ? '请设置新密码' : ''); } catch (e) { paint(say(e)); }
  $('auGo').disabled = false;
}

/* ---------- 上传 ---------- */
const png = b => [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v);
async function shrink(file) {
  if (file.size > 10 * 1048576) throw '原图不能超过 10 MB';
  const buf = await file.arrayBuffer(), b = new Uint8Array(buf); if (b.length < 33 || !png(b)) throw '只能上传 PNG 图片';
  const dv = new DataView(buf), iw = dv.getUint32(16), ih = dv.getUint32(20); if (!iw || !ih || iw > 8000 || ih > 8000 || iw * ih > 4e7) throw '图片尺寸太大，长边请控制在 8000 像素以内';
  let bm; try { bm = await createImageBitmap(new Blob([buf], { type: 'image/png' })); } catch { throw '这张图片打不开，可能已经损坏'; }
  const k = Math.min(1, 2048 / Math.max(iw, ih)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(iw * k)); c.height = Math.max(1, Math.round(ih * k));
  const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingQuality = 'high'; g.drawImage(bm, 0, 0, c.width, c.height); bm.close();
  const d = g.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1, clear = 0;
  for (let y = 0, i = 3; y < c.height; y++) for (let x = 0; x < c.width; x++, i += 4) { if (d[i] < 250) clear++; if (d[i] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  if (x1 < 0) throw '这张图是全透明的';
  const w = x1 - x0 + 1, h = y1 - y0 + 1; if (w > h * 20 || h > w * 20) throw MSG.bad_image;
  let s = Math.min(1, 1024 / Math.max(w, h)), blob;
  for (let i = 0; i < 8; i++, s *= .8) {
    const o = document.createElement('canvas'); o.width = Math.max(1, Math.round(w * s)); o.height = Math.max(1, Math.round(h * s)); const q = o.getContext('2d'); q.imageSmoothingQuality = 'high'; q.drawImage(c, x0, y0, w, h, 0, 0, o.width, o.height);
    blob = await new Promise(r => o.toBlob(r, 'image/webp', .9)); if (blob?.type !== 'image/webp') blob = await new Promise(r => o.toBlob(r, 'image/png'));
    if (blob && blob.size <= me.limits.file) return { blob, pw: o.width, ph: o.height, solid: clear / (c.width * c.height) < .01, trimmed: w * h < c.width * c.height * .9 };
  }
  throw MSG.file_too_big;
}
const U = { img: null, w: 1, layer: 'object', edit: null, busy: false };
const PRE = [['杯子', .28], ['椅子', .5], ['沙发', 1.94], ['地毯', 2.26]];
function stage() {
  const i = U.img, box = $('upStage'), el = $('upItem'); if (!i) return; const k = box.clientWidth / 6.6, h = U.w * i.ph / i.pw, floor = .25, mid = U.layer === 'wall' ? 3.2 : U.layer === 'tabletop' ? 1.05 : U.layer === 'floor' ? Math.max(0, 1.6 - h / 2) : .5;
  el.style.width = U.w * k + 'px'; el.style.height = h * k + 'px'; el.style.left = Math.max(.1, Math.min(6.5 - U.w, 4.1 - U.w / 2)) * k + 'px'; el.style.bottom = Math.min(mid + floor, Math.max(.02, 5.5 - h)) * k + 'px'; el.style.zIndex = U.layer === 'floor' ? 1 : 3;
  const m = maxW(i.pw, i.ph); $('upSize').value = SLIDE.to(U.w, m); $('upText').textContent = meters(U.w, i.pw, i.ph) + (U.w >= m - .005 ? '（已到最大：一个客厅）' : '');
  [...$('upPre').children].forEach(b => b.setAttribute('aria-pressed', Math.abs(+b.dataset.w - U.w) < .01)); [...$('upLayer').children].forEach(b => b.setAttribute('aria-pressed', b.dataset.l === U.layer));
}
function setW(w) { U.w = clampW(w, U.img.pw, U.img.ph); stage(); }
function form(f) {
  $('upDrop').hidden = true; $('upForm').hidden = false; $('upOk').hidden = false; $('upItem').querySelector('img').src = U.img.url; $('upName').value = f.name; $('upWarn').textContent = f.warn || ''; $('upAgain').hidden = !!U.edit;
  $('upPre').replaceChildren(...[...PRE.filter(([, w]) => w < maxW(U.img.pw, U.img.ph)), ['最大', maxW(U.img.pw, U.img.ph)]].map(([t, w]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = t; b.dataset.w = w; b.onclick = () => setW(w); return b; }));
  requestAnimationFrame(() => setW(f.w));
}
function reset() { if (U.img?.own) URL.revokeObjectURL(U.img.url); U.img = null; U.edit = null; U.layer = 'object'; $('upDrop').hidden = false; $('upForm').hidden = true; $('upOk').hidden = true; $('upErr').textContent = ''; $('upFile').value = ''; }
async function take(file) {
  if (!file || U.busy) return; U.busy = true; $('upErr').textContent = '正在处理图片…';
  try {
    const r = await shrink(file); reset(); U.img = { ...r, url: URL.createObjectURL(r.blob), own: true };
    form({ name: file.name.replace(/\.[^.]*$/, '').slice(0, 16), w: Math.min(1, maxW(r.pw, r.ph)), warn: r.solid ? '这张图的背景不透明，放进房间会是一个方块。想要家具形状，请先去掉背景再传。' : r.trimmed ? '已自动裁掉四周的透明空白。' : '' });
  } catch (e) { $('upErr').textContent = typeof e === 'string' ? e : '图片处理失败，换一张试试'; }
  U.busy = false;
}
function left() { const n = me.furniture.length, l = me.limits; return n >= l.items ? MSG.items_full : ''; }
function openUp() { if (left()) return api.toast(`${MSG.items_full}（${me.furniture.length}/${me.limits.items}）`); reset(); $('upT').textContent = '上传家具'; $('upOk').textContent = '放进我的家具'; $('up').showModal(); }
function openEdit(f) { reset(); U.edit = f; U.img = { pw: f.px_w, ph: f.px_h, url: src(f.path) }; U.layer = f.layer; $('upT').textContent = '修改家具'; $('upOk').textContent = '保存'; $('up').showModal(); form({ name: f.name, w: +f.w }); }
async function confirmUp() {
  if (U.busy || !U.img) return; U.busy = true; $('upOk').disabled = true; $('upErr').textContent = U.edit ? '正在保存…' : '正在上传…';
  try {
    const name = $('upName').value.trim(), i = U.img; let f;
    if (U.edit) { f = await rpc('kairos_update', { p_id: U.edit.id, p_name: name, p_layer: U.layer, p_w: U.w }); me.furniture = me.furniture.map(x => x.id === f.id ? f : x); api.furniture(f, false); }
    else {
      const r = await rpc('kairos_reserve', { p_name: name, p_layer: U.layer, p_w: U.w, p_px_w: i.pw, p_px_h: i.ph, p_bytes: i.blob.size, p_ext: i.blob.type === 'image/webp' ? 'webp' : 'png' });
      try {
        const { error } = await sb.storage.from(BUCKET).upload(r.path, await i.blob.arrayBuffer(), { contentType: i.blob.type, cacheControl: '31536000' }); if (error) throw error;
        f = await rpc('kairos_commit', { p_id: r.id });
      } catch (e) { await wipe(r).catch(() => {}); throw e; }
      me.furniture.push(f); api.furniture(f, true);
    }
    $('up').close();
  } catch (e) { $('upErr').textContent = say(e); }
  U.busy = false; $('upOk').disabled = false;
}
async function wipe(f) { const { error } = await sb.storage.from(BUCKET).remove([f.path]); if (error) throw error; await rpc('kairos_delete', { p_id: f.id }); }
async function remove(f) { await wipe(f); me.furniture = me.furniture.filter(x => x.id !== f.id); }

if (on) {
  $('upFile').onchange = () => take($('upFile').files[0]); $('upPick').onclick = $('upAgain').onclick = () => $('upFile').click(); $('upNo').onclick = () => !U.busy && $('up').close(); $('up').onclose = reset; $('up').oncancel = e => U.busy && e.preventDefault();
  $('up').ondragover = e => { e.preventDefault(); $('upDrop').classList.add('over'); }; $('up').ondragleave = () => $('upDrop').classList.remove('over'); $('up').ondrop = e => { e.preventDefault(); $('upDrop').classList.remove('over'); if (!U.edit) take(e.dataTransfer.files[0]); };
  addEventListener('paste', e => { if ($('up').open && !U.edit) { const f = [...(e.clipboardData?.files || [])][0]; if (f) take(f); } });
  $('upOk').onclick = confirmUp; $('upSize').oninput = () => U.img && setW(SLIDE.from(+$('upSize').value, maxW(U.img.pw, U.img.ph)));
  [...$('upLayer').children].forEach(b => b.onclick = () => { U.layer = b.dataset.l; stage(); }); $('upName').onkeydown = e => { if (e.key === 'Enter') e.preventDefault(); };
  let d = null; const h = $('upItem').querySelector('i');
  h.onpointerdown = e => { d = { x: e.clientX, w: U.w }; h.setPointerCapture(e.pointerId); e.preventDefault(); }; h.onpointermove = e => d && setW(d.w + (e.clientX - d.x) * 2 / ($('upStage').clientWidth / 6.6)); h.onpointerup = h.onpointercancel = () => d = null;
}
return { on, init, rpc, src, maxW, clampW, SLIDE, meters, openUp, openEdit, remove, say, get me() { return me; }, get token() { return token; }, get client() { return sb; }, pro: () => !on || me?.role === 'pro', guest: () => on && !me,
  refresh: async () => { const m = await rpc('kairos_me'); me.role = m.role; me.limits = m.limits; me.furniture = m.furniture; return m; }, profile: (n, f) => on && me && rpc('kairos_profile', { p_nick: n, p_face: f }).catch(() => {}) };
})();
