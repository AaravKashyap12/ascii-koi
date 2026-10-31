// Pass 1: one fragment per glyph cell. Samples the two koi analytically (SDF along their swimming
// spines) and shape-matches six samples against all 95 glyphs near them. A second target carries the
// page layer: how far the water moves the letter that lives in this cell (sub-cell, so the glyph pass
// can draw it bent around the fish), how dark it is set, and how much of the page shows through here.
// Pass structure, glyph matching (six points, contrast boost, hash dither) and the data-texture
// encoding are adapted from SiddDevZ/horizon scene.frag.js (MIT, © 2026 Siddharth Meena).
import { MAX_RINGS, gIndex } from '../config';
import { BODY_L, EYE_R, FP, GILL_U, NB, NF, NT, TAIL_L, W_MAX } from '../koi';

const f = (x: number) => x.toFixed(5);

// page letters may move at most this far (cells) so the glyph pass can gather them from a 5x3 window;
// the offset is stored as 0.5 + d / SCALE in an 8-bit channel (1/64 cell steps)
// The koi themselves, as GLSL shared by the scene pass (which decides each cell) and the glyph pass
// (which cuts each letter exactly along the koi's edges, its streaks and the white koi's outline).
const glyphList = (t: string) => [...t].map(gIndex);
const arr = (a: number[]) => `int[${a.length}](${a.join(', ')})`;
// the black koi's letters (the condensed ink cut): solid capitals for the wash and, at the edges, the
// letters and ticks whose ink sits to one side of the cell
const INK = glyphList("NHM[]LJTFPbdqp/\\\\'\".,_-");
// the white koi's outline: line characters
const LINE = glyphList("-_|/\\\\()'.,");
// the streaks (each koi carries the other's colour): stroke shapes only, so a streak is a brush mark
const PALE = glyphList("=-_/\\\\'.,:");

