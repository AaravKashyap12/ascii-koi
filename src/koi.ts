// One procedural koi seen from above, curled as one half of a yin-yang: at rest its spine is a spiral
// that starts at the fat end of the symbol (the head, turned in toward the middle) and sweeps out to run
// along the rim for half a turn, so its tail passes outside the other koi's head. The swim (a slow
// subcarangiform wave with a glide in every beat, caudal lag) is integrated as curvature on top of that
// spiral and re-aligned to its centre of mass and mean heading, so swimming never pulls the pair apart.
// The spine is sampled into the node arrays the scene shader turns into an SDF per cell. Fins and tail are silk: every point follows its root's angle
// from a moment earlier, so tips lag, overshoot and fold back against the body.
// Every value is a pure function of the pose, so any frame can be rebuilt in any order.

export const R = 1.0; // radius of the yin-yang disc at the spine of the rim, world units
// the head sits at RH of the disc radius (the fat end of the teardrop); the body reaches the rim, RT,
// about RIM_A radians behind it, easing out with EASE (tuned against the S-gap check in scratch/geo)
// FLAT blends in a profile that leaves the head tangentially (no radial slope at the snout), so as the
// pair turns the head travels the way it points instead of crabbing sideways
export const SHAPE = { RH: 0.36, RT: 0.92, RIM_A: 3.8, EASE: 1.6, FLAT: 1 };
export const BODY_L = 1.5;
export const TAIL_L = 0.7;
// the painted eye's radius and the tancho's (world units)
export const EYE_R = 0.019, TANCHO_R = 0.03;
export const W_MAX = 0.1 * BODY_L; // half-width at the shoulders: a koi's proportions (about a fifth as wide as long)
const NSP = 220; // spine stations over body + caudal fin
const DS = (BODY_L + TAIL_L) / (NSP - 1);

export const NB = 30; // body nodes sent to the shader
export const NT = 12; // caudal nodes
export const NF = 4; // paired fins (2 pectoral, 2 pelvic)
export const FP = 6; // points per fin

export interface Pose {
  phi: number; // angle of the head around the disc
  psi: number; // tail-beat phase
  amp: number; // swim effort (1 = cruise)
  slow: number; // slow body-bend phase
  rad: number; // disc radius (breathes)
  curl: number; // scales how far in the head sits (breathes)
}

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// a beat is a quick stroke and a long glide: warp the phase so it hurries through half the cycle
const GLIDE = 0.42;
const glide = (th: number) => th + GLIDE * Math.sin(th);
const WAVE_K = 3.7; // rad of travelling wave along the body: a long, slow wave
const CAUDAL_LAG = 1.5;

/** Piecewise-cubic (Catmull-Rom, clamped) through (u, value) knots. */
function profile(knots: number[][]): (u: number) => number {
  return (u: number) => {
    if (u <= knots[0][0]) return knots[0][1];
    let i = 0;
    while (i < knots.length - 2 && u > knots[i + 1][0]) i++;
    const [u1, p1] = knots[i], [u2, p2] = knots[i + 1];
    const p0 = knots[Math.max(0, i - 1)][1], p3 = knots[Math.min(knots.length - 1, i + 2)][1];
    const t = Math.min(1, (u - u1) / (u2 - u1));
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  };
}
// top-down koi silhouette: a rounded snout tapering into a head a little narrower than the shoulders,
// the gill covers (GILL_U) where the body steps out, widest just behind them, easing into the peduncle
export const GILL_U = 0.15;
export const widthAt = profile([[0, 0.3], [0.02, 0.47], [0.05, 0.6], [0.09, 0.7], [0.13, 0.76], [0.17, 0.86], [0.22, 0.96], [0.27, 1], [0.34, 0.99], [0.43, 0.92], [0.53, 0.8], [0.63, 0.64], [0.73, 0.48], [0.83, 0.34], [0.92, 0.25], [1, 0.21]]);

// body nodes cluster at the head (round, blunt) and the peduncle
const nodeU = (i: number) => { const t = i / (NB - 1); return 0.55 * (0.5 - 0.5 * Math.cos(Math.PI * t)) + 0.45 * t; };

