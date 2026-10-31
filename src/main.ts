// The pond is a page: two koi chase each other under a typeset page, and the water bends the text.
// Render architecture adapted from SiddDevZ/horizon (MIT, © 2026 Siddharth Meena); see LICENSE-THIRD-PARTY.md.
import './style.css';
import { BREATH_RATE, CELL, CELL_SMALL, CRUISE, FLICKS, FRAME_WORLD, LOOP } from './config';
import { G } from './state';
import { gl, initGL, makeTex, fboFor } from './gl/context';
import { buildAtlas, buildShapes } from './gl/glyphs';
import { initRenderer, render, type View } from './gl/renderer';
import { buildPage } from './page';
import { Koi, type KoiFrame } from './koi';
import { PHI0, PHI_RATE, PSI_RATE, SLOW_RATE, loopClock, poseOf, type Clock } from './pose';
import { Kind, waterAt, EVENT_LIFE, type WaterEvent } from './water';

const params = new URLSearchParams(location.search);
const capture = params.has('capture');
// the reveal clip: the same loop, with a slow push from the pond into a koi's head until the page reads
const reveal = capture && params.has('reveal');
const REVEAL_ZOOM = 2.4;
const TAU = Math.PI * 2;

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const hint = document.createElement('div');
hint.className = 'hint';
hint.textContent = 'drag to turn the water · click to drop a stone · scroll to read closer · H hides this';
const mark = document.createElement('div');
mark.className = 'mark';
mark.textContent = 'koi / page';
if (!capture) document.body.append(hint, mark);
if (capture) document.body.classList.add('capture');

const koi = [new Koi(), new Koi()];
const view: View = { zoom: 1, panX: 0, panY: 0 };

// ---------- layout ----------
// captures default to landscape desktop, the way the piece is recorded (setSize changes it)
let fixed: { w: number; h: number; pr: number } | null = capture ? { w: 1920, h: 1080, pr: 1 } : null;
let atlasDpr = 0;

function layout() {
  const w = fixed ? fixed.w : innerWidth, h = fixed ? fixed.h : innerHeight;
  const pr = fixed ? fixed.pr : Math.min(2, devicePixelRatio || 1);
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  G.dpr = pr;
  const cell = Math.min(w, h) < 600 ? CELL_SMALL : CELL;
  if (atlasDpr !== pr || G.cellPx !== cell) { G.cellPx = cell; buildAtlas(cell); atlasDpr = pr; }
  G.W = Math.max(1, Math.round(w * pr)); G.H = Math.max(1, Math.round(h * pr));
  if (canvas.width !== G.W || canvas.height !== G.H) { canvas.width = G.W; canvas.height = G.H; }
  G.cols = Math.max(1, Math.floor(G.W / G.cw)); G.rows = Math.max(1, Math.floor(G.H / G.ch));
  G.gw = G.cols * G.cw; G.gh = G.rows * G.ch;
  G.offX = Math.floor((G.W - G.gw) / 2); G.offY = Math.floor((G.H - G.gh) / 2);
  // the orbit fills ~80% of the short side, whatever the aspect
  G.unit = Math.min(G.gw, G.gh) / FRAME_WORLD;
  if (G.tData) { for (const t of [G.tData, G.tPageD, G.tWater]) gl.deleteTexture(t); gl.deleteFramebuffer(G.fbo); }
  G.tData = makeTex(G.cols, G.rows); G.tPageD = makeTex(G.cols, G.rows);
  // the water for the painted view, read filtered between cell centres
  G.tWater = makeTex(G.cols, G.rows);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  G.fbo = fboFor(G.tData, G.tPageD, G.tWater);
  buildPage();
  setZoom(view.zoom, G.W / 2, G.H / 2);
}

// ---------- the swim ----------
function koiFrames(c: Clock): KoiFrame[] { return koi.map((k, i) => k.update(poseOf(c, i))); }