export const KOI_GLSL = `
// the koi's shadow on the pond floor: down and to the right (the light is top left), soft-edged
#define SHADOW_OFF vec2(0.05, -0.075)
#define NB ${NB}
#define NT ${NT}
#define NF ${NF}
#define FP ${FP}
#define BODY_L ${f(BODY_L)}
#define TAIL_L ${f(TAIL_L)}
#define W_MAX ${f(W_MAX)}
#define HAIR_S 0.05
uniform vec4 uBody[NB * 2];
uniform vec4 uTail[NT * 2];
uniform vec4 uFin[NF * FP * 2];
uniform vec4 uEye[2];
uniform vec4 uCrown[2];   // x, y, radius, heading
uniform vec4 uGill[2];    // spine at the gill covers: x, y, heading, half-width
uniform vec4 uTip[2];     // caudal tip x, y, heading, swim phase of that koi
uniform vec4 uBound[2];
uniform vec4 uSwim;      // loop phase (2 pi per loop), amp, surf, wake strength

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 x){
  vec2 i = floor(x), fr = fract(x); fr = fr * fr * (3.0 - 2.0 * fr);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), fr.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), fr.x), fr.y);
}
float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
// the beat's quick stroke and long glide (same warp as koi.ts)
float glide(float th){ return th + 0.42 * sin(th); }

// signed distance (in units of the body's half-width, positive inside) to one streak
float streakD(float u, float v, float u0, float u1, float vc, float wd){
  float x = (u - u0) / (u1 - u0);
  float taper = pow(sin(3.14159265 * clamp(x, 0.0, 1.0)), 0.7) * (1.0 - 0.35 * x);
  float c = vc + 0.07 * sin(x * 5.0 + vc * 9.0);
  return x <= 0.0 || x >= 1.0 ? -1.0 : 0.8 * wd * taper - abs(v - c);
}
// (the same pattern on both: black streaks on the white koi answer the white streaks on the black one)
float streakDist(float u, float v){
  return max(streakD(u, v, 0.26, 0.52, 0.5, 0.12), streakD(u, v, 0.44, 0.68, -0.46, 0.1));
}
float whiteAt(float u, float v){ return step(0.0, streakDist(u, v)); }
// the streak nearest this point as a brush stroke: signed offset from its centreline and its half-width
// (both in units of the body's half-width)
vec2 streakLineOf(float u, float v, float u0, float u1, float vc, float wd){
  float x = (u - u0) / (u1 - u0);
  float taper = pow(sin(3.14159265 * clamp(x, 0.0, 1.0)), 0.7) * (1.0 - 0.35 * x);
  float c = vc + 0.07 * sin(x * 5.0 + vc * 9.0);
  return vec2(v - c, x <= 0.0 || x >= 1.0 ? 0.0 : 0.8 * wd * taper);
}
vec2 streakLine(float u, float v){
  vec2 a = streakLineOf(u, v, 0.26, 0.52, 0.5, 0.12), b = streakLineOf(u, v, 0.44, 0.68, -0.46, 0.1);
  return a.y - abs(a.x) > b.y - abs(b.x) ? a : b;
}

// bokashi: wet, dark ink on the head and down the flanks, a slightly lighter sheen along the back
// (the body is round), a light line where the gill cover lifts, and the brush running dry toward the
// tail in hairs that follow the body. All in body coordinates, so the gradation swims with the fish.
float bodyTone(float u, float v){
  float av = abs(v);
  float t = 1.0;
  t -= 0.17 * exp(-(v * v) / 0.09) * smoothstep(0.14, 0.26, u) * (1.0 - smoothstep(0.6, 0.86, u));
  float gu = ${f(GILL_U)} + 0.035 * (1.0 - av * av);
  t -= 0.3 * exp(-pow((u - gu) / 0.014, 2.0)) * smoothstep(0.25, 0.5, av) * (1.0 - smoothstep(0.88, 1.0, av));
  float dry = smoothstep(0.58, 0.97, u);
  float hn = vnoise(vec2(v * 8.0, u * 2.4));
  t -= dry * 0.5 * smoothstep(0.45, 0.75, hn);
  return clamp(t, 0.0, 1.0);
}

float tailEdge(float b){
  return b < 0.72 ? 0.5 + 0.5 * pow(sin(b / 0.72 * 1.5707963), 1.4) : 1.0 - 0.35 * pow((b - 0.72) / 0.28, 2.0);
}

struct K {
  float ink;    // coverage-based ink for shape matching (no texture)
  float crown; float body; float sd; vec2 away; float dAny; float under;
  vec2 dir;     // stroke direction here: along the spine, a tail ray or a fin
  float lineD;  // world distance to the nearest flow line / ray
  float stroky; // 0 = solid ink, 1 = frayed into strokes
  float fade;   // ink strength of strokes (silk thins toward the edges)
  float flow;   // 1 where a body flow line may run
  vec3 bq;      // body coordinates: u along (0 snout, 1 peduncle), v across (-1..1), local half-width
  float tone;   // ink tone of the wash here (bokashi), 0..1
  float hair;   // dry-brush tips: +2 inside the tip zone, +1 where this hair is not broken
  float who;    // which koi: 0 the black one, 1 the white one
  float strk;   // signed distance to a streak of the other koi's colour (world, positive inside)
  vec4 strk2;   // the two streaks as strokes: signed offset from each centreline and its half-width (world)
};

// one koi at world point p. aa is the edge softness in world units
K koiAt(vec2 p, int k, float aa){
  K r = K(0.0, 0.0, 0.0, 1e3, vec2(0.0), 1e3, 0.0, vec2(1.0, 0.0), 1e3, 0.0, 1.0, 0.0, vec3(0.0, 0.0, 1.0), 1.0, 0.0, float(k), -1.0, vec4(3.0, 0.0, 3.0, 0.0));
  vec4 bd = uBound[k];
  float far = length(p - bd.xy) - bd.z;
  if (far > 0.14) { r.dAny = far; r.sd = far; r.away = normalize(p - bd.xy); return r; }
  float psi = uTip[k].w, amp = uSwim.y;

  // body: union of tapered capsules along the spine
  float best = 1e9, bu = 0.0, bv = 0.0, brr = 1.0; vec2 bax = vec2(0.0, 1.0), btn = vec2(1.0, 0.0);
  float spD = 1e9; vec3 sq = vec3(0.0, 0.0, 1.0);
  for (int i = 0; i < NB - 1; i++) {
    vec4 A = uBody[k * NB + i], B = uBody[k * NB + i + 1];
    vec2 ab = B.xy - A.xy, ap = p - A.xy;
    float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);
    vec2 q = A.xy + ab * t;
    float rr = mix(A.z, B.z, t);
    float d = length(p - q) - rr;
    if (d < best) {
      best = d; bu = mix(A.w, B.w, t); brr = rr;
      vec2 tn = normalize(ab);
      bv = (tn.x * (p.y - q.y) - tn.y * (p.x - q.x)) / max(rr, 1e-4);
      bax = p - q;
    }
    // smooth body coordinates for the scales: the nearest point of the spine itself
    float dsp = length(p - q);
    if (dsp < spD) {
      spD = dsp; vec2 tn = normalize(ab);
      sq = vec3(mix(A.w, B.w, t), (tn.x * (p.y - q.y) - tn.y * (p.x - q.x)) / max(rr, 1e-4), rr); btn = tn;
    }
  }
  float bcov = smoothstep(aa, -aa, best);
  float wh = whiteAt(bu, bv);
  // the body is solid; its streaks are the other koi's colour (drawn by the glyph pass)
  float bodyInk = 1.0;
  // dry-brush flow lines: a few broken strokes running along the body at fixed fractions of its
  // width, so they follow the contour into the peduncle and slide along themselves as it swims
  float fv = abs(bv);
  float lineV = fv < 0.55 ? 0.34 : 0.74;
  float present = smoothstep(0.4, 0.5, vnoise(vec2(bu * 9.0 + (bv > 0.0 ? 5.3 : 0.0), lineV * 7.0)));
  float bodyLineD = abs(fv - lineV) * brr;
  float bodyFlow = present * smoothstep(0.1, 0.18, bu) * (1.0 - smoothstep(0.82, 0.9, bu)) * (1.0 - smoothstep(0.05, 0.2, wh));

  // caudal fin: butterfly fork, outer lobes trailing the centre line; a ripple runs out to the edges
  float tb = 1e9, ta = 0.0, tn = 0.0, tsp = 1.0; vec2 tdir = vec2(1.0, 0.0);
  for (int i = 0; i < NT - 1; i++) {
    vec4 A = uTail[k * NT + i], B = uTail[k * NT + i + 1];
    vec2 ab = B.xy - A.xy, ap = p - A.xy;
    float traw = dot(ap, ab) / max(dot(ab, ab), 1e-9);
    float t = clamp(traw, 0.0, 1.0);
    vec2 q = A.xy + ab * t;
    float d = length(p - q);
    if (d < tb) {
      // ahead of the root the fin does not exist: keep a negative a so it is cut off there
      tb = d; ta = mix(A.w, B.w, i == 0 ? min(traw, 1.0) : t); tsp = mix(A.z, B.z, t);
      vec2 dn = ab / max(length(ab), 1e-6);
      tn = dn.x * (p.y - q.y) - dn.y * (p.x - q.x);
      tdir = dn;
    }
  }
  float b0 = abs(tn) / tsp;
  float lag = TAIL_L * pow(max(ta, 0.0), 1.5) * (0.12 * amp * sin(glide(psi - 6.0 - 2.6 * ta - 1.1 * b0)) + 0.02 * sin(2.0 * psi - 4.0 * ta + 2.2 * b0));
  float n2 = tn - lag;
  float b = abs(n2) / tsp;
  float rag = (vnoise(vec2(b * 9.0, ta * 3.0)) - 0.5) * 0.1;
  float edge = tailEdge(min(b, 1.0)) + rag;
  float tm = min(tsp - abs(n2), (edge - ta) * TAIL_L);
  float tcov = smoothstep(-aa, aa, tm) * smoothstep(-aa, aa, ta * TAIL_L);
  float tfr = ta / max(edge, 0.3);
  // dry brush at the trailing edge: the ink parts into hairs that run with the fin, a couple of cells
  // apart and broken along their length (in the fin's own coordinates, so the hairs swim with it)
  float tHairZ = smoothstep(0.74, 0.9, tfr);
  float thi = floor(n2 / HAIR_S + 0.5);
  float tHairD = abs(n2 - thi * HAIR_S);
  float tHairOn = step(0.46, vnoise(vec2(thi * 3.1, ta * 17.0)));
  // silk: solid at the root, thinning toward the trailing edge
  float tailFade = 1.0 - 0.45 * smoothstep(0.6, 1.0, tfr);
  float tailInk = tcov * 0.97 * tailFade;

  // paired fins: soft leaves, rays along their length, translucent at the tips
  float fb = 1e9, fa = 0.0, fl = 0.0, fc = 1.0; vec2 fdir = vec2(1.0, 0.0);
  for (int j = 0; j < NF; j++) for (int i = 0; i < FP - 1; i++) {
    vec4 A = uFin[(k * NF + j) * FP + i], B = uFin[(k * NF + j) * FP + i + 1];
    vec2 ab = B.xy - A.xy, ap = p - A.xy;
    float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);
    vec2 q = A.xy + ab * t;
    float c = mix(A.z, B.z, t);
    float d = length(p - q) - c;
    if (d < fb) {
      fb = d; fa = mix(A.w, B.w, t); fc = c;
      vec2 dn = ab / max(length(ab), 1e-6);
      fl = (dn.x * (p.y - q.y) - dn.y * (p.x - q.x)) / max(c, 1e-4);
      fdir = dn;
    }
  }
  float fcov = smoothstep(aa, -aa, fb);
  float finFade = 1.0 - 0.4 * smoothstep(0.55, 1.0, fa);
  // the same dry brush at the fin tips, hairs along the fin
  float fHairZ = smoothstep(0.62, 0.88, fa);
  float fhi = floor(fl * fc / HAIR_S + 0.5);
  float fHairD = abs(fl * fc - fhi * HAIR_S);
  float fHairOn = step(0.46, vnoise(vec2(fhi * 2.7, fa * 11.0)));
  float finInk = fcov * 0.9 * finFade;

  float under = max(tailInk, finInk);
  r.under = under * (1.0 - bcov);
  r.ink = mix(under, bodyInk, bcov);
  r.body = bcov;
  // in the spine's own coordinates, which run on smoothly from one body segment to the next
  r.strk = bcov > 0.5 ? streakDist(sq.x, sq.y) * sq.z : -1.0;
  r.strk2 = vec4(streakLineOf(sq.x, sq.y, 0.26, 0.52, 0.5, 0.12), streakLineOf(sq.x, sq.y, 0.44, 0.68, -0.46, 0.1)) * sq.z;
  if (bcov > 0.5 || under < 0.02) {
    r.dir = btn; r.lineD = bodyLineD; r.stroky = 0.0; r.fade = 1.0; r.flow = bodyFlow * step(0.5, bcov);
    r.tone = bodyTone(sq.x, sq.y);
  } else if (tailInk >= finInk) {
    r.dir = tdir; r.lineD = tHairD; r.fade = tailFade; r.hair = tHairOn + 2.0 * step(0.5, tHairZ); r.tone = mix(0.86 * tailFade, bodyTone(sq.x, sq.y), bcov);
  } else {
    r.dir = fdir; r.lineD = fHairD; r.fade = finFade; r.hair = fHairOn + 2.0 * step(0.5, fHairZ); r.tone = mix(0.84 * finFade, bodyTone(sq.x, sq.y), bcov);
  }
  vec4 cr = uCrown[k];
  vec2 cq = p - cr.xy;
  cq = vec2(dot(cq, vec2(cos(cr.w), sin(cr.w))), dot(cq, vec2(-sin(cr.w), cos(cr.w))));
  float ca = atan(cq.y, cq.x);
  // read closer, the tancho opens to a rounded patch a few letters across and two or three lines deep,
  // so it is written in the poem's own letters, in vermilion
  float crad = cr.z * mix(0.96, 1.22, uLod) * (1.0 + 0.025 * sin(3.0 * ca + 1.0));
  r.crown = smoothstep(aa, -aa, length(cq / vec2(1.08, 0.96)) - crad) * bcov;
  r.sd = best;
  r.bq = sq;
  r.away = normalize(bax);
  // body, fins and tail joined smoothly, so no sliver of water opens where a fin's root meets the body
  r.dAny = smin(best, smin(fb, max(tb - tsp, -tm), 0.02), 0.025);
  return r;
}

// the koi whose ink is here wins the strokes; the nearest body pushes the page
K both(vec2 p, float aa){
  K a = koiAt(p, 0, aa), c = koiAt(p, 1, aa);
  K r = c;
  if (a.ink > c.ink || (a.ink == c.ink && a.sd < c.sd)) r = a;
  if (a.sd < c.sd) { r.sd = a.sd; r.away = a.away; } else { r.sd = c.sd; r.away = c.away; }
  r.crown = max(a.crown, c.crown); r.body = max(a.body, c.body); r.under = max(a.under, c.under);
  r.dAny = min(a.dAny, c.dAny);
  return r;
}
float shadowAt(K sh){ float s = smoothstep(0.06, -0.07, min(sh.sd, sh.dAny + 0.015)); return s * s * (3.0 - 2.0 * s); }

`;