/** Everything the shader needs for one koi, packed as vec4s. */
export interface KoiFrame {
  body: Float32Array; // NB * 4: x, y, radius, u
  tail: Float32Array; // NT * 4: x, y, half-span, a
  fins: Float32Array; // NF * FP * 4: x, y, half-chord, a
  eyes: [number, number, number, number];
  crown: [number, number, number, number]; // x, y, radius, heading (the spot is a little longer than wide)
  barbels: Float32Array; // 2 * 4: root x, y, tip x, y
  gill: [number, number, number, number]; // spine point at the gill covers: x, y, heading, half-width
  tip: [number, number, number]; // caudal tip x, y, heading
  bound: [number, number, number]; // centre x, y, radius
  flow: [number, number]; // swim direction at the shoulder
  psi: number;
}

// mass weights along the spine (body only): the koi turns about its centre of mass, so the head yaws against the tail
const MASS = Float64Array.from({ length: NSP }, (_, i) => { const u = (i * DS) / BODY_L; return u > 1 ? 0 : widthAt(u) ** 2; });
const MASS_SUM = MASS.reduce((a, b) => a + b, 0);

export class Koi {
  private readonly sx = new Float64Array(NSP);
  private readonly sy = new Float64Array(NSP);
  private readonly sth = new Float64Array(NSP);
  readonly f: KoiFrame = {
    body: new Float32Array(NB * 4), tail: new Float32Array(NT * 4), fins: new Float32Array(NF * FP * 4),
    eyes: [0, 0, 0, 0], crown: [0, 0, 0, 0], barbels: new Float32Array(8), gill: [0, 0, 0, 1], tip: [0, 0, 0], bound: [0, 0, 1], flow: [1, 0], psi: 0,
  };

  /** Swim curvature added to the resting spiral at arc length s (head = 0). */
  private wave(s: number, p: Pose, amp: number): number {
    const u = s / BODY_L;
    const A0 = 0.62 * amp;
    // a slow breath of the curl itself, travelling tailward
    const c = 0.05 * Math.sin(p.slow - 2.2 * Math.min(u, 1.2));
    if (u <= 1) {
      // eased along the whole length: a whisper at the head, growing smoothly to the tail
      const env = 0.06 + 0.94 * Math.pow(smooth(0.05, 1.0, u), 1.6);
      return c + A0 * env * Math.sin(glide(p.psi - WAVE_K * u));
    }
    // caudal fin: a membrane lagging behind the peduncle, with its own ripple running to the edge
    const a = (s - BODY_L) / TAIL_L;
    return c + A0 * 0.8 * (1 - 0.2 * a) * Math.sin(glide(p.psi - WAVE_K - CAUDAL_LAG * a))
      + 0.6 * amp * a * a * Math.sin(glide(p.psi - WAVE_K - 2.2) - 3.4 * a);
  }

  private readonly rest = { x: new Float64Array(NSP), y: new Float64Array(NSP), th: new Float64Array(NSP), k: new Float64Array(NSP) };
  private readonly dense = { x: new Float64Array(4096), y: new Float64Array(4096), s: new Float64Array(4096) };

  /** The resting spiral in world space: arc-length stations, headings (toward the head) and curvature. */
  private buildRest(p: Pose) {
    const { x, y, th, k } = this.rest, D = this.dense;
    const { RT, RIM_A, EASE, FLAT } = SHAPE, Rd = p.rad, rh = SHAPE.RH * p.curl;
    // walk back from the head (angle phi) clockwise; the radius eases out from the fat end to the rim
    const rOf = (a: number) => {
      const t = Math.min(1, a / RIM_A), ease = 1 - Math.pow(1 - t, EASE), flat = t * t * t * (t * (t * 6 - 15) + 10);
      return Rd * (rh + (RT - rh) * (ease + (flat - ease) * FLAT));
    };
    const L = BODY_L + TAIL_L + DS;
    let n = 0, a = 0, len = 0;
    D.x[0] = rOf(0) * Math.cos(p.phi); D.y[0] = rOf(0) * Math.sin(p.phi); D.s[0] = 0;
    while (len < L && n < 4095) {
      a += 0.002;
      const r = rOf(a), px = r * Math.cos(p.phi - a), py = r * Math.sin(p.phi - a);
      len += Math.hypot(px - D.x[n], py - D.y[n]);
      n++; D.x[n] = px; D.y[n] = py; D.s[n] = len;
    }
    let j = 0;
    for (let i = 0; i < NSP; i++) {
      const si = i * DS;
      while (j < n - 1 && D.s[j + 1] < si) j++;
      const t = (si - D.s[j]) / Math.max(1e-9, D.s[j + 1] - D.s[j]);
      x[i] = D.x[j] + (D.x[j + 1] - D.x[j]) * t; y[i] = D.y[j] + (D.y[j + 1] - D.y[j]) * t;
    }
    for (let i = 0; i < NSP - 1; i++) {
      let h = Math.atan2(y[i] - y[i + 1], x[i] - x[i + 1]);
      if (i > 0) h += Math.PI * 2 * Math.round((th[i - 1] - h) / (Math.PI * 2));
      th[i] = h;
    }
    th[NSP - 1] = th[NSP - 2];
    for (let i = 0; i < NSP - 1; i++) k[i] = -(th[i + 1] - th[i]) / DS;
    k[NSP - 1] = k[NSP - 2];
  }