// a flick every half beat, alternating koi (koi k's beat starts when psi + k pi crosses 2 pi m):
// flick j belongs to koi j mod 2, and flick j + FLICKS (odd) to the other koi, which is exactly where
// this one will be a loop later
const probe = new Koi();
const mod = (a: number, n: number) => ((a % n) + n) % n;
function flickEvent(c: Clock, j: number): WaterEvent {
  const f = probe.update(poseOf(c, mod(j, 2)));
  return { t0: c.t, x: f.tip[0], y: f.tip[1], fx: -Math.cos(f.tip[2]), fy: -Math.sin(f.tip[2]), kind: Kind.Flick, seed: mod(j, FLICKS) };
}
// a few drops fall on the open water each loop, out in the wide margins either side of the symbol
// (world units; the same times every loop, so the seam holds)
const DROPS = [
  { t: 0.4, x: -1.72, y: 0.42 }, { t: 2.3, x: 1.62, y: -0.5 }, { t: 4.2, x: -1.55, y: -0.58 },
  { t: 6.1, x: 1.85, y: 0.36 }, { t: 8.0, x: -1.9, y: -0.08 }, { t: 9.9, x: 1.58, y: 0.62 },
];
function loopEvents(t: number): WaterEvent[] {
  const out: WaterEvent[] = [];
  const j1 = Math.floor((PSI_RATE * t) / Math.PI), j0 = Math.ceil((PSI_RATE * (t - EVENT_LIFE)) / Math.PI);
  for (let j = j0; j <= j1; j++) out.push(flickEvent(loopClock((j * Math.PI) / PSI_RATE), j));
  for (const d of DROPS) {
    // the latest fall of this drop at or before t (it falls once every loop)
    const t0 = d.t + LOOP * Math.floor((t - d.t) / LOOP);
    if (t - t0 < EVENT_LIFE) out.push({ t0, x: d.x, y: d.y, fx: 0, fy: 0, kind: Kind.Drop, seed: Math.round(d.t * 10) });
  }
  return out;
}

function draw(c: Clock, events: WaterEvent[]) {
  const frames = koiFrames(c);
  render(frames, { loop: (TAU * c.t) / LOOP, amp: c.amp, surf: c.surf, wake: c.wake }, waterAt(c.t, events), view);
}

/** The post loop: a pure function of t, periodic in LOOP. */
function renderLoopAt(seconds: number) {
  const t = ((seconds % LOOP) + LOOP) % LOOP;
  if (reveal) revealView(t);
  draw(loopClock(t), loopEvents(t));
}

// Zoom in log space toward where koi 0's head will be at mid-loop, hold while it swims through the
// readable page, and ease back to the full pond: zoom and framing are periodic, so t = 0 and t = 12 match.
function revealView(t: number) {
  const e = ss(0, 1, Math.min(1, (0.5 - 0.5 * Math.cos((TAU * t) / LOOP)) * 1.3));
  // the camera rides with koi 0's head as it swims (between the crown and the gill covers, so the frame
  // holds the eyes, the crown and the first lines written behind them); at the seam the zoom is 1 and
  // the frame is centred, so following a koi that trades places costs the loop nothing
  const k = probe.update(poseOf(loopClock(t), 0));
  const hx = 0.5 * (k.crown[0] + k.gill[0]), hy = 0.5 * (k.crown[1] + k.gill[1]);
  const fx = G.gw / 2 + hx * G.unit, fy = G.gh / 2 - hy * G.unit;
  const z = Math.exp(Math.log(REVEAL_ZOOM) * e);
  const cx = G.gw / 2 + (fx - G.gw / 2) * e, cy = G.gh / 2 + (fy - G.gh / 2) * e;
  view.zoom = z;
  view.panX = Math.min(0, Math.max(G.W - G.W * z, G.W / 2 - (G.offX + cx) * z));
  view.panY = Math.min(0, Math.max(G.H - G.H * z, G.H / 2 - (G.offY + cy) * z));
}

// ---------- interactive clock ----------
const sim = { t: 0, intro: 0, phi: PHI0, psi: 0, slow: 0, br: 0, amp: CRUISE, omega: PHI_RATE, beat: 0 };
// the cursor only ever touches the water: moving it sheds small ripples, it never moves the fish
const hover = { x: 0, y: 0, lastT: -1, has: false };
let nextDrop = 4;
let events: WaterEvent[] = [];
let playing = !capture, loopMode = capture, loopStart = 0, paused = false;
let dragging = false, dragAngle = 0, lastMove = 0, dragPending = 0;

function introAt(it: number) {
  const surf = ss(2.0, 5.2, it);
  const chase = ss(3.6, 7.0, it);
  return { surf, chase };
}
function ss(a: number, b: number, x: number) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

function replayIntro() {
  sim.t = 0; sim.intro = 0; sim.phi = PHI0; sim.psi = 0; sim.slow = 0; sim.br = 0; sim.amp = CRUISE; sim.omega = PHI_RATE; sim.beat = 0;
  hover.has = false; nextDrop = 4; dragPending = 0;
  events = [];
  introRipple = false;
}
let introRipple = false;

