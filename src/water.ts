// Events on the water (tail flicks, dropped stones, the intro ripple) and what they leave behind:
// ripple rings for the scene shader and lifted letters for the particle pass.
// Everything here is a pure function of the event list and the time, so frames render in any order.
import { MAX_PARTS, MAX_RINGS, TRAIL } from './config';
import { G } from './state';
import { letterAt } from './page';

export const enum Kind { Flick = 0, Stone = 1, Intro = 2, Hover = 3, Drop = 4 }

export interface WaterEvent {
  t0: number; // seconds, same clock as the frame
  x: number; y: number; // world
  fx: number; fy: number; // direction the water is thrown (flicks)
  kind: Kind;
  seed: number;
  amp?: number; // scales the ring (the cursor's ripples grow with its speed)
}

// Each event sends out a ring as a dispersive wave packet, the way a real ripple spreads: the packet
// (group) travels at speed, its width grows with time, and the crests inside it run at twice that
// speed, born at its back and fading out at its front; longer waves lead. sigma0 is the packet's
// starting half-width and lambda its wavelength, in world units
const RING = {
  [Kind.Flick]: { life: 3.4, speed: 0.15, sigma0: 0.04, lambda: 0.1, amp: 0.6, decay: 1.3 },
  [Kind.Stone]: { life: 6.0, speed: 0.19, sigma0: 0.07, lambda: 0.15, amp: 1.5, decay: 2.4 },
  [Kind.Intro]: { life: 6.0, speed: 0.17, sigma0: 0.08, lambda: 0.15, amp: 1.2, decay: 2.2 },
  // the cursor brushing the water: small, short ripples
  [Kind.Hover]: { life: 2.8, speed: 0.11, sigma0: 0.03, lambda: 0.085, amp: 0.5, decay: 1.0 },
  // a drop falling somewhere on the pond now and then
  [Kind.Drop]: { life: 6.0, speed: 0.14, sigma0: 0.055, lambda: 0.12, amp: 1.0, decay: 2.2 },
};
export const EVENT_LIFE = 6.2;

function hash(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export interface WaterFrame {
  rings: Float32Array; // MAX_RINGS * 4: x, y, packet radius, amplitude
  ringP: Float32Array; // MAX_RINGS * 4: packet half-width, wave number
  ringN: number;
  parts: Float32Array; // per point: grid px x, y, glyph, alpha, scale, weight
  partN: number;
  lifted: number[]; // page cells (index) currently off the page
}

const wf: WaterFrame = {
  rings: new Float32Array(MAX_RINGS * 4), ringP: new Float32Array(MAX_RINGS * 4), ringN: 0,
  parts: new Float32Array(MAX_PARTS * (TRAIL + 1) * 6), partN: 0, lifted: [],
};

const toGrid = (x: number, y: number): [number, number] => [G.gw / 2 + x * G.unit, G.gh / 2 - y * G.unit];

interface Spec { c: number; r: number; delay: number; life: number; dx: number; dy: number; curl: number }

// which letters an event lifts, and where they go (in grid px)
function lettersFor(e: WaterEvent): Spec[] {
  const [gx, gy] = toGrid(e.x, e.y);
  const cx = Math.floor(gx / G.cw), cy = Math.floor(gy / G.ch);
  const out: Spec[] = [];
  // hover ripples and falling drops only ring the water; they lift no letters
  if (e.kind === Kind.Hover || e.kind === Kind.Drop) return out;
  if (e.kind === Kind.Flick) {
    // a handful thrown back off the tail, mostly along the stroke
    const dirx = e.fx, diry = -e.fy;
    for (let j = 0; j < 4; j++) {
      const a = hash(e.seed, j, 1) * Math.PI * 2, rr = 0.6 + 2.6 * hash(e.seed, j, 2);
      const c = cx + Math.round(Math.cos(a) * rr * 1.6), r = cy + Math.round(Math.sin(a) * rr * 0.8);
      const D = (2 + 3 * hash(e.seed, j, 3)) * G.cw;
      const side = (hash(e.seed, j, 4) - 0.5) * 2;
      // only letters out by the rim: never a stray drop in the middle of the symbol
      const wx = ((c + 0.5) * G.cw - G.gw / 2) / G.unit, wy = (G.gh / 2 - (r + 0.5) * G.ch) / G.unit;
      if (Math.hypot(wx, wy) < 0.82) continue;
      out.push({ c, r, delay: 0.04 * j, life: 1.3 + 0.5 * hash(e.seed, j, 5), dx: (dirx - diry * side * 0.6) * D, dy: (diry + dirx * side * 0.6) * D, curl: side * 1.2 });
    }
  } else {
    // a stone lifts letters on a ring as the wave reaches them, and sets them down again
    const n = e.kind === Kind.Stone ? 26 : 12;
    const sp = RING[e.kind].speed;
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2 + hash(e.seed, j, 6) * 0.5;
      const rr = 1.5 + 6 * hash(e.seed, j, 7);
      const c = cx + Math.round(Math.cos(a) * rr * 2), r = cy + Math.round(Math.sin(a) * rr);
      const distW = Math.hypot((c - cx) * G.cw, (r - cy) * G.ch) / G.unit;
      const D = (1.5 + 2.5 * hash(e.seed, j, 8)) * G.cw;
      out.push({ c, r, delay: distW / sp, life: 1.8 + 0.9 * hash(e.seed, j, 9), dx: Math.cos(a) * D * 1.4, dy: Math.sin(a) * D, curl: (hash(e.seed, j, 10) - 0.5) * 1.6 });
    }
  }
  return out;
}