export const MAX_DX = 1.9, MAX_DY = 0.95, DX_SCALE = 4, DY_SCALE = 2;

export const SCENE_FS = `#version 300 es
precision highp float;
precision highp int;
layout(location = 0) out vec4 o0;
layout(location = 1) out vec4 o1;
layout(location = 2) out vec4 o2; // the water for the painted view: its slope here, and the koi's shadow
#define MAXR ${MAX_RINGS}
uniform vec2 uGrid, uCell, uGridPx;
uniform float uUnit;
uniform vec4 uRing[MAXR];  // x, y, packet radius, amplitude
uniform vec4 uRingP[MAXR]; // packet half-width, wave number
uniform int uRingN;
uniform float uPageTone, uLod;
uniform sampler2D uShape; // each glyph's ink at the six sample points: rows 0-1 regular (normalised), 2-3 ink cut, 4-5 bold
uniform vec4 uBox; // the typeset page, in cells: first col, first row, end col, end row
${KOI_GLSL}

// six sampling points per cell
const vec2 SP[6] = vec2[6](vec2(0.28, 0.2), vec2(0.72, 0.2), vec2(0.28, 0.5), vec2(0.72, 0.5), vec2(0.28, 0.8), vec2(0.72, 0.8));

const int INK[${INK.length}] = ${arr(INK)};
const int LINE[${LINE.length}] = ${arr(LINE)};
const int PALE[${PALE.length}] = ${arr(PALE)};
vec2 toGridPx(vec2 w){ return vec2(w.x, -w.y) * uUnit + uGridPx * 0.5; }
vec2 cellOf(vec2 w){ return floor(toGridPx(w) / uCell); }

// the glyph of a vocabulary whose ink at the six points best matches v (blank if none beats empty paper)
float shapeD(int g, int set, vec4 v0, vec2 v1){
  vec4 a = texelFetch(uShape, ivec2(g, set * 2), 0); vec2 b = texelFetch(uShape, ivec2(g, set * 2 + 1), 0).xy;
  vec4 da = a - v0; vec2 db = b - v1;
  return dot(da, da) + dot(db, db);
}
// the koi's ink: the ink-cut letter whose own ink lies where the koi covers the cell (absolute coverage),
// so a silhouette or a streak's edge is drawn by the shapes of the letters themselves
int matchInk(float v[6]){
  vec4 v0 = vec4(v[0], v[1], v[2], v[3]); vec2 v1 = vec2(v[4], v[5]);
  float bestD = dot(v0, v0) + dot(v1, v1); int gi = 0;
  for (int n = 0; n < ${INK.length}; n++) { float d = shapeD(INK[n], 1, v0, v1); if (d < bestD) { bestD = d; gi = INK[n]; } }
  return gi;
}
// a streak through the cell: the stroke shape (ink cut, absolute coverage) that matches it
int matchPale(float v[6]){
  vec4 v0 = vec4(v[0], v[1], v[2], v[3]); vec2 v1 = vec2(v[4], v[5]);
  float bestD = dot(v0, v0) + dot(v1, v1); int gi = 0;
  for (int n = 0; n < ${PALE.length}; n++) { float d = shapeD(PALE[n], 1, v0, v1); if (d < bestD) { bestD = d; gi = PALE[n]; } }
  return gi;
}
// a line through the cell (the white koi's outline): the line character whose strokes lie on it, matched
// on the regular face normalised per point with a contrast boost, as in horizon
int matchLine(float v[6]){
  float m = max(max(max(v[0], v[1]), max(v[2], v[3])), max(v[4], v[5]));
  vec4 v0 = vec4(v[0], v[1], v[2], v[3]) / m; vec2 v1 = vec2(v[4], v[5]) / m;
  v0 = pow(v0, vec4(1.8)); v1 = pow(v1, vec2(1.8));
  float bestD = 1e9; int gi = 0;
  for (int n = 0; n < ${LINE.length}; n++) { float d = shapeD(LINE[n], 0, v0, v1); if (d < bestD) { bestD = d; gi = LINE[n]; } }
  return gi;
}
// A line through the cell, drawn the way ASCII line art is drawn by hand: one character per column where
// the line runs shallow (per row where it runs steep), chosen by its angle and where it crosses the cell.
// f holds a field at the six sample points, in cell heights, whose zero is the line; the plane through
// them gives the line's place and slope. Returns 0 when the line is not this cell's to draw. side > 0
// says which way the field rises (the inside of a contour), for the bracket on steep stretches.
float lineAng = 0.0; // the angle of the last line drawn (0 level, 90 upright)
int lineGlyph(float f[6], out float yIn){
  float gx = ((f[1] + f[3] + f[5]) - (f[0] + f[2] + f[4])) / 3.0 / 0.44; // per cell width
  float gy = ((f[4] + f[5]) - (f[0] + f[1])) / 2.0 / 0.6;                // per cell height (down)
  float f0 = (f[0] + f[1] + f[2] + f[3] + f[4] + f[5]) / 6.0;
  // the gradient in screen pixels (x across, y down)
  vec2 g = vec2(gx / uCell.x, gy / uCell.y);
  float ang = atan(abs(g.x), abs(g.y)) * 57.29578; // 0: the line runs level, 90: it stands upright
  lineAng = ang;
  yIn = 0.5;
  // (a '/' stands at ~61 degrees in this cell, so it only joins up on lines at least ~52 degrees steep;
  // anything shallower is a staircase of '_' and '-')
  if (ang < 52.0) {
    // shallow: this column's crossing must fall inside this cell
    float dy = -f0 / gy; // in cell heights from the centre
    // each column's crossing is drawn in the cell whose lower part it falls in: '_' on the floor of the
    // cell, '-' across its middle (never a dotted run of ' or .)
    if (!(dy > -0.32 && dy <= 0.68)) return 0;
    yIn = 0.5 + dy;
    return yIn > 0.74 ? ${gIndex('_')} : ${gIndex('-')};
  }
  float dx = -f0 / gx; // in cell widths
  if (!(dx > -0.5 && dx <= 0.5)) return 0;
  if (ang < 76.0) return (gx > 0.0) == (gy > 0.0) ? ${gIndex('/')} : ${gIndex('\\')};
  // standing: a bracket bowed away from the inside
  return gx > 0.0 ? ${gIndex('(')} : ${gIndex(')')};
}
float mn6(float a[6]){ return min(min(min(a[0], a[1]), min(a[2], a[3])), min(a[4], a[5])); }
vec2 toWorld(vec2 gp){ vec2 q = (gp - uGridPx * 0.5) / uUnit; return vec2(q.x, -q.y); }

// streaks: a few slender brush strokes laid along the flanks, as in the ink painting. Each one
// starts and lifts with a taper and wavers a little across the body; never a patch or a hole
// ---------- the pond: a height field ----------
// The surface is the sum of every wave on it, so where two meet they interfere. Rings are dispersive
// packets (water.ts): crests run through the packet at twice its speed, born at its back and fading at
// its front, with the longer waves leading. Each tail trails a wake along the orbit: the two arms of a
// V opening behind it, still in the fish's own frame, so the wake travels with the fish.
float height(vec2 p, out vec2 outw){
  float h = 0.0, best = 0.0;
  outw = vec2(0.0, 1.0);
  for (int i = 0; i < MAXR; i++) {
    if (i >= uRingN) break;
    vec4 R = uRing[i]; vec4 P = uRingP[i];
    vec2 dv = p - R.xy;
    float d = length(dv);
    float x = (d - R.z) / P.x;
    if (abs(x) > 3.0) continue;
    // (a ring shows once it has opened out, never as a knot of marks round its centre)
    float env = R.w * exp(-x * x) * (1.0 - exp(-pow(d / (0.6 * P.x), 2.0))) * smoothstep(0.03, 0.1, R.z);
    float k = P.y * clamp(1.0 - 0.22 * x, 0.6, 1.6);
    h += env * cos(k * (d - 2.0 * R.z));
    if (env > best) { best = env; outw = dv / max(d, 1e-5); }
  }
  float surf = uSwim.z;
  for (int k = 0; k < 2; k++) {
    vec4 tp = uTip[k];
    float rt = length(tp.xy), rp = length(p);
    float back = mod(atan(tp.y, tp.x) - atan(p.y, p.x), 6.2831853) * rt;
    if (back > 1.8) continue;
    float x = rp - rt, ax = abs(x);
    // the two arms of the V, each a single soft ridge whose line is where it crosses rest level; a slow
    // swell runs along them, and they widen and fade behind the fish
    float arm = 0.3 * back, w = 0.016 + 0.05 * back;
    float y = (ax - arm) / w;
    float env = 0.9 * uSwim.w * surf * exp(-back / 0.85) * smoothstep(0.02, 0.16, back) * (0.75 + 0.25 * cos(26.0 * back - 0.8 * tp.w));
    h += env * y * exp(-y * y);
    float e = env * exp(-y * y);
    // (the ridge rises away from the arm, so its line is kept by pointing the reference back across it)
    if (e > best) { best = e; outw = -p / max(rp, 1e-5) * sign(x + 1e-6); }
  }
  return h;
}
float height(vec2 p){ vec2 o; return height(p, o); }

// a short stroke of a curve whose outward normal on screen (in cells, y down) is n: - along its top,
// _ along its bottom, ( ) up its sides and ' , . at the shoulders
int arcGlyph(vec2 n){
  float a = atan(n.y, n.x) * 57.29578;
  if (a < 0.0) a += 360.0;
  if (a < 30.0 || a >= 330.0) return ${gIndex(')')};
  if (a < 62.0) return ${gIndex('.')};
  if (a < 118.0) return ${gIndex('_')};
  if (a < 150.0) return ${gIndex(',')};
  if (a < 210.0) return ${gIndex('(')};
  if (a < 242.0) return ${gIndex("'")};
  if (a < 298.0) return ${gIndex('-')};
  return ${gIndex("'")};
}

// the koi's letter: a capital of the condensed ink cut, N or H in a checker, which fills its cell edge to
// edge so the wash is one continuous ink texture; how light the ink is (the sheen, the fins, the drying
// tips) comes only from its strength, so a grey fin reads as thinner ink, never as a word
// tone as type: the ink-cut letter whose coverage matches t (measured: N H .9, E .68, F .61, T .59,
// L .55, J .51, I .49, i l .38, ! .34, | .21, : .12, . .06), two letters per step in a checker; all
// upright, so the wash keeps one grain from the wettest ink to the driest
int rampGlyph(float t, vec2 cid){
  bool odd = mod(cid.x + cid.y, 2.0) > 0.5;
  float tt = t + (hash(cid + 61.0) - 0.5) * 0.04;
  if (tt > 0.8) return odd ? ${gIndex('H')} : ${gIndex('N')};
  if (tt > 0.645) return odd ? ${gIndex('E')} : ${gIndex('F')};
  if (tt > 0.57) return odd ? ${gIndex('T')} : ${gIndex('L')};
  if (tt > 0.5) return odd ? ${gIndex('J')} : ${gIndex('I')};
  if (tt > 0.36) return odd ? ${gIndex('i')} : ${gIndex('l')};
  if (tt > 0.27) return odd ? ${gIndex('!')} : ${gIndex('|')};
  if (tt > 0.16) return ${gIndex('|')};
  if (tt > 0.09) return odd ? ${gIndex(':')} : ${gIndex(';')};
  return odd ? ${gIndex('.')} : ${gIndex(',')};
}
int inkGlyph(float t, vec2 cid){
  return mod(cid.x + cid.y, 2.0) > 0.5 ? ${gIndex('H')} : ${gIndex('N')};
}

void main(){
  ivec2 fc = ivec2(gl_FragCoord.xy);
  float row = uGrid.y - 1.0 - float(fc.y);
  vec2 cid = vec2(float(fc.x), row);
  vec2 cellTL = cid * uCell;
  float hc = hash(cid + 17.0);
  vec2 pc = toWorld(cellTL + uCell * 0.5);
  float cellW = uCell.y / uUnit;
  float aa = 0.22 * cellW;
  float surf = uSwim.z;

  // the water's slope here: it bends the light, so the fish below and the page shift a little under
  // every wave that passes (and the wave's lines are drawn from it below)
  float e1 = 0.3 * cellW;
  float h0 = height(pc);
  vec2 slope = vec2(height(pc + vec2(e1, 0.0)) - h0, height(pc + vec2(0.0, e1)) - h0) / e1;
  vec2 refr = -slope * 1.1e-4;
  K c0 = both(pc + refr, aa);
  bool near = c0.dAny < 1.6 * cellW && surf > 0.0;

  float s[6], cs[6], ps[6], es[6], sa[6], sb[6], wa = 0.0, wb = 0.0;
  float m = 0.0, mn = 1.0, tone = 0.0, crown = 0.0, cm = 0.0, pm = 0.0, pn = 1.0, em = 0.0;
  if (near) {
    for (int i = 0; i < 6; i++) {
      K ki = both(toWorld(cellTL + uCell * SP[i]) + refr, aa);
      s[i] = ki.ink; m = max(m, s[i]); mn = min(mn, s[i]); tone += s[i];
      // signed distances in cell heights (positive inside), unclamped near the edge, so a plane through the
      // six of them is the edge's own line and stays true a cell beyond it
      ps[i] = ki.who == c0.who ? clamp(ki.strk / cellW, -2.0, 2.0) : -2.0; pm = max(pm, ps[i]); pn = min(pn, ps[i]);
      es[i] = clamp(-ki.dAny / cellW, -2.0, 2.0); em = max(em, es[i]);
      // each streak's centreline (signed, in cell heights) and half-width, traced separately
      vec4 st = ki.who == c0.who && ki.body > 0.5 ? ki.strk2 / cellW : vec4(3.0, 0.0, 3.0, 0.0);
      sa[i] = clamp(st.x, -3.0, 3.0); sb[i] = clamp(st.z, -3.0, 3.0); wa += st.y / 6.0; wb += st.w / 6.0;
      cs[i] = ki.crown; crown += ki.crown; cm = max(cm, ki.crown);
    }
    tone /= 6.0; crown /= 6.0;
  }

  // the koi surface out of the water: each cell turns to ink at its own moment, the spine first, and
  // until then the water there darkens (and a letter it covers thickens)
  float inner = clamp(-c0.sd / (0.6 * W_MAX), 0.0, 1.0);
  // (from the depths: the ink deepens from the spine outward, every cell together, nothing flickers on)
  float emerge = smoothstep(0.0, 0.45, surf * 1.5 - 0.5 * (1.0 - inner));
  bool shown = surf > 0.0;
  float rise = 0.0;

  // ---------- the page layer: how the water moves the letter that lives here ----------
  // the slope of the surface bends the page beneath it; the fish part the letters as they pass: the page
  // just outside the body eases aside. Inside, the letters the koi is written in stay on their lines, so
  // read closer every line of the written body stays whole
  vec2 disp = -slope * 3.2e-4;
  disp += c0.away * 0.03 * exp(-max(c0.sd, 0.0) / 0.085) * step(0.0, c0.sd) * surf;
  disp *= mix(1.0, 0.35, step(c0.sd, 0.0) * surf);
  vec2 dc = clamp(vec2(disp.x, -disp.y) * uUnit / uCell, vec2(-${MAX_DX}, -${MAX_DY}), vec2(${MAX_DX}, ${MAX_DY}));

  // colour codes for the glyph pass: 0 ink, 1 vermilion, 2 the white koi's white, 3 the water's shade,
  // 4 the water's glint. Every cell is one character, with one weight, colour and strength.
  int gi = 0; float outT = 0.0, accent = 0.0, wgt = 0.0;
  float code = 0.0;
  bool inkCell = false, written = false, whiteText = false, pageOver = false, streakGap = false;
  bool over = false, overW = false;
  bool lodCell = hash(cid + 53.0) < smoothstep(0.5, 0.95, uLod);
  if (near && shown && em > -0.6) {
    bool bodyHere = c0.body > 0.5;
    bool white = c0.who > 0.5;
    float tn0 = c0.tone;
    // coverage at the six points, from the signed distances (a sample's disc is ~0.23 cell high)
    float cv[6], sc[6], ink[6];
    float cmn = 1.0, cmx = 0.0, smean = 0.0, emn = 9.0, emx = -9.0;
    for (int i = 0; i < 6; i++) {
      cv[i] = clamp(0.5 + es[i] / 0.23, 0.0, 1.0); sc[i] = clamp(0.5 + ps[i] / 0.23, 0.0, 1.0) * cv[i];
      cmn = min(cmn, cv[i]); cmx = max(cmx, cv[i]); smean += sc[i] / 6.0; emn = min(emn, es[i]); emx = max(emx, es[i]);
    }
    float strength = white
      ? (bodyHere ? 0.68 + 0.32 * (1.0 - smoothstep(0.2, 1.0, abs(c0.bq.y))) : 0.32 + 0.3 * c0.fade)
      : 0.42 + 0.58 * smoothstep(0.3, 0.95, tn0);
    // the contour: one clean line of characters in ink, at the strength of the ink beside it
    float yIn;
    int edgeG = lineGlyph(es, yIn);
    float e0 = (es[0] + es[1] + es[2] + es[3] + es[4] + es[5]) / 6.0;
    // a streak: one stroke of characters along its centreline, in the other koi's colour, typed over the
    // fish's own letter; '=' where the brush is full, '-' where it thins to its ends
    int strkG = 0;
    float yS;
    for (int q = 0; q < 2; q++) {
      float w = q == 0 ? wa : wb;
      if (strkG > 0 || w < 0.13) continue; // the brush stops where it thins below a hairline
      int g = q == 0 ? lineGlyph(sa, yS) : lineGlyph(sb, yS);
      if (g == ${gIndex('-')} || g == ${gIndex('_')}) g = w > 0.3 && lineAng < 16.0 ? ${gIndex('=')} : ${gIndex('-')};
      strkG = g;
    }
    if (edgeG > 0) {
      gi = edgeG; code = 0.0; wgt = 2.0;
      outT = white ? (bodyHere ? 0.9 : 0.75) : min(1.0, 0.25 + strength);
    } else if (e0 > 0.0) {
      if (strkG > 0 && e0 > 0.4) {
        // (in the heavy monospace cut, whose '=' and '-' nearly span the cell, so the stroke runs on)
        // (the black strokes on the white koi in a lighter cut and only '-', so they are as fine as the white
        // strokes read on the black koi)
        if (white && strkG == ${gIndex('=')}) strkG = ${gIndex('-')};
        gi = strkG; code = white ? 0.0 : 2.0; outT = white ? 0.85 : 1.0; wgt = white ? 1.0 : 2.0; over = true; overW = white; pageOver = !white;
      } else if (!white) {
        // the black koi: wet ink capitals in its body; its fins soft, in round letters of thinner ink
        gi = inkGlyph(1.0, cid);
        code = 0.0; wgt = 3.0; inkCell = true;
        outT = bodyHere ? 1.0 : 0.3 + 0.45 * strength;
      } else {
        // the white koi: white capitals, brightest along its back, thinning to round letters toward its
        // flanks and in its fins
        float wt = bodyHere ? 1.0 - smoothstep(0.35, 1.0, abs(c0.bq.y)) : 0.0;
        gi = inkGlyph(1.0, cid);
        code = 2.0; wgt = 3.0; inkCell = true;
        outT = bodyHere ? 0.6 + 0.4 * wt : 0.5;
      }
    }
    outT *= emerge;
    if (gi == 0) outT = 0.0;
    // read closer, the tancho's cells are written in vermilion (below)
    // (read closer the tancho is a round patch on the page: three letters, five, three)
    bool crownCell = false;
    for (int k = 0; k < 2; k++) {
      vec2 cg = toGridPx(uCrown[k].xy) / uCell, dq = cid + 0.5 - cg;
      crownCell = crownCell || length(dq / vec2(2.9, 1.45)) < 1.0;
    }
    if (crownCell && lodCell && c0.body > 0.5) { gi = ${gIndex('o')}; accent = 1.0; code = 1.0; outT = 1.0; wgt = 3.0; inkCell = false; }

    // read closer, the koi is written: as the letters grow large enough to read, its cells (cell by cell,
    // so nothing snaps) take the poem's own letter from the page here, in the koi's colour
    bool onPage = cid.x >= uBox.x && cid.x < uBox.z && cid.y >= uBox.y && cid.y < uBox.w;
    if (onPage && lodCell && gi > 0 && (inkCell || accent > 0.5 || (cmn > 0.5 && !white))) {
      written = true;
      wgt = 2.0;
      // (the white koi's text, read closer, is set in ink a little stronger than the page around it)
      if (white && accent < 0.5) { wgt = 0.0; code = 0.0; }
      // the black koi's white streaks, read closer, are the page's own pale text
      if (pageOver && accent < 0.5) { written = false; pageOver = false; gi = 0; streakGap = true; }
      over = false;
      outT = accent > 0.5 ? 1.0 : white ? 0.62 : 0.66 + 0.34 * smoothstep(0.4, 0.95, tn0);
    }
  }

  // the tancho, in characters: its cells are the koi's own letters set in vermilion, and read closer
  // the poem's letters in vermilion (above). The eyes are drawn in small characters by the glyph pass;
  // read closer, the text keeps clear of them
  bool pupil = false;
  if (surf > 0.5 && crown > 0.3 && gi > 0 && !written) { gi = ${gIndex('o')}; wgt = 2.0; code = 1.0; accent = 1.0; outT = 1.0; over = false; pageOver = false; }
  if (surf > 0.5) for (int k = 0; k < 2; k++) for (int e = 0; e < 2; e++) {
    vec2 ew = e == 0 ? uEye[k].xy : uEye[k].zw;
    vec2 q = (pc - ew) * uUnit / uCell; // in cells
    if (length(q * vec2(1.0, 1.8)) < ${f(EYE_R)} * uUnit / uCell.x * 1.25 + 0.5 && lodCell) { gi = 0; written = false; pupil = true; }
  }



  // how much of the water (and the page under it) shows here: none through the body or the fins (the
  // white streaks are clean paper), less as the cell's ink rises, and all of it in open water
  float vis = 1.0;
  if (shown) vis = (1.0 - smoothstep(0.04, 0.3, tone)) * (1.0 - smoothstep(0.25, 0.6, max(c0.body, c0.under * 2.0)));
  if (pupil) vis = 0.0;
  if (streakGap) vis = 1.0;

  // ---------- the water, as glyphs ----------
  // Lines where the surface crosses its rest level, one stroke per cell along the wave: lit where the
  // surface there tilts toward the light (top left), in shade where it tilts away, so every ring and
  // every wake reads as a moving ridge. Between the waves, calm water. The fish cast soft shadows on
  // the pond floor, down and to the right of them.
  float kind = 0.0;
  K sh = both(pc - SHADOW_OFF, aa);
  float shadow = shadowAt(sh) * surf;
  float base = 0.12 * shadow + 0.55 * rise;
  float wl = 0.0;
  if (gi == 0 && vis > 0.02) {
    float hs[6]; float hmn = 1e9, hmx = -1e9;
    vec2 outw;
    height(pc, outw);
    for (int i = 0; i < 6; i++) { hs[i] = height(toWorld(cellTL + uCell * SP[i])); hmn = min(hmn, hs[i]); hmx = max(hmx, hs[i]); }
    float gxC = ((hs[1] + hs[3] + hs[5]) - (hs[0] + hs[2] + hs[4])) / 3.0 / 0.44;
    float gyC = ((hs[4] + hs[5]) - (hs[0] + hs[1])) / 2.0 / 0.6;
    vec2 gw = vec2(gxC / uCell.x, -gyC / uCell.y) * uUnit; // the slope in world units
    float glen = length(gw);
    wl = smoothstep(2.5, 18.0, glen);
    int wg = 0; float wt = 0.0;
    // one line per crest: where the surface falls away on the crest's outer side
    if (hmn < 0.0 && hmx > 0.0 && wl > 0.0 && dot(gw, outw) < 0.0) {
      // the stroke follows the wave's line; it bulges away from the wave's source
      vec2 nC = vec2(gxC / (uCell.x * uCell.x), gyC / (uCell.y * uCell.y));
      vec2 oC = vec2(outw.x / uCell.x, -outw.y / uCell.y);
      if (dot(nC, oC) < 0.0) nC = -nC;
      wg = arcGlyph(nC);
      const vec2 L = vec2(-0.55, 0.835);
      float lit = dot(-gw / glen, L);
      code = lit > 0.0 ? 4.0 : 3.0;
      wt = min(1.0, wl * (0.7 + 0.5 * abs(lit)));
      wgt = lit > 0.0 ? 2.0 : 1.0;
    }
    // the shadow on the pond floor: the koi's own letters in the water's shade, very light
    if (wg > 0) { gi = wg; outT = max(wt, min(0.9, 0.9 * rise)) * vis; if (rise > 0.1) wgt = rise > 0.3 ? 2.0 : 1.0; kind = 1.0; }
  }

  // the letter set here (seen when you zoom in): darker where the water is deep or shadowed, on a
  // ripple crest, and ink-dark while a koi rises through it
  float lt = uPageTone * (0.9 + 1.4 * base) + 0.22 * wl + 0.65 * rise;
  float lw = rise > 0.3 ? 2.0 : rise > 0.1 || wl > 0.6 ? 1.0 : 0.0;

  if (written) kind = 2.0;
  // overstruck: typed over the black koi's own ink letter
  if (over) kind = overW ? 5.0 : 3.0;
  // the page's own letter at this cell, in the koi's colour (5: typed over the black koi's ink)
  if (whiteText && !written) kind = 4.0;

  o0 = vec4(float(gi) / 255.0, clamp(outT, 0.0, 1.0), code / 4.0, (wgt + 4.0 * kind) / 255.0);
  o2 = vec4(clamp(0.5 + slope * 0.012, 0.0, 1.0), shadow, 1.0);
  o1 = vec4(0.5 + dc.x / ${f(DX_SCALE)}, 0.5 + dc.y / ${f(DY_SCALE)}, clamp(lt, 0.0, 1.0), (floor(vis * 63.0 + 0.5) + 64.0 * lw) / 255.0);
}`;
