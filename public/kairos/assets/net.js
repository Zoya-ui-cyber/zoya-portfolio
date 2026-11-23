/* 2–4 人联机：Supabase Realtime 只做进房与牵线，画面、声音、位置走浏览器直连 */
window.NET = (() => {
'use strict';
const $ = id => document.getElementById(id), MAX = 4, OWN = 'kairos-owner';
const cfg = window.KAIROS_NET || {};
const ICE = [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.miwifi.com:3478', 'stun:stun.l.google.com:19302'] }, ...(cfg.turn || [])];
const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const un64 = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const enc = s => new TextEncoder().encode(s), clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f]/g, '').slice(0, n);
const ALG = { name: 'ECDSA', namedCurve: 'P-256' }, SIG = { name: 'ECDSA', hash: 'SHA-256' };

let api, sb = null, ch = null, me = null, rid = null, owner = null, admitted = false, rev = 0, token = 0, tries = 0;
const peers = new Map();
const urlRoom = () => { const r = new URLSearchParams(location.search).get('room'); return /^[\w-]{22}$/.test(r || '') ? r : null; };

/* ---------- 房主身份：房间号 = 公钥指纹 ---------- */
const fp = async k => b64(await crypto.subtle.digest('SHA-256', enc(k.x + '.' + k.y))).slice(0, 22);
async function loadOwner(id) {
  try {
    const s = JSON.parse(localStorage.getItem(OWN)); if (!s || (id && s.id !== id)) return null;
    return { id: s.id, pub: { x: s.jwk.x, y: s.jwk.y }, key: await crypto.subtle.importKey('jwk', s.jwk, ALG, false, ['sign']) };
  } catch { return null; }
}
async function makeOwner() {
  const p = await crypto.subtle.generateKey(ALG, true, ['sign', 'verify']), jwk = await crypto.subtle.exportKey('jwk', p.privateKey), id = await fp(jwk);
  try { localStorage.setItem(OWN, JSON.stringify({ id, jwk })); } catch {}
  return { id, pub: { x: jwk.x, y: jwk.y }, key: p.privateKey };
}

/* ---------- 消息 ---------- */
function send(type, data, to) { ch?.send({ type: 'broadcast', event: 'm', payload: { ...data, type, from: me, to } }); }
function fast(type, data) {   // 能走直连就不占用服务器
  const s = JSON.stringify({ ...data, type }); let rest = false;
  peers.forEach(p => { if (p.dc?.readyState === 'open') p.dc.send(s); else rest = true; });
  if (rest && Date.now() - (fast.t || 0) > 450) { fast.t = Date.now(); send(type, data); }
}
const myState = () => ({ name: api.name(), face: ME.faceIdx(), cam: !!ME.camTrack(), mic: !!mic, using: api.using(), media: show ? { name: show.name, kind: show.kind, u: show.u } : null, ...ME.pos() });
function state(to) { if (ch && admitted) send('state', { s: myState() }, to); }
let st = 0; function stateSoon() { clearTimeout(st); st = setTimeout(() => state(), 120); }

async function onMsg(m) {
  if (!m || m.from === me || (m.to && m.to !== me) || !admitted) return;
  if (m.type === 'room') return gotRoom(m);
  if (m.type === 'hello') { state(m.from); if (owner) pushRoom(m.from); return; }
  const p = peers.get(m.from); if (!p) return;
  if (m.type === 'state') gotState(p, m.s || {});
  else if (m.type === 'pos') gotPos(p, m);
  else if (m.type === 'rtc') p.q = (p.q || Promise.resolve()).then(() => gotRtc(p, m)).catch(e => console.warn('rtc', e));
}
function gotPos(p, m) { const x = +m.x, y = +m.y; if (isFinite(x) && isFinite(y)) { p.tx = Math.min(15, Math.max(-1, x)); p.ty = Math.min(9, Math.max(-2, y)); if (p.x == null) { p.x = p.tx; p.y = p.ty; } glide(); } }
function gotState(p, s) {
  const was = p.media?.name;
  p.name = clean(s.name, 10) || '访客'; p.face = s.face | 0; p.cam = !!s.cam; p.mic = !!s.mic;
  p.using = s.using && typeof s.using.u === 'string' ? { u: s.using.u.slice(0, 40), with: typeof s.using.with === 'string' ? s.using.with.slice(0, 40) : null, m: !!s.using.m, all: Array.isArray(s.using.all) ? s.using.all.slice(0, 20).map(String) : [] } : null;
  p.media = s.media ? { name: clean(s.media.name, 60), kind: s.media.kind === 'screen' ? 'screen' : 'video', u: clean(s.media.u, 24) } : null;
  gotPos(p, s); paint(p); api.peersChanged();
  if (was && !p.media) api.mediaEnded(p.id); else if (p.media) api.mediaLive(p); api.partnerMoved(p.id, p.name, p.using?.all || []);
}

/* ---------- 房间内容（只认房主签名） ---------- */
async function pushRoom(to) {
  if (!owner || !ch) return;
  const p = JSON.stringify(api.roomData()), r = Date.now();
  const sig = b64(await crypto.subtle.sign(SIG, owner.key, enc(rid + '.' + r + '.' + p)));
  send('room', { p, r, sig, pub: owner.pub }, to);
}
async function gotRoom(m) {
  if (owner || typeof m.p !== 'string' || m.p.length > 120000 || !(m.r >= rev)) return;
  try {
    const pub = { x: String(m.pub.x), y: String(m.pub.y) }; if (await fp(pub) !== rid) return;
    const k = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', ...pub, ext: true }, ALG, false, ['verify']);
    if (!await crypto.subtle.verify(SIG, k, un64(m.sig), enc(rid + '.' + m.r + '.' + m.p)) || !(m.r >= rev)) return;
    const first = !rev; rev = m.r; api.applyRoom(JSON.parse(m.p)); if (!first) api.toast('房主更新了房间');
  } catch (e) { console.warn('room', e); }
}

/* ---------- 进出房间 ---------- */
let libP = null;
const lib = () => libP ||= new Promise((ok, no) => { const s = mk('script'); s.src = 'assets/supabase.js?v=11232202'; s.onload = ok; s.onerror = () => { libP = null; no(); }; document.head.append(s); });
async function join(id) {
  const my = ++token; rid = id; rev = 0; tries = 0; status('正在连接…');
  try { await lib(); } catch { status('联机组件没加载出来，刷新重试'); return; }
  owner = await loadOwner(id); if (my !== token) return;
  document.body.classList.toggle('guest', !owner); api.roleChanged(!!owner);
  me = crypto.randomUUID(); sb ||= window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const c = ch = sb.channel('kairos-' + id, { config: { broadcast: { self: false }, presence: { key: me } } });
  let first = true;
  const sync = () => {
    if (c !== ch) return;
    const ids = Object.keys(c.presenceState()).filter(k => k !== me);
    if (first) { first = false; if (ids.length >= MAX) { leave(); api.full(); return; } admitted = true; }
    ids.forEach(k => { if (!peers.has(k) && peers.size < MAX - 1) addPeer(k); });
    [...peers.keys()].forEach(k => { if (!ids.includes(k)) dropSoon(k); else if (peers.get(k).bye) { clearTimeout(peers.get(k).bye); peers.get(k).bye = 0; } });
    status();
  };
  c.on('presence', { event: 'sync' }, sync).on('broadcast', { event: 'm' }, e => onMsg(e.payload));
  c.subscribe(async s => {
    if (c !== ch) return;
    if (s === 'SUBSCRIBED') { tries = 0; await c.track({ t: Date.now() }); setTimeout(() => { if (c === ch && admitted) { send('hello', {}); state(); if (owner) pushRoom(); } }, 600); if (!owner) setTimeout(() => { if (c === ch && !rev) api.toast('房主还没来，先看到的是默认房间'); }, 5000); }
    else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') { if (++tries >= 2) status('连不上房间服务器，正在重试…'); }
  });
}
function dropSoon(id) { const p = peers.get(id); if (p && !p.bye) p.bye = setTimeout(() => drop(id), 4000); }
function leave() {
  token++; const c = ch; ch = null; admitted = false; [...peers.keys()].forEach(drop); if (c) { c.untrack().catch(() => {}); sb.removeChannel(c); }
  micOff(); rid = null; owner = null; document.body.classList.remove('guest'); api?.roleChanged(true); status();
}
async function invite() {
  if (location.protocol === 'file:') return api.toast('联机要从线上网址打开');
  if (!cfg.url) return api.toast('还没有配置联机服务');
  if (!rid) {
    owner = await loadOwner() || await makeOwner();
    const u = new URL(location.href); u.searchParams.set('room', owner.id); history.replaceState(null, '', u); join(owner.id);
  }
  $('invLink').value = location.href.split('#')[0]; $('inv').showModal(); $('invLink').select();
}
function status(msg) {
  const n = peers.size + 1, t = $('meChip'); if (!api) return;
  t.textContent = msg || (rid ? `${api.name()} · ${n} 人在线` : `${api.name()} · 在线`);
  t.classList.toggle('warn', !!msg); $('invN').textContent = msg || `现在 ${n} 人，最多 ${MAX} 人`;
  $('micBtn').hidden = !rid; $('inviteBtn').hidden = !!rid && !owner; $('inviteBtn').textContent = rid ? '邀请链接' : '邀请朋友';
}

/* ---------- 成员头像 ---------- */
function addPeer(id) {
  const el = mk('div', 'peer'), f = mk('div', 'pf'), v = mk('video', 'pv'), n = mk('span', 'pn'), a = mk('audio'), b = mk('button', 'pj btn');
  v.autoplay = v.playsInline = v.muted = true; v.hidden = true; a.autoplay = true; b.hidden = true;
  el.append(f, v, n, b, a); $('peers').append(el);
  const p = { id, el, f, v, n, a, b, face: 0, name: '…', link: '连接中' }; peers.set(id, p);
  b.onclick = () => p.media ? api.watchMedia(p) : p.using && api.joinUse(p.using.u, p.id, p.name);
  rtc(p); paint(p); api.peersChanged(); setTimeout(() => { if (peers.get(id) === p) { state(id); if (owner) pushRoom(id); } }, 900);
}
function drop(id) { const p = peers.get(id); if (!p) return; clearTimeout(p.bye); clearTimeout(p.retry); peers.delete(id); p.pc?.close(); p.el.remove(); api.dock(); api.mediaEnded(id); api.partnerMoved(id, p.name, []); api.peersChanged(); status(); }
function paint(p) {
  p.f.innerHTML = ME.faceSvg(p.face); const live = p.cam && p.on; p.v.hidden = !live; p.f.hidden = live;
  const it = p.using && api.itemName(p.using.u);
  p.n.textContent = p.name + (p.mic ? '' : ' · 静音') + (p.on ? '' : ` · ${p.link}`);
  const same = p.using?.with === me; let t = '';
  if (p.media) t = p.media.kind === 'screen' ? '看屏幕' : '看放映'; else if (it && !same) t = '一起看 ' + it;
  p.b.textContent = t; p.b.hidden = !t || api.alreadyWith(p.id, p); p.offer = p.b.hidden ? '' : `${p.name}：${t}`; api.dock();
  place();
}
function place() { peers.forEach(p => { if (p.x == null) { p.el.hidden = true; return; } p.el.hidden = false; const q = api.screen(p.x, p.y), d = Math.max(54, Math.min(190, q.m * .85)); p.el.style.left = q.x + 'px'; p.el.style.top = q.y + 'px'; p.el.style.setProperty('--d', d + 'px'); }); }
let gl = 0, gt = 0;
function glide() {
  if (gl) return; gt = performance.now();
  const f = n => { const k = 1 - Math.exp(-(n - gt) / 110); gt = n; let go = false; peers.forEach(p => { if (p.x == null) return; const dx = p.tx - p.x, dy = p.ty - p.y; if (Math.abs(dx) + Math.abs(dy) > .004) { p.x += dx * k; p.y += dy * k; go = true; } else { p.x = p.tx; p.y = p.ty; } }); place(); gl = go ? requestAnimationFrame(f) : 0; };
  gl = requestAnimationFrame(f);
}

/* ---------- WebRTC：四条轨固定顺序（麦、摄像头、放映声、放映画面），开关只换轨不重新协商 ---------- */
function rtc(p) {
  p.pc?.close(); const pc = p.pc = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' }); p.offerer = me > p.id; p.cand = []; p.on = false;
  p.stream = new MediaStream(); p.show = new MediaStream(); p.dc = pc.createDataChannel('d', { negotiated: true, id: 0, ordered: false, maxRetransmits: 0 });
  p.dc.onmessage = e => { try { const m = JSON.parse(e.data); if (m.type === 'pos') gotPos(p, m); } catch {} };
  pc.onicecandidate = e => e.candidate && send('rtc', { c: e.candidate.toJSON() }, p.id);
  pc.ontrack = e => {
    const i = pc.getTransceivers().indexOf(e.transceiver);
    if (i === 0) { p.a.srcObject = new MediaStream([e.track]); p.a.play().catch(() => {}); }
    else if (i === 1) { p.stream.addTrack(e.track); p.v.srcObject = p.stream; p.v.play().catch(() => {}); }
    else { p.show.addTrack(e.track); if (p.media) api.mediaLive(p); }
  };
  pc.onconnectionstatechange = () => {
    if (pc !== p.pc) return; const s = pc.connectionState; p.on = s === 'connected';
    if (s === 'connected') { p.fails = 0; kind(p); api.peersChanged(); stateSoon(); }
    if (s === 'disconnected') p.link = '重连中';
    if (s === 'failed') { p.link = '视频连不通'; p.fails = (p.fails || 0) + 1; if (p.offerer && p.fails < 4) p.retry = setTimeout(() => offer(p, true), 1500 * p.fails); }
    paint(p);
  };
  if (p.offerer) { ['audio', 'video', 'audio', 'video'].forEach(k => pc.addTransceiver(k, { direction: 'sendrecv' })); feed(p); p.retry = setTimeout(() => offer(p), 700); }
}
async function offer(p, restart) {
  const pc = p.pc; if (pc.signalingState !== 'stable' && !(restart && pc.signalingState === 'have-local-offer')) return;
  await pc.setLocalDescription(await pc.createOffer({ iceRestart: !!restart })); send('rtc', { d: pc.localDescription.toJSON() }, p.id);
  clearTimeout(p.retry); p.retry = setTimeout(() => { if (!p.on && pc === p.pc && pc.signalingState === 'have-local-offer') send('rtc', { d: pc.localDescription.toJSON() }, p.id); }, 4000);
}
async function gotRtc(p, m) {
  const pc = p.pc;
  if (m.d) {
    if (m.d.type === 'offer') {
      if (p.offerer) return;
      await pc.setRemoteDescription(m.d); pc.getTransceivers().forEach(t => { t.direction = 'sendrecv'; }); feed(p);
      await pc.setLocalDescription(); send('rtc', { d: pc.localDescription.toJSON() }, p.id);
    } else { if (pc.signalingState !== 'have-local-offer') return; await pc.setRemoteDescription(m.d); }
    for (const c of p.cand.splice(0)) await pc.addIceCandidate(c).catch(() => {});
  } else if (m.c) { if (pc.remoteDescription) await pc.addIceCandidate(m.c).catch(() => {}); else p.cand.push(m.c); }
}
async function kind(p) {
  try { const s = await p.pc.getStats(); let r = ''; s.forEach(x => { if (x.type === 'candidate-pair' && x.state === 'succeeded' && x.nominated) { const l = s.get(x.localCandidateId); r = l?.candidateType === 'relay' ? '中转' : '直连'; } }); p.el.title = r ? `${p.name}：${r}` : ''; } catch {}
}
function feed(p) {
  const t = p.pc.getTransceivers(); if (t.length < 4) return;
  const put = (i, track, rate) => { const s = t[i].sender; s.replaceTrack(track || null).catch(() => {}); if (rate) try { const q = s.getParameters(); if (q.encodings?.length) { q.encodings[0].maxBitrate = rate; s.setParameters(q).catch(() => {}); } } catch {} };
  put(0, mic); put(1, ME.camTrack(), 350e3); put(2, show?.a); put(3, show?.v);
  try { const s = t[3].sender, q = s.getParameters(), scr = show?.kind === 'screen'; if (q.encodings?.length) { q.degradationPreference = scr ? 'maintain-resolution' : 'balanced'; q.encodings[0].maxBitrate = scr ? 2.5e6 : 1.6e6; if (scr) q.encodings[0].maxFramerate = 15; else delete q.encodings[0].maxFramerate; s.setParameters(q).catch(() => {}); } } catch {}
}
const feedAll = () => peers.forEach(feed);

/* ---------- 麦克风 ---------- */
let mic = null;
async function micOn() {
  try { const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); if (!rid) return s.getTracks().forEach(t => t.stop()); mic = s.getAudioTracks()[0]; mic.onended = micOff; }
  catch (e) { api.toast(e.name === 'NotAllowedError' ? '没有麦克风权限，可在地址栏左侧允许' : '麦克风打不开'); }
  micUI();
}
function micOff() { mic?.stop(); mic = null; micUI(); }
function micUI() { const b = $('micBtn'); b.textContent = mic ? '关闭麦克风' : '打开麦克风'; b.setAttribute('aria-pressed', !!mic); feedAll(); stateSoon(); }