// lift fast, drift, then settle back exactly on the cell it came from
function offsetAt(s: Spec, e: number): [number, number] {
  const h = Math.sin(Math.PI * Math.pow(Math.min(1, Math.max(0, e)), 0.55));
  const ang = s.curl * e;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  return [(s.dx * ca - s.dy * sa) * h, (s.dx * sa + s.dy * ca) * h];
}

export function waterAt(t: number, events: WaterEvent[]): WaterFrame {
  wf.ringN = 0; wf.partN = 0; wf.lifted.length = 0;
  // newest first, so the ring budget keeps the freshest waves
  const live = events.filter((e) => t - e.t0 >= 0 && t - e.t0 < EVENT_LIFE).sort((a, b) => b.t0 - a.t0);
  for (const e of live) {
    const age = t - e.t0, R = RING[e.kind];
    if (age < R.life && wf.ringN < MAX_RINGS) {
      const i = wf.ringN++;
      const rg = R.speed * age;
      // energy spreads round the growing ring (amplitude ~ 1 / sqrt r) and is damped with time
      const amp = (e.amp ?? 1) * R.amp * Math.exp(-age / R.decay) * ss(0, 0.15, age) * (1 - ss(R.life * 0.7, R.life, age)) / Math.sqrt(1 + rg / 0.12);
      wf.rings.set([e.x, e.y, rg, amp], i * 4);
      wf.ringP.set([R.sigma0 * (1 + 0.9 * age), (2 * Math.PI) / R.lambda, 0, 0], i * 4);
    }
    for (const s of lettersFor(e)) {
      const el = (age - s.delay) / s.life;
      if (el < 0 || el >= 1) continue;
      const g = letterAt(s.c, s.r);
      if (!g) continue;
      if ((wf.partN + TRAIL + 1) * 6 > wf.parts.length) break;
      wf.lifted.push(s.r * G.cols + s.c);
      const bx = (s.c + 0.5) * G.cw, by = (s.r + 0.5) * G.ch;
      const fade = ss(0, 0.08, el);
      for (let k = TRAIL; k >= 1; k--) {
        const ek = el - k * 0.025;
        if (ek <= 0) continue;
        const [ox, oy] = offsetAt(s, ek);
        wf.parts.set([bx + ox, by + oy, 14 /* '.' */, 0.5 * fade * (1 - k / (TRAIL + 1)) * (1 - el), 1, 0], wf.partN * 6); wf.partN++;
      }
      const [ox, oy] = offsetAt(s, el);
      const lift = Math.sin(Math.PI * Math.pow(el, 0.6));
      // the letter rises toward you (bigger, darker, bolder), then sinks back to page weight
      wf.parts.set([bx + ox, by + oy, g, 2 + 0.55 + 0.4 * lift, 1 + 0.5 * lift, lift > 0.45 ? 1 : 0], wf.partN * 6); wf.partN++;
    }
  }
  return wf;
}
