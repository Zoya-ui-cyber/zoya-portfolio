/* 我的头像框：插画头像 / 摄像头画面、走动 */
window.ME = (() => {
'use strict';
const $ = id => document.getElementById(id), KEY = 'kairos-face';
const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const put = v => { try { localStorage.setItem(KEY, v); } catch {} };

/* ---------- 头像：无五官的色块插画 ---------- */
const hair = {
  short: c => `<path d="M28 47C24 24 40 15 54 17c17 0 24 14 19 31l-5-13c-11 3-22 2-31-3-2 6-4 10-9 15z" fill="${c}"/>`,
  bob: c => `<path d="M24 64C17 34 30 15 51 15s33 18 25 49c-5 3-9 2-11 0V41C55 42 45 38 40 31c-2 8-5 11-6 13v21c-3 2-7 2-10-1z" fill="${c}"/>`,
  bun: c => `<circle cx="51" cy="13" r="10" fill="${c}"/><path d="M27 52C23 30 34 19 51 19s27 12 23 33l-6-15c-12 0-22-3-27-8-3 9-8 14-14 23z" fill="${c}"/>`,
  curly: c => `<path d="M26 50c-8-4-6-14 1-16-1-9 8-14 14-12 5-8 17-7 20 0 9-1 14 7 11 14 6 4 5 12-1 14l-5-13c-12 2-23-1-29-5-2 8-5 13-11 18z" fill="${c}"/>`,
  long: c => `<path d="M22 80C16 38 27 15 50 15s35 23 28 65c-6 4-11 3-14 0V42c-10 0-19-5-24-12-2 8-4 12-5 14v36c-4 3-9 3-13 0z" fill="${c}"/>`,
  cap: c => `<path d="M27 38c0-17 11-24 24-24s23 9 23 23z" fill="${c}"/><path d="M60 36c10-1 21 1 25 6-8 2-17 1-26 0z" fill="${c}"/>`,
};
const LIST = [
  ['#F5BE34', '#E9B48C', 'short', '#3A2415', '#FFF1D6'], ['#E8662A', '#F3C9A5', 'bun', '#7A4522', '#7FA83A'], ['#7FA83A', '#B9774C', 'curly', '#2B1B10', '#F5BE34'],
  ['#5C83BE', '#F0C39C', 'bob', '#4A2C18', '#E8662A'], ['#F3DDB0', '#8D5635', 'cap', '#C94F1B', '#3F6B35'], ['#A8C6BD', '#E2A87C', 'long', '#8A3F1C', '#5C83BE'],
];
const face = i => {
  const [b, s, h, hc, t] = LIST[i];
  const back = h === 'long' || h === 'bob' ? `<path d="M26 40h50v${h === 'long' ? 38 : 20}H26z" fill="${hc}"/>` : '';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="${b}"/>${back}<path d="M43 58h16v18c-4 6-12 6-16 0z" fill="${s}"/><path d="M42 63c5 7 12 8 17 4v6c-6 3-13 1-17-4z" fill="#3a241533"/><path d="M12 104c1-22 14-31 31-32 4 6 12 6 16 0 18 1 29 11 30 32z" fill="${t}"/><path d="M32 38c0-13 8-20 19-20s19 8 19 20c0 17-8 28-19 28S32 55 32 38z" fill="${s}"/>${hair[h](hc)}</svg>`;
};
let idx = +(get() ?? 0); if (!LIST[idx]) idx = 0;
function buttons(box) {
  box.replaceChildren(...LIST.map((_, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.innerHTML = face(i); b.setAttribute('aria-label', '头像 ' + (i + 1));
    b.onclick = () => { idx = i; put(i); paint(); hooks.face?.(); $('facePop').hidden = true; $('faceBtn').setAttribute('aria-expanded', 'false'); }; return b;
  }));
}
function paint() {
  $('meFace').innerHTML = face(idx);
  ['faces', 'facePop'].forEach(id => [...$(id).children].forEach((b, i) => b.setAttribute('aria-pressed', i === idx)));
}

/* ---------- 摄像头 ---------- */
let stream = null, asking = 0;
function say(s) { const t = $('toast'); t.textContent = s; t.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => t.classList.remove('on'), 4000); }
function camUI() {
  const on = !!stream; $('meCam').hidden = !on; $('meFace').hidden = on;
  $('camBtn').textContent = asking ? '等待授权…' : on ? '关闭摄像头' : '打开摄像头'; $('camBtn').disabled = !!asking; $('camBtn').setAttribute('aria-pressed', on); if (camUI.on !== on) { camUI.on = on; hooks.cam?.(); }
}
function camOff() { asking = 0; stream?.getTracks().forEach(t => t.stop()); stream = null; $('meCam').srcObject = null; camUI(); }
async function camOn() {
  if (!navigator.mediaDevices?.getUserMedia) return say('当前打开方式不支持摄像头，需要 https 网址或 localhost');
  const my = asking = Date.now(); camUI();
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 480 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false });
    if (asking !== my) { s.getTracks().forEach(t => t.stop()); return; }   // 等授权时已离开房间
    stream = s; s.getVideoTracks()[0].onended = () => { camOff(); say('摄像头已断开'); };
    $('meCam').srcObject = s; $('meCam').play().catch(() => {});
  } catch (e) {
    if (asking === my) say({ NotAllowedError: '没有摄像头权限，可在地址栏左侧的网站权限里允许', NotFoundError: '没有找到摄像头', NotReadableError: '摄像头正被其他程序占用' }[e.name] || '摄像头打不开');
  }
  if (asking === my) asking = 0;
  camUI();
}

/* ---------- 走动 ---------- */
let api, pos = { x: 6.2, y: 7.1 }, path = [], keys = new Set(), raf = 0, last = 0;
const hooks = {};
const R = .22, LO = .45, G = .2;
const inPoly = (p, x, y) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
function free(x, y) {
  const W = api.walk;
  for (const [dx, dy] of [[0, 0], [R, 0], [-R, 0], [0, R], [0, -R]]) if (!W.polys.some(p => inPoly(p, x + dx, y + dy))) return false;
  return !W.walls.some(([a, b, c, d]) => x > a - R && x < c + R && y > b - LO - R && y < d + R);
}
function route(x, y) {
  const at = (cx, cy) => free(cx * G, cy * G), sx = Math.round(pos.x / G), sy = Math.round(pos.y / G);
  let tx = Math.round(x / G), ty = Math.round(y / G), best = null;
  for (let r = 0; r < 8 && !best; r++) for (let i = -r; i <= r; i++) for (let k = -r; k <= r; k++) if (Math.max(Math.abs(i), Math.abs(k)) === r && at(tx + i, ty + k)) { const d = i * i + k * k; if (!best || d < best.d) best = { d, x: tx + i, y: ty + k }; }
  if (!best) return [];
  const id = (a, b) => a * 1000 + b, from = new Map([[id(sx, sy), null]]), dist = new Map([[id(sx, sy), 0]]), open = [[0, sx, sy]];
  while (open.length) {
    let m = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[m][0]) m = i;
    const [, cx, cy] = open.splice(m, 1)[0]; if (cx === best.x && cy === best.y) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = cx + dx, ny = cy + dy; if (!at(nx, ny) || (dx && dy && (!at(cx + dx, cy) || !at(cx, cy + dy)))) continue;
      const q = dist.get(id(cx, cy)) + Math.hypot(dx, dy), k = id(nx, ny);
      if (q < (dist.get(k) ?? 1e9)) { dist.set(k, q); from.set(k, [cx, cy]); open.push([q + Math.hypot(nx - best.x, ny - best.y), nx, ny]); }
    }
  }
  const out = []; let c = [best.x, best.y]; if (!from.has(id(...c))) return [];
  while (c) { out.unshift({ x: c[0] * G, y: c[1] * G }); c = from.get(id(...c)); }
  return out.slice(1);
}
const DIR = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
function step(n) {
  const dt = Math.min(.05, (n - last) / 1000); last = n; let v = 3.2 * dt, dx = 0, dy = 0;
  keys.forEach(k => { dx += DIR[k][0]; dy += DIR[k][1]; });
  if (dx || dy) { path = []; const l = Math.hypot(dx, dy); dx *= v / l; dy *= v / l; if (free(pos.x + dx, pos.y)) pos.x += dx; if (free(pos.x, pos.y + dy)) pos.y += dy; }
  else while (path.length && v > 0) { const t = path[0], d = Math.hypot(t.x - pos.x, t.y - pos.y); if (d <= v) { pos.x = t.x; pos.y = t.y; v -= d; path.shift(); } else { pos.x += (t.x - pos.x) * v / d; pos.y += (t.y - pos.y) * v / d; v = 0; } }
  api.follow(pos.x, pos.y); place(); hooks.move?.(pos);
  raf = keys.size || path.length ? requestAnimationFrame(step) : 0;
  if (!raf) hooks.stop?.({ x: +pos.x.toFixed(2), y: +pos.y.toFixed(2) });
}
function run() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } }
function place() {
  if (!api) return; const q = api.screen(pos.x, pos.y), d = Math.max(54, Math.min(190, q.m * .85)), m = $('me');
  m.style.left = q.x + 'px'; m.style.top = q.y + 'px'; m.style.width = m.style.height = d + 'px';
}
function init(a) {
  api = a; buttons($('faces')); buttons($('facePop')); paint(); camUI();
  $('camBtn').onclick = () => stream ? camOff() : camOn();
  $('faceBtn').onclick = () => { const h = !$('facePop').hidden; $('facePop').hidden = h; $('faceBtn').setAttribute('aria-expanded', !h); };
  addEventListener('keydown', e => {
    if (api.view() !== 'room' || !DIR[e.code] || e.ctrlKey || e.metaKey || e.altKey || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    e.preventDefault(); keys.add(e.code); run();
  });
  addEventListener('keyup', e => keys.delete(e.code)); addEventListener('blur', () => keys.clear());
  addEventListener('pagehide', camOff);
}
return { setFace: i => { if (LIST[i]) { idx = i; put(i); paint(); } },
  init, place, hooks, faceSvg: i => face(LIST[i] ? i : 0), faceIdx: () => idx, pos: () => ({ x: pos.x, y: pos.y }), camTrack: () => stream?.getVideoTracks()[0] || null,
  scatter: () => { for (let i = 0; i < 20; i++) { const x = 5 + Math.random() * 4.5, y = 3.2 + Math.random() * 3.6; if (free(x, y)) { pos.x = x; pos.y = y; break; } } place(); }, setName: n => $('meName').textContent = n,
  walkTo: (x, y) => { path = route(x, y); if (path.length) run(); },
  view: v => { keys.clear(); path = []; $('facePop').hidden = true; if (v === 'home') camOff(); },
};
})();