function step(dt: number) {
  sim.t += dt; sim.intro += dt;
  const I = introAt(sim.intro);
  if (!introRipple && sim.intro > 1.3) {
    introRipple = true;
    events.push({ t0: sim.t, x: 0, y: 0, fx: 0, fy: 0, kind: Kind.Intro, seed: 1 });
  }
  if (!dragging) {
    sim.omega += (PHI_RATE - sim.omega) * (1 - Math.exp(-dt / 1.6)); // inertia easing back to the natural orbit
    sim.phi += sim.omega * dt * (0.15 + 0.85 * I.chase);
  } else if (performance.now() - lastMove > 80) sim.omega *= Math.exp(-dt / 0.08);
  // turning the water carries the pair round as one symbol, eased so the hand's jitter never shows
  const take = dragPending * (1 - Math.exp(-dt / 0.12));
  sim.phi += take; dragPending -= take;
  // swim harder while the water is turned: the beat quickens and widens, phase stays continuous
  const push = Math.min(1, Math.max(0, (Math.abs(sim.omega) - PHI_RATE) / 1.5));
  sim.amp += (CRUISE * (0.55 + 0.45 * I.chase) + 0.6 * push - sim.amp) * (1 - Math.exp(-dt / 0.4));
  sim.psi += PSI_RATE * (1 + 1.8 * push) * (0.6 + 0.4 * I.chase) * dt;
  sim.slow += SLOW_RATE * dt;
  sim.br += BREATH_RATE * dt;
  const beat = Math.floor(sim.psi / Math.PI);
  if (beat !== sim.beat) {
    sim.beat = beat;
    if (I.chase > 0.9) events.push(flickEvent(simClock(), beat));
  }
  // now and then a drop falls on the open water, out to the sides of the symbol
  if (sim.t > nextDrop && I.chase > 0.9) {
    const side = Math.random() < 0.5 ? -1 : 1, half = G.gw / G.unit / 2;
    const x = side * (1.45 + Math.random() * Math.max(0.1, half - 1.65)), y = (Math.random() - 0.5) * 1.5;
    events.push({ t0: sim.t, x, y, fx: 0, fy: 0, kind: Kind.Drop, seed: Math.floor(Math.random() * 997) });
    nextDrop = sim.t + 1.6 + Math.random() * 2;
  }
  events = events.filter((e) => sim.t - e.t0 < EVENT_LIFE);
}
const simClock = (): Clock => {
  const I = introAt(sim.intro);
  return { t: sim.t, phi: sim.phi, psi: sim.psi, slow: sim.slow, br: sim.br, amp: sim.amp, surf: I.surf, wake: I.surf };
};

let raf = 0, last = 0;
function frame(now: number) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
  last = now;
  if (Math.abs(zoomTarget - view.zoom) > 1e-4) setZoom(view.zoom + (zoomTarget - view.zoom) * (1 - Math.exp(-dt / 0.09)), anchor.x, anchor.y);
  if (loopMode) { renderLoopAt((now - loopStart) / 1000); return; }
  if (!paused) step(dt);
  draw(simClock(), events);
}
function play() {
  if (loopMode) loopStart = performance.now();
  paused = false; playing = true;
  cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(frame);
}
function pause() { playing = false; paused = true; cancelAnimationFrame(raf); }

// ---------- zoom ----------
let zoomTarget = 1;
const anchor = { x: 0, y: 0 };
function setZoom(z: number, ax: number, ay: number) {
  const nz = Math.min(8, Math.max(1, z));
  const cx = (ax - view.panX) / view.zoom, cy = (ay - view.panY) / view.zoom;
  view.zoom = nz;
  view.panX = Math.min(0, Math.max(G.W - G.W * nz, ax - cx * nz));
  view.panY = Math.min(0, Math.max(G.H - G.H * nz, ay - cy * nz));
  if (Math.abs(nz - 1) < 1e-3) { view.zoom = 1; view.panX = 0; view.panY = 0; }
}

// ---------- input ----------
const toDevice = (e: { clientX: number; clientY: number }) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * G.dpr, y: (e.clientY - r.top) * G.dpr }; };
const toWorld = (p: { x: number; y: number }) => {
  const gx = (p.x - view.panX) / view.zoom - G.offX, gy = (p.y - view.panY) / view.zoom - G.offY;
  return { x: (gx - G.gw / 2) / G.unit, y: -(gy - G.gh / 2) / G.unit };
};
const pointers = new Map<number, { x: number; y: number }>();
let downAt: { x: number; y: number; t: number } | null = null, pinch0 = 0, zoom0 = 1;