  private buildSpine(p: Pose) {
    const { sx, sy, sth } = this, rest = this.rest;
    this.buildRest(p);
    // integrate the swimming spine from the head on the resting curvature plus the wave
    sx[0] = 0; sy[0] = 0; sth[0] = rest.th[0];
    for (let i = 0; i < NSP - 1; i++) {
      const kk = rest.k[i] + this.wave((i + 0.5) * DS, p, p.amp);
      sth[i + 1] = sth[i] - kk * DS;
      const tm = 0.5 * (sth[i] + sth[i + 1]);
      sx[i + 1] = sx[i] - DS * Math.cos(tm);
      sy[i + 1] = sy[i] - DS * Math.sin(tm);
    }
    // keep the resting centre of mass and mean heading, so the head recoils against every stroke of the
    // tail and the koi never drifts out of its half of the disc
    let rx = 0, ry = 0, rth = 0, wx = 0, wy = 0, wth = 0;
    for (let i = 0; i < NSP; i++) {
      rx += MASS[i] * rest.x[i]; ry += MASS[i] * rest.y[i]; rth += MASS[i] * rest.th[i];
      wx += MASS[i] * sx[i]; wy += MASS[i] * sy[i]; wth += MASS[i] * sth[i];
    }
    rx /= MASS_SUM; ry /= MASS_SUM; rth /= MASS_SUM; wx /= MASS_SUM; wy /= MASS_SUM; wth /= MASS_SUM;
    const rot = rth - wth, c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < NSP; i++) {
      const x = sx[i] - wx, y = sy[i] - wy;
      sx[i] = rx + c * x - s * y;
      sy[i] = ry + s * x + c * y;
      sth[i] += rot;
    }
  }

  /** Spine sample at arc length s: position and heading. */
  private at(s: number): [number, number, number] {
    const f = Math.min(NSP - 1.0001, Math.max(0, s / DS));
    const i = Math.floor(f), t = f - i;
    return [this.sx[i] + (this.sx[i + 1] - this.sx[i]) * t, this.sy[i] + (this.sy[i + 1] - this.sy[i]) * t, this.sth[i] + (this.sth[i + 1] - this.sth[i]) * t];
  }

  update(p: Pose): KoiFrame {
    this.buildSpine(p);
    const f = this.f;
    // wrapped, so the shader (float32) sees the same phase on every loop
    f.psi = ((p.psi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    const grow = (x: number, y: number, r: number) => { minX = Math.min(minX, x - r); maxX = Math.max(maxX, x + r); minY = Math.min(minY, y - r); maxY = Math.max(maxY, y + r); };

    for (let i = 0; i < NB; i++) {
      const u = nodeU(i);
      const [x, y] = this.at(u * BODY_L);
      const r = W_MAX * widthAt(u);
      f.body.set([x, y, r, u], i * 4);
      grow(x, y, r);
    }

    const ped = W_MAX * widthAt(1);
    for (let i = 0; i < NT; i++) {
      const a = (i / (NT - 1)) * 1.06;
      let [x, y, th] = this.at(BODY_L - 0.012 + Math.min(a, 1) * TAIL_L);
      // past the tip, run straight on so no segment collapses to a point
      if (a > 1) { x -= Math.cos(th) * (a - 1) * TAIL_L; y -= Math.sin(th) * (a - 1) * TAIL_L; }
      // butterfly caudal: the half-span opens fast behind the peduncle, spreads on the stroke and
      // gathers in the glide
      const breathe = 1 + 0.1 * p.amp * Math.sin(glide(p.psi - WAVE_K - 0.6) - 1.6 * a);
      const span = ped * 0.9 + 0.26 * TAIL_L * Math.pow(smooth(0, 0.75, a), 0.8) * breathe;
      f.tail.set([x, y, span, a], i * 4);
      grow(x, y, span + 0.07);
    }
    const [tx, ty, tth] = this.at(BODY_L + TAIL_L);
    f.tip = [tx, ty, tth];

    // paired fins are silk: the root sweeps out in the glide and folds back on the stroke; every point
    // along the fin takes the root's angle from a moment earlier, so the tip trails, overshoots, and
    // the whole fin curves back toward the tail
    const fins = [
      { u: 0.2, len: 0.25, chord: 0.056, fold: 0.7, flare: 0.8, lag: 1.3, trail: 0.36, ph: 0.6 },
      { u: 0.53, len: 0.13, chord: 0.028, fold: 0.4, flare: 0.5, lag: 1.0, trail: 0.28, ph: 2.0 },
    ];
    const rootAngle = (o: typeof fins[0], ph: number) => o.fold + o.flare * p.amp * Math.pow(0.5 - 0.5 * Math.cos(glide(ph)), 1.25);
    let k = 0;
    for (const o of fins) for (let side = 0; side < 2; side++, k++) {
      const sg = side ? -1 : 1;
      const [bx, by, th] = this.at(o.u * BODY_L);
      const w = W_MAX * widthAt(o.u);
      const tX = Math.cos(th), tY = Math.sin(th), nx = -Math.sin(th) * sg, ny = Math.cos(th) * sg;
      let cx = bx + nx * w * 0.8 - tX * w * 0.1, cy = by + ny * w * 0.8 - tY * w * 0.1;
      const seg = (o.len * BODY_L) / (FP - 1);
      // the two sides are a little out of step, so the pair never moves as one rigid piece
      const ph = p.psi + o.ph + side * 0.45;
      for (let i = 0; i < FP; i++) {
        const a = i / (FP - 1);
        const beta = rootAngle(o, ph - o.lag * a) * (1 - 0.25 * a) - o.trail * a * a
          + 0.05 * a * a * Math.sin(2 * ph - 4 * a + sg);
        // a rounded leaf: broad near the root, a soft round tip
        const c = BODY_L * o.chord * (0.45 + 0.55 * Math.sin(Math.PI * Math.min(1, 0.15 + 0.75 * a))) * (1 - 0.15 * a);
        f.fins.set([cx, cy, c, a], (k * FP + i) * 4);
        grow(cx, cy, c);
        const dx = -tX * Math.cos(beta) + nx * Math.sin(beta), dy = -tY * Math.cos(beta) + ny * Math.sin(beta);
        cx += dx * seg; cy += dy * seg;
      }
    }

    // eyes sit out on the sides of the head, near its outline; the tancho is a small round spot on the
    // dorsal midline, between and well behind them (never beside an eye, or the koi read as red-eyed);
    // two short barbels at the corners of the mouth trail back with the water
    {
      const u = 0.065;
      const [x, y, th] = this.at(u * BODY_L);
      const w = W_MAX * widthAt(u), nx = -Math.sin(th), ny = Math.cos(th);
      f.eyes = [x + nx * w * 0.68, y + ny * w * 0.68, x - nx * w * 0.68, y - ny * w * 0.68];
      const [cx, cy, cth] = this.at(0.112 * BODY_L);
      // a real tancho: a round red spot covering much of the top of the head
      f.crown = [cx, cy, TANCHO_R, cth];
      const [mx, my, mth] = this.at(0.012 * BODY_L);
      const mw = W_MAX * widthAt(0.012);
      for (let side = 0; side < 2; side++) {
        const sg = side ? -1 : 1, bnx = -Math.sin(mth) * sg, bny = Math.cos(mth) * sg;
        const rx = mx + bnx * mw * 0.7, ry = my + bny * mw * 0.7;
        // out to the side and a little back, flicking with the stroke
        const a = 0.95 + 0.25 * Math.sin(p.psi + 1.2 + side * 0.8);
        const L = 0.045;
        const dx = Math.cos(mth) * Math.cos(a) * 0.6 + bnx * Math.sin(a), dy = Math.sin(mth) * Math.cos(a) * 0.6 + bny * Math.sin(a);
        f.barbels.set([rx, ry, rx + dx * L, ry + dy * L], side * 4);
      }
      const [gx, gy, gth] = this.at(GILL_U * BODY_L);
      f.gill = [gx, gy, gth, W_MAX * widthAt(GILL_U)];
      const [, , ths] = this.at(0.33 * BODY_L);
      f.flow = [Math.cos(ths), Math.sin(ths)]; // heading: the spine is laid tail-ward along -tangent
    }
    f.bound = [(minX + maxX) / 2, (minY + maxY) / 2, Math.hypot(maxX - minX, maxY - minY) / 2];
    return f;
  }
}
