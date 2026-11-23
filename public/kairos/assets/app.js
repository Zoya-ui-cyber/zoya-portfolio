(() => {
'use strict';
const K = window.KAIROS, $ = id => document.getElementById(id), NS = 'http://www.w3.org/2000/svg';
const S = 100, MX = .8, MY = 2.3, KEY = 'kairos-room-v1', NICK = 'kairos-nick';
const FLOORS = { plank: '浅木板', plankV: '竖木板', deck: '深木板', terrazzo: '水磨石', checker: '绿格', tile: '橙砖', dots: '十字花', stripe: '绿条纹', cream: '奶油' };
const DEF = Object.fromEntries(K.items.map(i => [i.id, i]));
const copy = o => JSON.parse(JSON.stringify(o));
const load = k => { try { return localStorage.getItem(k); } catch { return null; } };
const store = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };
const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

/* ---------- 房间数据 ---------- */
let seq = Date.now();
const uid = () => 'u' + (seq++).toString(36);
const fresh = () => ({ items: copy(K.layout), floors: {}, walls: {} });
function initial() {
  try { const s = JSON.parse(load(KEY)); if (s && Array.isArray(s.items)) { s.items = s.items.filter(o => DEF[o.id]); s.floors ||= {}; s.walls ||= {}; return s; } } catch {}
  const base = fresh();
  // 首次进入：沿用小样页里拖过的布置
  try {
    const p = JSON.parse(load('kairos-sample-v5'));
    if (p && Array.isArray(p.items)) {
      const pool = K.layout.filter(o => o.url), used = new Set();
      const items = p.items.filter(o => DEF[o.id]).map(o => {
        const n = { uid: uid(), id: o.id, x: o.x, y: o.y, f: o.f };
        const b = pool.find(q => q.id === o.id && !used.has(q.id));
        if (b) { used.add(b.id); Object.assign(n, { name: b.name, url: b.url, open: b.open }); }
        return n;
      });
      return { items, floors: p.floors || {}, walls: p.walls || {} };
    }
  } catch {}
  return base;
}
let room = initial();
// 旧存档补上音乐角音响的默认链接（只补一次）
if (!room.v) { room.v = 2; if (!room.items.some(o => o.id === 'speaker' && o.url)) { const q = K.layout.find(o => o.id === 'speaker' && o.url), n = room.items.filter(o => o.id === 'speaker').sort((a, b) => Math.hypot(a.x - q.x, a.y - q.y) - Math.hypot(b.x - q.x, b.y - q.y))[0]; if (n) Object.assign(n, { name: q.name, url: q.url, open: q.open }); } }
room.v = 2;
if (!room.r) {   // 2026-11-23 默认绑定更新，只改没动过的
  room.r = 1;
  room.items.forEach(o => {
    if (o.url === 'content/video.html') o.url = 'https://www.bilibili.com/';
    if (o.url === 'content/design.html') { delete o.url; delete o.name; }
    if (o.id === 'coatrack' && !o.url) Object.assign(o, { name: '衣帽架', url: 'https://www.asos.com/', open: 'embed' });
  });
}
// 当前显示（编辑时是草稿）
let saved = copy(room), hist = [], sel = null, view = 'home';

/* ---------- 场景 ---------- */
const wrap = $('stageWrap');
wrap.insertAdjacentHTML('afterbegin', K.svg);
const svg = wrap.querySelector('svg'); svg.id = 'stage';
const defs = svg.querySelector('defs');
K.low.forEach((r, i) => {
  const c = defs.appendChild(document.createElementNS(NS, 'clipPath')); c.id = 'cl' + i;
  const q = c.appendChild(document.createElementNS(NS, 'rect'));
  q.setAttribute('x', (r[0] + MX) * S - 3); q.setAttribute('y', (r[1] - K.lo + MY) * S - 3);
  q.setAttribute('width', (r[2] - r[0]) * S + 6); q.setAttribute('height', (r[3] - r[1] + K.lo) * S + 6);
});
const layer = svg.appendChild(document.createElementNS(NS, 'g'));
const floorEl = r => svg.querySelector('#floor-' + r), wallEl = i => svg.querySelector('#wall-' + i).firstElementChild;
const baseFill = {};
Object.keys(K.rooms).forEach(r => baseFill['f' + r] = floorEl(r).getAttribute('fill'));
[0, 1, 2].forEach(i => baseFill['w' + i] = wallEl(i).getAttribute('fill'));
const skin = f => f.slice(7, -1);
const size = o => { const d = DEF[o.id], w = d.w * S; return { w, h: w * d.px[1] / d.px[0] }; };
const title = o => o.name || DEF[o.id].name;
const key = o => o.y + (DEF[o.id].layer === 'tabletop' ? 1 : 0) - (DEF[o.id].layer === 'wall' ? 50 : 0) - (DEF[o.id].layer === 'floor' ? 90 : 0);

function use(href, clip) {
  const u = document.createElementNS(NS, 'use'); u.setAttribute('href', href);
  if (clip) u.setAttribute('clip-path', `url(#${clip})`);
  u.style.pointerEvents = 'none'; return u;
}
function draw() {
  Object.keys(K.rooms).forEach(r => floorEl(r).setAttribute('fill', room.floors[r] ? `url(#p-${room.floors[r]})` : baseFill['f' + r]));
  [0, 1, 2].forEach(i => wallEl(i).setAttribute('fill', room.walls[i] ? `url(#p-${room.walls[i]})` : baseFill['w' + i]));
  const list = room.items.map(o => ({ k: key(o), o }));
  K.low.forEach((r, i) => list.push({ k: r[3], el: use('#lowwalls', 'cl' + i) }));
  list.push({ k: 8.2, el: use('#rails') });
  list.sort((a, b) => a.k - b.k);
  layer.replaceChildren(...list.map(({ o, el }) => {
    if (el) return el;
    const e = document.createElementNS(NS, 'image'), { w, h } = size(o);
    e.setAttribute('href', 'assets/furniture/' + DEF[o.id].file); e.setAttribute('width', w); e.setAttribute('height', h);
    e.setAttribute('transform', `translate(${(o.x + MX) * S} ${(o.y + MY) * S}) scale(${o.f || 1} 1) translate(${-w / 2} ${-h})`);
    e.setAttribute('class', 'it' + (o.url ? ' bound' : '') + (o.uid === sel ? ' sel' : ''));
    e.dataset.u = o.uid; return e;
  }));
  drawTags();
}
const byId = u => room.items.find(o => o.uid === u);

/* ---------- 视角：最远整个户型，最近一个玄关 ---------- */
const FULL = svg.viewBox.baseVal, FW = FULL.width, FH = FULL.height, ZMAX = FH / 360, V = { x: 0, y: 0, z: 1 };
function look() {
  V.z = Math.min(ZMAX, Math.max(1, V.z)); const w = FW / V.z, h = FH / V.z;
  V.x = Math.min(FW - w, Math.max(0, V.x)); V.y = Math.min(FH - h, Math.max(0, V.y));
  svg.setAttribute('viewBox', `${V.x} ${V.y} ${w} ${h}`);
  $('zv').textContent = Math.round(V.z * 100) + '%'; $('zo').disabled = V.z <= 1.001; $('zi').disabled = V.z >= ZMAX - .001;
  place();
}
function zoomAt(f, px, py) { const z = Math.min(ZMAX, Math.max(1, V.z * f)), r = V.z / z; V.x = px - (px - V.x) * r; V.y = py - (py - V.y) * r; V.z = z; look(); }
const pt = e => new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
const mid = f => zoomAt(f, V.x + FW / V.z / 2, V.y + FH / V.z / 2);
wrap.addEventListener('wheel', e => { if (view === 'home') return; e.preventDefault(); const p = pt(e); zoomAt(Math.exp(-e.deltaY * .0015), p.x, p.y); }, { passive: false });
$('zi').onclick = () => mid(1.3); $('zo').onclick = () => mid(1 / 1.3); $('zf').onclick = () => { V.z = 1; look(); };
new ResizeObserver(() => look()).observe(wrap);

/* 物件在屏幕上的矩形 */
function rectOf(o, part) {
  const { w, h } = size(o); let x0 = (o.x + MX) * S - w / 2, y0 = (o.y + MY) * S - h, x1 = x0 + w, y1 = y0 + h;
  if (part === 'screen' && o.id === 'tv') { [x0, x1, y0, y1] = [x0 + w * .25 / 1.8 + 4, x0 + w * 1.55 / 1.8 - 4, y0 + h * .07 / 1.26, y0 + h * .66 / 1.26]; }
  const m = svg.getScreenCTM(), a = new DOMPoint(x0, y0).matrixTransform(m), b = new DOMPoint(x1, y1).matrixTransform(m);
  return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
}

/* ---------- 标签 ---------- */
function drawTags() {
  $('tags').replaceChildren(...room.items.filter(o => o.url).map(o => {
    const b = mk('button', 'tag', title(o)); b.dataset.u = o.uid;
    b.setAttribute('aria-label', '打开' + title(o));
    if (view === 'edit') b.tabIndex = -1;
    b.onclick = () => openItem(o.uid);
    b.onmouseenter = () => hot(o.uid, true); b.onmouseleave = () => hot(o.uid, false);
    return b;
  }));
  place();
}
function hot(u, on) {
  layer.querySelector(`[data-u="${u}"]`)?.classList.toggle('hot', on);
  $('tags').querySelector(`[data-u="${u}"]`)?.classList.toggle('hot', on);
}
function place() {
  const b = wrap.getBoundingClientRect();
  $('tags').querySelectorAll('.tag').forEach(t => {
    const o = byId(t.dataset.u); if (!o) return; const r = rectOf(o), w = wins.get(o.uid);
    t.style.left = r.x - b.left + r.w / 2 + 'px'; t.style.top = r.y - b.top - 7 + 'px';
    t.hidden = !!w && w.mode === 'mini' && view === 'room';
  });
  wins.forEach(w => w.mode === 'mini' && fitMini(w));
  window.ME?.place();
}

/* ---------- 网页窗口：展开 / 家具模式 / 隐藏 ---------- */
const wins = new Map(); let ztop = 1, cur = null;
/* 常见网站的普通链接换成官方允许嵌入的播放器地址 */
function embedOf(url) {
  let u; try { u = new URL(url); } catch { return null; }
  const h = u.hostname.replace(/^www\./, ''), p = u.pathname; let m;
  if (h === 'open.spotify.com' && (m = p.match(/^\/(?:intl-[\w-]+\/)?(?:embed\/)?(playlist|album|track|artist|show|episode)\/(\w+)/))) return { src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, by: 'Spotify' };
  if ((m = (h === 'youtu.be' && p.match(/^\/([\w-]{11})/)) || (/^(m\.)?youtube\.com$/.test(h) && (p === '/watch' ? [0, u.searchParams.get('v')] : p.match(/^\/(?:shorts|embed)\/([\w-]{11})/)))) && m[1]) return { src: 'https://www.youtube.com/embed/' + encodeURIComponent(m[1]), by: 'YouTube' };
  if (/(^|\.)bilibili\.com$/.test(h) && (m = p.match(/\/video\/(BV\w+)/))) return { src: `https://player.bilibili.com/player.html?bvid=${m[1]}&autoplay=0`, by: '哔哩哔哩' };
  if (h === 'music.163.com' && (m = (p + u.hash).match(/(playlist|album|song)\?id=(\d+)/) || (u.search && (p + u.search).match(/(playlist|album|song)\?id=(\d+)/)))) return { src: `https://music.163.com/outchain/player?type=${{ playlist: 0, album: 1, song: 2 }[m[1]]}&id=${m[2]}&auto=0&height=430`, by: '网易云音乐' };
  return null;
}
const isLocal = u => /^content\/[\w.-]+\.html$/.test(u);
function normUrl(raw) {
  const s = raw.trim(); if (!s) return { url: '' };
  if (isLocal(s)) return { url: s };
  if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^https?:/i.test(s) && !/^[\w.-]+:\d+(\/|$)/.test(s)) return { err: '只支持 http 或 https 网页链接' };
  try {
    const u = new URL(/^https?:/i.test(s) ? s : 'https://' + s);
    if (!/^https?:$/.test(u.protocol) || !(u.hostname.includes('.') || u.hostname === 'localhost') || /\s/.test(s)) throw 0;
    return { url: u.href };
  } catch { return { err: '这个链接不完整，例如 example.com' }; }
}
const showUrl = u => isLocal(u) ? '本地演示内容' : u.replace(/^https?:\/\//, '').replace(/\/$/, '');
function openItem(u) {
  if (view !== 'room') return;
  const o = byId(u); if (!o || !o.url) return;
  if (o.open === 'tab') { window.open(o.url, '_blank', 'noopener'); return; }
  const w = wins.get(u); if (w) { setMode(w, 'full'); return; }
  const el = mk('section', 'win full'), hd = mk('header'), body = mk('div', 'body'), fr = mk('iframe');
  el.setAttribute('aria-label', title(o));
  const B = (t, f) => { const b = mk('button', 'btn', t); b.onclick = e => { e.stopPropagation(); f(); }; return b; };
  const n = { u, url: o.url, el, fr, mode: 'full', wide: /^https:\/\/www\.bilibili\.com\/(?!video)/.test(o.url) ? 1100 : 0 };
  new ResizeObserver(() => fitWide(n)).observe(body);
  hd.append(mk('b', '', title(o)), mk('span', 'u', showUrl(o.url)), B('家具模式', () => setMode(n, 'mini')), B('隐藏', () => setMode(n, 'hidden')), B('关闭', () => closeWin(n)));
  if (!isLocal(o.url)) fr.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';
  const em = embedOf(o.url);
  if (em) { fr.allow = 'autoplay; encrypted-media; fullscreen; clipboard-write'; fr.sandbox.add('allow-presentation'); fr.referrerPolicy = 'strict-origin-when-cross-origin'; } else fr.referrerPolicy = 'no-referrer';
  fr.title = title(o); fr.src = em ? em.src : o.url; body.append(fr);
  const mc = mk('div', 'mc'); mc.append(B('放大', () => setMode(n, 'full')), B('隐藏', () => setMode(n, 'hidden')));
  mc.onclick = () => setMode(n, 'full'); body.append(mc); el.append(hd, body);
  if (!isLocal(o.url)) {
    const tip = mk('div', 'tip'), a = mk('a', '', '在新标签页打开'); a.href = o.url; a.target = '_blank'; a.rel = 'noopener';
    tip.append(em ? `${em.by} 官方播放器` : '页面空白？这个网站可能不允许嵌入。', a); el.append(tip);
  }
  n.box = spot(u, em?.by, n.wide);
  const b = wrap.getBoundingClientRect();
  el.addEventListener('pointerdown', () => focusWin(n));
  let d = null;
  hd.onpointerdown = e => { if (e.target.closest('button')) return; d = { x: e.clientX - el.offsetLeft, y: e.clientY - el.offsetTop }; hd.setPointerCapture(e.pointerId); document.body.classList.add('dragging'); };
  hd.onpointermove = e => { if (!d) return; n.box.x = Math.min(innerWidth - 140, Math.max(140 - el.offsetWidth, e.clientX - d.x)); n.box.y = Math.min(innerHeight - 50, Math.max(b.top, e.clientY - d.y)); el.style.left = n.box.x + 'px'; el.style.top = n.box.y + 'px'; };
  hd.onpointerup = hd.onpointercancel = () => { d = null; document.body.classList.remove('dragging'); };
  $('wins').append(el); wins.set(u, n); setMode(n, 'full');
}
/* 找一个最少遮挡可点家具、标签和已开窗口的位置 */
function spot(u, by, wide) {
  const b = wrap.getBoundingClientRect(), W = by === 'Spotify' ? 420 : Math.min(wide ? 720 : 560, b.width * (wide ? .5 : .42)), H = by === 'Spotify' ? Math.min(434, b.height - 80) : Math.min(W * .74, b.height - 80);
  const keep = room.items.filter(o => o.url).map(o => { const r = rectOf(o); return { x: r.x - 8, y: r.y - 46, w: r.w + 16, h: r.h + 54, k: o.uid === u ? 6 : 4 }; });
  wins.forEach(w => w.mode === 'full' && keep.push({ x: w.el.offsetLeft, y: w.el.offsetTop, w: w.el.offsetWidth, h: w.el.offsetHeight, k: .8 }));
  keep.push({ x: b.right - 270, y: b.bottom - 66, w: 270, h: 66, k: 3 }, { x: b.left, y: b.bottom - 62, w: 420, h: 62, k: 2 });
  const o = byId(u), r = rectOf(o), cx = r.x + r.w / 2, cy = r.y + r.h / 2; let best = null;
  for (let i = 0; i <= 16; i++) for (let k = 0; k <= 10; k++) {
    const x = b.left + 16 + (b.width - W - 32) * i / 16, y = b.top + 14 + (b.height - H - 28) * k / 10;
    const hit = keep.reduce((t, q) => t + q.k * Math.max(0, Math.min(x + W, q.x + q.w) - Math.max(x, q.x)) * Math.max(0, Math.min(y + H, q.y + q.h) - Math.max(y, q.y)), 0);
    const score = hit + Math.hypot(x + W / 2 - cx, y + H / 2 - cy) * 12;
    if (!best || score < best.score) best = { score, x, y };
  }
  return { x: best.x, y: best.y, w: W, h: H };
}
function setMode(n, m) {
  if (n.mode === 'full' && m !== 'full' && n.el.offsetWidth) { n.box.w = n.el.offsetWidth; n.box.h = n.el.offsetHeight; }
  n.mode = m; n.el.className = 'win ' + (m === 'hidden' ? 'gone' : m);
  if (m === 'full') {
    const b = wrap.getBoundingClientRect(), q = n.box;
    q.w = Math.min(q.w, innerWidth - 16); q.h = Math.min(q.h, b.height - 8);
    q.x = Math.min(innerWidth - Math.min(q.w, 200), Math.max(q.x, 8 - q.w + 200)); q.y = Math.min(innerHeight - 60, Math.max(b.top, q.y));
    Object.assign(n.el.style, { left: q.x + 'px', top: q.y + 'px', width: q.w + 'px', height: q.h + 'px' });
    n.fr.style.cssText = ''; fitWide(n); focusWin(n);
  } else if (cur === n) cur = null;
  if (isLocal(n.url)) try { n.fr.contentWindow.postMessage({ kairos: 'mode', mode: m }, '*'); } catch {}
  dock(); place();
}
/* 只有桌面版的网站：按桌面宽度排版再整体缩小，避免横向滚动 */
function fitWide(n) {
  if (!n.wide || n.mode !== 'full') return; const w = n.fr.parentNode.clientWidth, h = n.fr.parentNode.clientHeight; if (!w) return;
  const k = Math.min(1, w / n.wide); n.fr.style.cssText = `width:${w / k}px;height:${h / k}px;transform:scale(${k})`;
}
function fitMini(n) {
  const o = byId(n.u); if (!o) return; let r;
  if (o.id === 'tv') r = rectOf(o, 'screen');
  else { const q = rectOf(o), w = Math.max(110, Math.min(260, q.w * 1.1)), h = w * .6; r = { x: q.x + q.w / 2 - w / 2, y: Math.max(wrap.getBoundingClientRect().top + 4, q.y - h - 4), w, h }; }
  const bw = n.wide || 640, bh = bw * r.h / r.w;
  Object.assign(n.el.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
  n.fr.style.cssText = `width:${bw}px;height:${bh}px;transform:scale(${r.w / bw})`;
}
function focusWin(n) { n.el.style.zIndex = ++ztop; cur = n; dock(); }
function closeWin(n) { n.el.remove(); wins.delete(n.u); if (cur === n) cur = null; dock(); place(); }
function dock() {
  $('dock').replaceChildren(...[...wins.values()].map(n => {
    const o = byId(n.u), b = mk('button', 'btn' + (cur === n ? ' cur' : ''), (o ? title(o) : '') + ({ full: '', mini: ' · 家具模式', hidden: ' · 已隐藏' })[n.mode]);
    b.dataset.s = n.mode; b.onclick = () => setMode(n, 'full'); return b;
  }));
}

/* ---------- 指针：拖视角 / 点家具 / 编辑拖家具 ---------- */
let act = null;
svg.addEventListener('pointerdown', e => {
  if (view === 'home' || e.button) return;
  const t = e.target.closest?.('.it'), o = t && byId(t.dataset.u);
  if (view === 'edit' && o) {
    const p = pt(e); select(o.uid); act = { t: 'move', o, dx: o.x - p.x / S, dy: o.y - p.y / S, before: JSON.stringify(room), moved: false };
  } else act = { t: 'pan', x: e.clientX, y: e.clientY, vx: V.x, vy: V.y, u: o && o.uid, moved: false };
  svg.setPointerCapture(e.pointerId);
});
svg.addEventListener('pointermove', e => {
  if (!act) { const t = e.target.closest?.('.it.bound'); hoverU(view === 'room' && t ? t.dataset.u : null); return; }
  if (act.t === 'pan') {
    if (!act.moved && Math.hypot(e.clientX - act.x, e.clientY - act.y) < 5) return;
    act.moved = true; const k = svg.getScreenCTM().a; V.x = act.vx - (e.clientX - act.x) / k; V.y = act.vy - (e.clientY - act.y) / k; look();
  } else {
    const p = pt(e), x = p.x / S + act.dx, y = p.y / S + act.dy;
    if (!act.moved && Math.hypot(x - act.o.x, y - act.o.y) < .04) return;
    act.moved = true; act.o.x = Math.min(15, Math.max(-.6, x)); act.o.y = Math.min(8.7, Math.max(-1.6, y)); draw();
  }
});
const up = e => {
  const a = act; act = null; if (!a) return;
  if (a.t === 'pan' && !a.moved && e.type === 'pointerup') { if (view === 'edit') select(null); else if (a.u) openItem(a.u); else { const p = pt(e); ME.walkTo(p.x / S - MX, p.y / S - MY); } }
  if (a.t === 'move' && a.moved) { hist.push(a.before); state(); }
};
svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
let hv = null; function hoverU(u) { if (hv === u) return; if (hv) hot(hv, false); hv = u; if (u) hot(u, true); }
svg.addEventListener('pointerleave', () => hoverU(null));

/* ---------- 编辑 ---------- */
const dirty = () => JSON.stringify(room) !== JSON.stringify(saved);
function state() { const d = dirty(); $('dirty').textContent = d ? '有未保存的改动' : '已保存'; $('dirty').classList.toggle('on', d); $('undo').disabled = !hist.length; }
function change(f) { hist.push(JSON.stringify(room)); if (hist.length > 60) hist.shift(); f(); draw(); state(); }
function select(u) { sel = u; draw(); panel(); }
function panel() {
  const o = sel && byId(sel); $('pObj').hidden = !o; $('pRoom').hidden = !!o;
  if (o) {
    $('pImg').src = 'assets/furniture/' + DEF[o.id].file; $('pKind').textContent = DEF[o.id].name; $('pName').value = o.name || '';
    $('pName').placeholder = DEF[o.id].name; $('pUrl').value = o.url || ''; $('pOpen').value = o.open || 'embed'; $('pErr').textContent = ''; links();
  } else {
    swatch('rFloor', room.floors[$('rRoom').value] || skin(baseFill['f' + $('rRoom').value]), v => change(() => room.floors[$('rRoom').value] = v));
    swatch('rPaper', room.walls[$('rWall').value] || skin(baseFill['w' + $('rWall').value]), v => change(() => room.walls[$('rWall').value] = v));
  }
}
function links() { const o = byId(sel); $('pTest').disabled = $('pUnlink').disabled = !o?.url; }
function swatch(id, now, f) {
  $(id).replaceChildren(...Object.entries(FLOORS).map(([k, n]) => {
    const b = mk('button', k === now ? 'on' : ''); b.innerHTML = `<svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice"><rect width="90" height="60" fill="url(#p-${k})"/></svg>`;
    b.append(n); b.setAttribute('aria-pressed', k === now); b.onclick = () => { f(k); panel(); }; return b;
  }));
}
Object.entries(K.rooms).forEach(([k, n]) => $('rRoom').add(new Option(n, k)));
$('rRoom').value = 'media'; $('rWall').value = '1'; $('rRoom').onchange = $('rWall').onchange = panel;
$('pName').onchange = () => { const o = byId(sel); if (o) change(() => { const v = $('pName').value.trim(); if (v) o.name = v; else delete o.name; }); };
let badUrl = false;
$('pUrl').onchange = () => {
  const o = byId(sel); if (!o) return; const r = normUrl($('pUrl').value); $('pErr').textContent = r.err || ''; badUrl = !!r.err;
  if (!r.err && r.url !== (o.url || '')) { change(() => { if (r.url) { o.url = r.url; o.open ||= 'embed'; } else delete o.url; }); $('pUrl').value = r.url; }
  links();
};
$('pUrl').oninput = () => { $('pErr').textContent = ''; badUrl = false; };
[$('pUrl'), $('pName')].forEach(i => i.onkeydown = e => { if (e.key === 'Enter') i.blur(); });
$('pOpen').onchange = () => { const o = byId(sel); change(() => o.open = $('pOpen').value); };
$('pTest').onclick = () => { const o = byId(sel); if (o?.url) window.open(o.url, '_blank', 'noopener'); };
$('pUnlink').onclick = () => { const o = byId(sel); change(() => { delete o.url; }); panel(); };
$('pFlip').onclick = () => { const o = byId(sel); change(() => o.f = -(o.f || 1)); };
$('pCopy').onclick = () => { const o = byId(sel), n = { ...copy(o), uid: uid(), x: o.x + .4, y: o.y + .3 }; delete n.url; delete n.name; change(() => room.items.push(n)); select(n.uid); };
function del() { const u = sel; sel = null; change(() => room.items = room.items.filter(o => o.uid !== u)); panel(); }
$('pDel').onclick = del;
function lib() {
  const q = $('libQ').value.trim();
  $('libGrid').replaceChildren(...K.items.filter(i => i.name.includes(q)).map(i => {
    const b = mk('button'), m = mk('img'); m.src = 'assets/furniture/' + i.file; m.alt = ''; m.loading = 'lazy'; b.append(m, i.name);
    b.onclick = () => { const n = { uid: uid(), id: i.id, x: (V.x + FW / V.z / 2) / S - MX, y: (V.y + FH / V.z / 2) / S - MY, f: 1 }; change(() => room.items.push(n)); select(n.uid); };
    return b;
  }));
}
$('libQ').oninput = lib;
$('undo').onclick = () => { if (!hist.length) return; room = JSON.parse(hist.pop()); if (!byId(sel)) sel = null; draw(); panel(); state(); };
$('resetRoom').onclick = async () => { if (await ask('把家具、铺装和链接都恢复成默认？保存前可以撤销。', '恢复默认') === 'yes') { sel = null; change(() => room = { ...fresh(), v: 2, r: 1 }); panel(); } };
function save() {
  document.activeElement?.blur?.();
  if (badUrl) { toast('链接有误，还没保存'); $('pUrl').focus(); return false; }
  if (!store(KEY, JSON.stringify(room))) { toast('保存失败：浏览器不允许本地存储'); return false; }
  saved = copy(room); hist = []; state(); toast('已保存'); return true;
}
$('saveEdit').onclick = save;
async function quit() {
  document.activeElement?.blur?.();
  if (badUrl && !dirty()) badUrl = false;
  if (dirty()) {
    const a = await ask('有未保存的改动。', '保存并退出', '不保存');
    if (a === 'no') return; if (a === 'yes' && !save()) return; if (a === 'mid') room = copy(saved);
  }
  badUrl = false; go('room');
}
$('quitEdit').onclick = quit;
$('toEdit').onclick = () => go('edit');
function ask(text, yes, midT) {
  $('askT').textContent = text; $('askYes').textContent = yes; $('askMid').textContent = midT || ''; $('askMid').hidden = !midT;
  const d = $('ask'); d.returnValue = 'no'; d.showModal();
  return new Promise(res => {
    $('askYes').onclick = () => d.close('yes'); $('askMid').onclick = () => d.close('mid'); $('askNo').onclick = () => d.close('no');
    d.oncancel = () => { d.returnValue = 'no'; }; d.onclose = () => res(d.returnValue || 'no');
  });
}
let tt; function toast(s) { $('toast').textContent = s; $('toast').classList.add('on'); clearTimeout(tt); tt = setTimeout(() => $('toast').classList.remove('on'), 2200); }

/* ---------- 页面切换 ---------- */
function go(v) {
  view = v; document.body.dataset.view = v; sel = null; hoverU(null);
  if (v === 'home') { V.z = 1; [...wins.values()].forEach(closeWin); }
  if (v === 'edit') { hist = []; lib(); panel(); state(); }
  if (v === 'room') {   // 绑定改过或删掉的，关掉旧窗口
    [...wins.values()].forEach(n => { const o = byId(n.u); if (!o || o.url !== n.url || o.open === 'tab') closeWin(n); else { n.el.querySelector('header b').textContent = title(o); n.el.setAttribute('aria-label', title(o)); } });
    dock();
  }
  ME.view(v); draw(); requestAnimationFrame(look);
}
$('nick').value = load(NICK) || '';
$('enter').onsubmit = e => { e.preventDefault(); const n = $('nick').value.trim(); store(NICK, n); ME.setName(n || '访客'); $('meChip').textContent = (n || '访客') + ' · 在线'; go('room'); };
$('toHome').onclick = () => go('home');
addEventListener('keydown', e => {
  if ($('ask').open || /INPUT|SELECT/.test(e.target.tagName)) return;
  if (e.key === 'Escape') { if (view === 'room' && cur) closeWin(cur); else if (view === 'edit') select(null); }
  if (view === 'edit') {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); $('undo').click(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); }
    if (sel && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); del(); }
    const m = { ArrowLeft: [-.05, 0], ArrowRight: [.05, 0], ArrowUp: [0, -.05], ArrowDown: [0, .05] }[e.key], o = sel && byId(sel);
    if (m && o) { e.preventDefault(); change(() => { o.x += m[0]; o.y += m[1]; }); }
  }
});
addEventListener('beforeunload', e => { if (view === 'edit' && dirty()) e.preventDefault(); });
window.ME.init({
  walk: K.walk, view: () => view,
  screen: (x, y) => { const m = svg.getScreenCTM(), b = wrap.getBoundingClientRect(), q = new DOMPoint((x + MX) * S, (y + MY) * S).matrixTransform(m); return { x: q.x - b.left, y: q.y - b.top, m: m.a * S }; },
  follow: (x, y) => { if (V.z <= 1.01) return; const w = FW / V.z, h = FH / V.z, px = (x + MX) * S, py = (y + MY) * S, a = V.x, c = V.y;
    V.x = Math.min(px - w * .28, Math.max(px - w * .72, V.x)); V.y = Math.min(py - h * .3, Math.max(py - h * .7, V.y)); if (a !== V.x || c !== V.y) look(); },
});
go('home');
})();