function initInput() {
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    const p = toDevice(e);
    pointers.set(e.pointerId, p);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = zoomTarget; downAt = null; dragging = false;
      return;
    }
    downAt = { ...p, t: performance.now() };
    const w = toWorld(p); dragAngle = Math.atan2(w.y, w.x);
  });
  canvas.addEventListener('pointermove', (e) => {
    // a moving cursor brushes the water: a small ripple every so often along its path (never the fish)
    if (e.pointerType === 'mouse' && !loopMode && !dragging) {
      const w = toWorld(toDevice(e));
      if (!hover.has || (sim.t - hover.lastT > 0.14 && Math.hypot(w.x - hover.x, w.y - hover.y) > 0.05)) {
        if (hover.has) events.push({ t0: sim.t, x: w.x, y: w.y, fx: 0, fy: 0, kind: Kind.Hover, seed: Math.floor(sim.t * 131) % 997 });
        hover.x = w.x; hover.y = w.y; hover.lastT = sim.t; hover.has = true;
      }
    }
    if (!pointers.has(e.pointerId)) return;
    const p = toDevice(e);
    pointers.set(e.pointerId, p);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomTarget = Math.min(8, Math.max(1, (zoom0 * d) / Math.max(pinch0, 1)));
      anchor.x = (a.x + b.x) / 2; anchor.y = (a.y + b.y) / 2;
      return;
    }
    if (!downAt || loopMode) return;
    if (!dragging && Math.hypot(p.x - downAt.x, p.y - downAt.y) > 6 * G.dpr) dragging = true;
    if (dragging) {
      // turning the water carries the pair round with it
      const w = toWorld(p), a = Math.atan2(w.y, w.x);
      let d = a - dragAngle; d -= TAU * Math.round(d / TAU);
      dragAngle = a;
      const now = performance.now(), dt = Math.max(1, now - lastMove) / 1000;
      lastMove = now;
      dragPending += d;
      sim.omega = Math.max(PHI_RATE * 0.3, Math.min(6, sim.omega * 0.6 + (d / dt) * 0.4));
    }
  });
  const up = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (downAt && !dragging && !loopMode && performance.now() - downAt.t < 500) {
      const w = toWorld(downAt);
      events.push({ t0: sim.t, x: w.x, y: w.y, fx: 0, fy: 0, kind: Kind.Stone, seed: Math.floor(sim.t * 1000) % 9973 });
    }
    dragging = false; downAt = null;
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointerleave', () => { hover.has = false; });
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = toDevice(e);
    anchor.x = p.x; anchor.y = p.y;
    zoomTarget = Math.min(8, Math.max(1, zoomTarget * Math.exp(-e.deltaY * 0.0018)));
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') document.body.classList.toggle('rec');
    else if (e.key === ' ') { e.preventDefault(); if (paused) play(); else pause(); }
    else if (e.key === 'r' || e.key === 'R') api.replay();
    else if (e.key === '0') { zoomTarget = 1; anchor.x = G.W / 2; anchor.y = G.H / 2; }
  });
  addEventListener('resize', () => { if (!fixed) layout(); });
}

// ---------- boot + capture seam ----------
let resolveReady: () => void = () => {};
const api = {
  ready: new Promise<void>((r) => { resolveReady = r; }),
  isReady: false,
  duration: LOOP,
  /** Synchronously draw the loop frame at `seconds` (periodic: renderAt(0) == renderAt(12)). */
  renderAt(seconds: number) { pause(); loopMode = true; renderLoopAt(seconds); },
  play() { play(); },
  pause() { pause(); },
  replay() {
    zoomTarget = 1; setZoom(1, 0, 0);
    if (capture) { loopMode = true; play(); return; }
    loopMode = false; replayIntro(); play();
  },
  /** Verification only: draw the loop clock at t without wrapping, to check renderAt(t) == renderAt(t + 12). */
  renderUnwrapped(seconds: number) { pause(); loopMode = true; if (reveal) revealView(((seconds % LOOP) + LOOP) % LOOP); draw(loopClock(seconds), loopEvents(seconds)); },
  setSize(w: number, h: number, pixelRatio = 1) { fixed = { w, h, pr: pixelRatio }; layout(); if (paused) renderLoopAt(0); },
};
declare global { interface Window { asciiPiece: typeof api } }
window.asciiPiece = api;

async function boot() {
  if (!initGL(canvas)) {
    document.body.insertAdjacentHTML('beforeend', '<p class="fallback">This piece needs WebGL 2.</p>');
    return;
  }
  // wait for the monospace face so the atlas is measured on the real font
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  buildShapes();
  initRenderer();
  layout();
  if (!capture) initInput();
  play();
  api.isReady = true;
  resolveReady();
}
boot();