/* ---------- 放映自己的视频（不上传，直接推给朋友） ---------- */
let show = null;
function startShow(video, name, u, screen) {
  const s = screen || (video.captureStream ? video.captureStream() : video.mozCaptureStream?.()); if (!s) { if (rid) api.toast('这个浏览器不能把视频放给朋友，请用 Chrome 或 Edge'); return; }
  show = { name, s, u, kind: screen ? 'screen' : 'video' }; const grab = () => { if (!show || show.s !== s) return; show.v = s.getVideoTracks()[0]; show.a = s.getAudioTracks()[0]; feedAll(); };
  s.addEventListener('addtrack', grab); s.addEventListener('removetrack', grab); grab(); stateSoon();
}
function stopShow() { if (!show) return; show = null; feedAll(); stateSoon(); }

function init(a) {
  api = a; ME.hooks.move = p => { if (admitted && peers.size && performance.now() - (init.t || 0) > 90) { init.t = performance.now(); fast('pos', { x: +p.x.toFixed(2), y: +p.y.toFixed(2) }); } };
  ME.hooks.stop = p => { if (admitted && peers.size) { fast('pos', p); send('pos', p); } };
  ME.hooks.cam = () => { feedAll(); stateSoon(); }; ME.hooks.face = stateSoon;
  $('micBtn').onclick = () => mic ? micOff() : micOn(); $('inviteBtn').onclick = invite;
  $('invCopy').onclick = async () => { try { await navigator.clipboard.writeText($('invLink').value); } catch { $('invLink').select(); document.execCommand('copy'); } $('invCopy').textContent = '已复制'; setTimeout(() => $('invCopy').textContent = '复制链接', 1800); };
  $('invClose').onclick = () => $('inv').close(); addEventListener('pagehide', () => { if (ch) leave(); });
}
return { init, join, leave, invite, place, urlRoom, status, pushRoom, stateSoon, startShow, stopShow, peers, isGuest: () => !!rid && !owner, inRoom: () => !!rid, meId: () => me, repaint: () => peers.forEach(paint) };
})();
