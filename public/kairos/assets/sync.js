/* 一起看的同步：YouTube、Spotify 用播放器消息；哔哩哔哩用我们的播放条（按时间重新载入）；自己的文章同步滚动 */
window.SYNC = (() => {
'use strict';
let api = null; const now = () => performance.now() / 1000, mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const COLLAB = /(^|\.)(excalidraw\.com|figma\.com|docs\.qq\.com|docs\.google\.com|miro\.com|tldraw\.com|feishu\.cn|larksuite\.com|boardmix\.cn)$/;
function kindOf(n) {
  if (n.media) return '';
  if (/^content\//.test(n.url)) return 'doc';
  try { const u = new URL(n.fr.src); if (u.hostname === 'www.youtube.com' && u.pathname.startsWith('/embed/')) return 'yt'; if (u.hostname === 'open.spotify.com') return 'sp'; if (u.hostname === 'player.bilibili.com') return 'bi'; if (COLLAB.test(new URL(n.url).hostname)) return 'co'; } catch {}
  return '';
}
const ORG = { yt: 'https://www.youtube.com', sp: 'https://open.spotify.com' };
const at = s => s.playing ? s.pos + now() - s.t : s.pos, clock = v => { v = Math.max(0, v | 0); const h = v / 3600 | 0, m = (v % 3600) / 60 | 0, s = String(v % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`; };
const parse = x => { const p = x.trim().split(/[:：]/).map(Number); return p.length && p.length < 4 && p.every(v => isFinite(v) && v >= 0) ? p.reduce((a, b) => a * 60 + b, 0) : null; };
const root = n => n.with || api.me(), grouped = n => !!n.with || api.fans(n).length > 0;

function attach(n) {
  n.sy = { kind: kindOf(n), playing: false, pos: 0, t: now(), known: false, quiet: 0, sent: 0, real: null, group: false };
  const s = n.sy; n.sbar = mk('div', 'sbar'); n.sbar.hidden = true; n.el.append(n.sbar);
  if (s.kind === 'yt') s.beat = setInterval(() => post(n, { event: 'listening', id: 1, channel: 'widget' }), 2000);
  if (s.kind === 'doc') n.fr.addEventListener('load', () => { try { const w = n.fr.contentWindow; w.addEventListener('scroll', () => scrolled(n, w), { passive: true }); } catch {} });
}
function detach(n) { clearInterval(n.sy?.beat); }
function post(n, m) { const o = ORG[n.sy.kind]; if (o) try { n.fr.contentWindow.postMessage(n.sy.kind === 'yt' ? JSON.stringify(m) : m, o); } catch {} }
const yt = (n, func, args = []) => post(n, { event: 'command', func, args, id: 1, channel: 'widget' });

/* 播放器报上来的真实状态 */
addEventListener('message', e => {
  if (!api || (e.origin !== ORG.yt && e.origin !== ORG.sp)) return;
  const n = [...api.wins().values()].find(w => !w.media && w.fr.contentWindow === e.source); if (!n?.sy) return; const s = n.sy;
  let d = e.data; if (typeof d === 'string') try { d = JSON.parse(d); } catch { return; }
  if (s.kind === 'yt' && d?.info && (d.event === 'infoDelivery' || d.event === 'initialDelivery' || d.event === 'onStateChange')) {
    if (typeof d.info === 'object') { if (typeof d.info.playerState === 'number') s.ps = d.info.playerState; if (typeof d.info.currentTime === 'number') s.ct = d.info.currentTime; }
    if (s.ps === 1 || s.ps === 2) real(n, s.ps === 1, s.ct || 0, '');
  }
  if (s.kind === 'sp' && d?.type === 'playback_update' && d.payload && !d.payload.isBuffering) { const p = d.payload; s.dur = p.duration / 1000; if (p.isPaused && p.position >= p.duration - 1500 && p.duration) return; real(n, !p.isPaused, p.position / 1000, String(p.playingURI || '').slice(0, 80)); }
});
function real(n, playing, pos, uri) {
  const s = n.sy, r = s.real, t = now(); s.real = { playing, pos, t, uri };
  if (!r) { if (playing) user(n, playing, pos, uri); return; }
  const jump = pos - r.pos, el = t - r.t, sought = uri === r.uri && (jump < -1.5 || jump > (r.playing ? el : 0) + 2.5);
  if (playing !== r.playing || sought || uri !== r.uri) user(n, playing, pos, uri);
}
function user(n, playing, pos, uri) {   // 本人操作，告诉同伴
  const s = n.sy; if (now() < s.quiet) return; Object.assign(s, { playing, pos, uri, t: now(), known: true }); if (!grouped(n)) return; s.sent = now(); send(n, 'set'); tell(n);
}
function send(n, k, to) { const s = n.sy, use = s.real && (s.kind === 'yt' || s.kind === 'sp') && now() - s.real.t < 4 ? s.real : s; api.send({ k, g: root(n), u: n.u, url: n.url, p: !!use.playing, pos: +at(use).toFixed(2), uri: use.uri || '', kn: s.known || !!s.real }, to); }

function onMsg(m) {
  if (typeof m.u !== 'string') return; const n = api.wins().get(m.u); if (!n?.sy || n.media || n.url !== m.url || m.g !== root(n) || !grouped(n)) return; const s = n.sy;
  if (m.k === 'ask') { if (root(n) === api.me() && (s.known || s.real)) send(n, 'set', m.from); return; }
  if (!m.kn || !isFinite(m.pos) || m.pos < 0 || m.pos > 4e5 || (m.k !== 'set' && m.k !== 'hb')) return;
  if (m.k === 'hb') { if (m.from !== root(n) || now() - s.sent < 2.5 || now() < s.quiet) return; if (s.kind === 'doc') return; }
  apply(n, !!m.p, +m.pos, String(m.uri || ''), m.k === 'hb'); if (m.k === 'set') tell(n, m.from);
}
function apply(n, playing, pos, uri, soft) {
  const s = n.sy, r = s.real, wasP = s.known && s.playing, gap = Math.abs((r ? at(r) : at(s)) - pos);
  if (s.kind === 'bi' && soft && s.known && s.playing === playing && Math.abs(at(s) - pos) < 4) return;
  if ((s.kind === 'yt' || s.kind === 'sp') && soft && r && r.playing === playing && (gap < 2 || uri !== r.uri || !playing)) return;
  Object.assign(s, { playing, pos, uri, t: now(), known: true, quiet: now() + 2.5 });
  if (s.kind === 'yt') { if (!r || gap > 1.2) yt(n, 'seekTo', [pos, true]); yt(n, playing ? 'playVideo' : 'pauseVideo'); }
  else if (s.kind === 'sp') {
    const same = !r || !uri || r.uri === uri; s.other = !same;
    const seek = () => { if (same && gap > 1.2 && (!s.dur || pos < s.dur - 1)) post(n, { command: 'seek', timestamp: Math.round(playing ? at(s) : pos) }); };
    if (same && playing) { if (!r?.playing) post(n, { command: 'resume' }); setTimeout(seek, r?.playing ? 0 : 700); } else if (!playing) { post(n, { command: 'pause' }); seek(); }
  }
  else if (s.kind === 'bi') bili(n, playing, pos);
  else if (s.kind === 'doc') try { const w = n.fr.contentWindow, d = w.document.documentElement; w.scrollTo(0, pos * (d.scrollHeight - d.clientHeight)); } catch {}
  clearTimeout(s.chk); if ((s.kind === 'yt' || s.kind === 'sp') && playing) s.chk = setTimeout(() => { if (n.sy.playing && !n.sy.real?.playing && grouped(n)) bar(n, '浏览器拦住了自动播放，点一下播放器就会跟上'); }, 3500);
}
function bili(n, playing, pos) { const u = new URL(n.fr.src); u.searchParams.set('t', Math.max(0, Math.round(pos))); u.searchParams.set('autoplay', playing ? 1 : 0); u.searchParams.set('k', Date.now() % 1e6); n.fr.src = u.href; }
let sc = 0; function scrolled(n, w) {
  const s = n.sy, d = w.document.documentElement, m = d.scrollHeight - d.clientHeight; if (m <= 0 || now() < s.quiet) return; Object.assign(s, { pos: d.scrollTop / m, playing: false, t: now(), known: true });
  if (!grouped(n) || sc) return; sc = setTimeout(() => { sc = 0; if (grouped(n)) send(n, 'set'); }, 180);
}
setInterval(() => api && api.wins().forEach(n => { if (!n.sy || n.media) return; const s = n.sy; if (s.kind === 'bi' && s.clk) s.clk.textContent = s.known ? `${s.playing ? '播放中' : '已暂停'} ${clock(at(s))}` : '还没开始'; }), 500);
setInterval(() => api && api.wins().forEach(n => { if (n.sy && 'yt,sp,bi'.includes(n.sy.kind) && n.sy.kind && root(n) === api.me() && api.fans(n).length && (n.sy.known || n.sy.real)) send(n, 'hb'); }), 5000);

/* 窗口底部的说明和播放条 */
let tt = 0;
function tell(n, from) { if (n.sy.kind === 'doc') return; if (n.sy.kind !== 'bi') bar(n); const s = n.sy, who = from ? api.name(from) : '你'; if (now() - tt < 1) return; tt = now(); api.toast(`${who}${s.playing ? '播放到' : '暂停在'} ${clock(at(s))}`); }
function bar(n, warn) {
  const s = n.sy, b = n.sbar, B = (t, f, c) => { const x = mk('button', 'btn' + (c || ''), t); x.onclick = f; return x; }; b.replaceChildren(); s.clk = null;
  if (s.kind === 'yt' || s.kind === 'sp') b.append(mk('span', '', warn || (s.other ? '同伴在听另一首，切到同一首会自动对上' : '播放、暂停、进度会同步')), B('对齐', () => { s.sent = 0; s.quiet = 0; if (root(n) === api.me()) send(n, 'set'); else api.send({ k: 'ask', g: root(n), u: n.u, url: n.url }); }));
  else if (s.kind === 'doc') b.append(mk('span', '', '滚动会同步'));
  else if (s.kind === 'bi') {
    const i = mk('input'); i.placeholder = '0:00'; i.setAttribute('aria-label', '跳到几分几秒'); s.clk = mk('b');
    const go = (p, pos) => { s.known = true; Object.assign(s, { playing: p, pos, t: now() }); bili(n, p, pos); s.sent = now(); send(n, 'set'); tell(n); }, t = () => i.value.trim() ? parse(i.value) : at(s);
    const run = p => { const v = t(); if (v == null) return api.toast('时间写成 12:30 这样'); i.value = ''; go(p, p ? v : at(s)); };
    b.append(s.clk, B('一起播放', () => run(true), ' primary'), B('一起暂停', () => run(false)), i, mk('span', 'soft', '用这里的按钮才会同步，播放器自己的按钮只影响自己'));
  } else if (s.kind === 'co') b.append(mk('span', '', '这个网站自带协作：绑定同一个协作链接，内容会由它自己同步'));
  else { b.append(mk('span', '', '这个网站各看各的')); if (api.canScreen) b.append(B('改为共享这个网页', () => api.sharePage(n))); if (/bilibili\.com/.test(n.url)) b.append(mk('span', 'soft', '绑定具体视频的链接，就能一起播放')); }
}
function changed(n) {   // 一起看开始或结束
  if (!n.sy || n.media) return; const g = grouped(n), key = g ? root(n) : ''; n.sbar.hidden = !g; if (n.sy.group === key) return; n.sy.group = key; if (!g) return; bar(n);
  if (n.with) setTimeout(() => { if (n.with && grouped(n)) api.send({ k: 'ask', g: root(n), u: n.u, url: n.url }); }, n.sy.kind === 'doc' ? 900 : 2200);
}
return { init: a => api = a, attach, detach, onMsg, changed };
})();
