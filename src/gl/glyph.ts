// Pass 2: expand each cell of the data texture into its glyph, and pass 3: lifted letters as point sprites.
// Adapted from SiddDevZ/horizon glyph.frag.js and particles.js (MIT, © 2026 Siddharth Meena).
// Changes: three weight rows in the atlas, a zoom/pan view, a mipmapped atlas for zoomed views, and a
// page layer: every page letter is drawn at its own sub-cell offset (gathered from the neighbouring
// cells), so lines bend and part smoothly around the koi instead of letters doubling or dropping.
import { DX_SCALE, DY_SCALE, KOI_GLSL } from './scene';
import { EYE_R, W_MAX } from '../koi';
import { gIndex } from '../config';

const f = (x: number) => x.toFixed(5);

export const GLYPH_FS = `#version 300 es
precision highp float;
precision highp int;
out vec4 o;
uniform sampler2D uData, uPage, uPageD, uAtlas, uHi, uWater;
uniform vec2 uGridPx;
uniform float uUnit, uPaint; // uPaint: 1 = the painted pond (normal view), 0 = all characters (read closer)
uniform vec3 uBg, uInk, uAccent;
uniform vec3 uPal[5]; // 0 ink, 1 vermilion, 2 the white koi's white, 3 the water's shade, 4 its glint
uniform vec2 uOff, uCellD, uGrid, uCanvas, uAtlasSize;
uniform vec3 uView;   // zoom, pan x, pan y (device px): screen = pan + grid * zoom
uniform vec4 uHiInfo; // hi cell w, h, pad
uniform vec2 uHiSize;
uniform float uLod;   // 0 = the pond (default size), 1 = the page (glyphs large enough to read)
${KOI_GLSL}

// coverage of glyph gi (weight w) at q, pixels inside its cell
float glyphA(int gi, int w, vec2 q){
  if (abs(uView.x - 1.0) < 1e-3) {
    // bilinear at the cell size: crisp on whole pixels, smooth when a letter sits between them
    vec2 qq = clamp(q, vec2(0.5), uCellD - 0.5);
    return textureLod(uAtlas, (vec2(float(gi), float(w)) * uCellD + qq) / uAtlasSize, 0.0).a;
  }
  vec2 hc = uHiInfo.xy, pad = uHiInfo.zz;
  vec2 org = vec2(float(gi), float(w)) * (hc + 2.0 * pad) + pad;
  vec2 uv = (org + clamp(q / uCellD, 0.0, 1.0) * hc) / uHiSize;
  vec2 g = hc / uCellD / uView.x / uHiSize;
  return textureGrad(uHi, uv, vec2(g.x, 0.0), vec2(0.0, g.y)).a;
}

// a koi glyph's coverage: texel by texel at the cell size, from the large atlas when zoomed
float koiA(int g, int w, vec2 lp){
  return abs(uView.x - 1.0) < 1e-3
    ? texelFetch(uAtlas, ivec2(g * int(uCellD.x) + int(lp.x), w * int(uCellD.y) + int(lp.y)), 0).a
    : glyphA(g, w, lp);
}

// an edge as a plane through the cell (the scene pass fits it to the signed distance, in cell heights,
// at six points): the signed distance from the edge in screen pixels at lp, positive inside
float planeDist(vec4 eg, vec2 lp){
  float sd = (eg.r - 0.5) * 4.0 + dot(vec2(eg.g - 0.5, eg.b - 0.5) * 8.0, lp / uCellD - 0.5);
  return sd * uCellD.y * uView.x;
}
// a glyph drawn at a fraction of the cell size (s cells per cell), q in this small cell's own pixels
float smallA(int g, int w, vec2 q, float s){
  vec2 hc = uHiInfo.xy, pad = uHiInfo.zz;
  vec2 c = uCellD / s;
  vec2 org = vec2(float(g), float(w)) * (hc + 2.0 * pad) + pad;
  vec2 uv = (org + clamp(q / c, 0.0, 1.0) * hc) / uHiSize;
  vec2 gr = hc / c / uView.x / uHiSize;
  return textureGrad(uHi, uv, vec2(gr.x, 0.0), vec2(0.0, gr.y)).a;
}
vec2 toWorldPx(vec2 px){ return vec2(px.x - uGridPx.x * 0.5, uGridPx.y * 0.5 - px.y) / uUnit; }

// the painted koi eye: a dark pupil in a ring of iris (bronze on the black koi, cool grey on the white),
// a soft shadow where it sits in the head, and a small catchlight from the light above left
vec3 paintEye(vec3 col, vec2 p, vec2 ew, int k, float aa){
  float r = length(p - ew) / ${f(EYE_R)}, a = aa / ${f(EYE_R)};
  if (r > 1.6) return col;
  vec3 iris = k == 0 ? vec3(0.62, 0.53, 0.36) : vec3(0.50, 0.56, 0.58);
  col = mix(col, uPal[0], 0.35 * smoothstep(1.55, 1.0, r) * float(k));       // the socket's shade (white koi)
  col = mix(col, uPal[0], smoothstep(1.0 + a, 1.0 - a, r));                     // the rim
  // the iris, darker toward its rim, round a large round pupil
  col = mix(col, mix(iris, iris * 0.55, smoothstep(0.5, 0.92, r)), smoothstep(0.92 + a, 0.92 - a, r));
  col = mix(col, vec3(0.04, 0.035, 0.03), smoothstep(0.5 + a, 0.5 - a, r));     // the pupil
  float h = length(p - ew - vec2(-0.3, 0.32) * ${f(EYE_R)}) / ${f(EYE_R)};
  col = mix(col, vec3(1.0), 0.9 * smoothstep(0.22 + a, 0.22 - a, h));          // the catchlight
  return col;
}

void main(){
  vec2 sp = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);
  vec2 px = (sp - uView.yz) / uView.x - uOff;
  vec2 cf = floor(px / uCellD);
  if (cf.x < 0.0 || cf.y < 0.0 || cf.x >= uGrid.x || cf.y >= uGrid.y) { o = vec4(uBg, 1.0); return; }
  ivec2 ic = ivec2(cf);
  int R = int(uGrid.y) - 1;

  // the page: letters from this cell and its neighbours, each at its own offset. A letter whose cell
  // a koi has written (read closer, its cells take the poem's letters) is set in that koi's colour,
  // weight and strength (the white koi's white letters carry a soft shade below them, so they read on
  // the pond); the rest are the pale page, seen only where the water shows
  float pa = 0.0, ia = 0.0, sa = 0.0;
  vec3 ic3 = uPal[0];
  int va = int(floor(texelFetch(uPageD, ivec2(ic.x, R - ic.y), 0).a * 255.0 + 0.5));
  float vis = float(va & 63) / 63.0;
  if (uLod > 0.0) {
    for (int oy = -1; oy <= 1; oy++) for (int ox = -2; ox <= 2; ox++) {
      ivec2 j = ic + ivec2(ox, oy);
      if (j.x < 0 || j.y < 0 || j.x >= int(uGrid.x) || j.y > R) continue;
      vec4 pl = texelFetch(uPage, j, 0);
      if (pl.g < 0.5) continue;
      vec4 pd = texelFetch(uPageD, ivec2(j.x, R - j.y), 0);
      vec2 d = vec2((pd.r - 0.5) * ${f(DX_SCALE)}, (pd.g - 0.5) * ${f(DY_SCALE)});
      vec2 q = px - (vec2(j) + d) * uCellD;
      vec4 kd = texelFetch(uData, ivec2(j.x, R - j.y), 0);
      int kwk = int(floor(kd.a * 255.0 + 0.5));
      int kc = int(floor(kd.b * 4.0 + 0.5));
      int g = int(pl.r * 255.0 + 0.5);
      bool inCell = q.x >= 0.0 && q.y >= 0.0 && q.x < uCellD.x && q.y < uCellD.y;
      if ((kwk >> 2) == 2) {
        if (kc == 2) {
          vec2 qs = q - vec2(0.45, 0.6);
          if (qs.x >= 0.0 && qs.y >= 0.0 && qs.x < uCellD.x && qs.y < uCellD.y) sa = max(sa, glyphA(g, kwk & 3, qs) * kd.g);
        }
        if (!inCell) continue;
        float a = glyphA(g, kwk & 3, q) * kd.g;
        if (a > ia) { ia = a; ic3 = uPal[kc]; }
      } else if (vis > 0.0 && inCell) {
        int w = int(floor(pd.a * 255.0 + 0.5)) >> 6;
        pa = max(pa, glyphA(g, w, q) * pd.b);
      }
    }
  }
  vec3 col = mix(uBg, uPal[0], pa * vis * uLod);
  col = mix(col, uPal[3], sa * 0.6);
  col = mix(col, ic3, ia);

  // the koi and the water's marks: one character per cell, each with its own weight, colour and strength
  vec4 d = texelFetch(uData, ivec2(ic.x, R - ic.y), 0);
  int gi = int(floor(d.r * 255.0 + 0.5));
  int wk = int(floor(d.a * 255.0 + 0.5));
  int code = int(floor(d.b * 4.0 + 0.5));
  vec2 lp = px - cf * uCellD;
  // a written cell in a longer gap of the text (a line's end, not a word space) keeps the koi's letter,
  // set faint, so the body holds its shape there; the tancho shows only the poem's own letters
  bool written = (wk >> 2) == 2;
  if (written && texelFetch(uPage, ic, 0).g < 0.5) {
    int W = int(uGrid.x) - 1;
    bool gap = texelFetch(uPage, ivec2(max(ic.x - 1, 0), ic.y), 0).g < 0.5 && texelFetch(uPage, ivec2(min(ic.x + 1, W), ic.y), 0).g < 0.5;
    // (inside the tancho a gap between words is a small red o, so the red patch stays whole and round)
    if (code == 1) written = false;
    else if (gap) { written = false; d.g *= 0.3; } else gi = 0;
  }
  if (gi > 0 && !written) {
    int w = wk & 3;
    float k = d.g;
    // the water's own glyphs give way to the page as you zoom in
    if ((wk >> 2) == 1) k *= 1.0 - uLod;
    // the black koi's eye and tancho are typed over its own ink letter
    if ((wk >> 2) == 3) {
      int under = ((ic.x + ic.y) & 1) == 1 ? ${gIndex('H')} : ${gIndex('N')};
      col = mix(col, uPal[0], koiA(under, 3, lp));
    }
    if ((wk >> 2) == 5) {
      // typed over the white koi's own letter: its eye and tancho
      int under = ((ic.x + ic.y) & 1) == 1 ? ${gIndex('H')} : ${gIndex('N')};
      col = mix(col, uPal[2], koiA(under, 3, lp));
      col = mix(col, uPal[code], koiA(gi, w, lp) * k);
    } else if ((wk >> 2) == 4) {
      // the white koi is made of the page itself: the letter that lives in this cell (spaces stay spaces)
      vec4 pl = texelFetch(uPage, ic, 0);
      if (pl.g > 0.5) col = mix(col, uPal[code], glyphA(int(pl.r * 255.0 + 0.5), w, lp) * k);
    } else col = mix(col, uPal[code], koiA(gi, w, lp) * k);
  }

  // the eyes in characters: each a round of small type, two to a cell: '@' for the pupil, 'o' for
  // the iris round it, '*' for the catchlight, on a round of paper cut into the koi's letters
  vec2 wp = toWorldPx(px);
  if (uPaint < 1.0 && uSwim.z > 0.5) for (int k = 0; k < 2; k++) for (int e = 0; e < 2; e++) {
    vec2 ew = e == 0 ? uEye[k].xy : uEye[k].zw;
    float r = length(wp - ew) / ${f(EYE_R)};
    if (r > 1.9) continue;
    float aa = 1.0 / (uUnit * uView.x * ${f(EYE_R)});
    col = mix(col, uBg, smoothstep(1.55 + aa, 1.55 - aa, r));
    // the type is laid out from the eye's own centre, so every eye is the same round composition and
    // it travels with the fish: ' ooo ' over '(o@o)' over ' ooo ', in half-size cells
    float S = 2.0;
    vec2 mc = uCellD / S;
    vec2 ep = vec2(ew.x, -ew.y) * uUnit + uGridPx * 0.5;            // the eye in grid px
    vec2 mi = floor((px - ep) / mc + 0.5), mq = px - ep - (mi - 0.5) * mc;
    int g = 0;
    if (mi.y == 0.0 && abs(mi.x) <= 2.0) g = mi.x == 0.0 ? ${gIndex('@')} : abs(mi.x) == 1.0 ? ${gIndex('o')} : (mi.x < 0.0 ? ${gIndex('(')} : ${gIndex(')')});
    else if (abs(mi.y) == 1.0 && abs(mi.x) <= 1.0) g = ${gIndex('o')};
    vec3 c = g == ${gIndex('o')} ? (k == 0 ? vec3(0.55, 0.45, 0.28) : vec3(0.38, 0.45, 0.48)) : uPal[0];
    if (g > 0) col = mix(col, c, smallA(g, 2, mq, S));
  }

  // ---------- the painted pond (normal view) ----------
  if (uPaint > 0.0) {
    vec4 wt = texture(uWater, vec2(px.x / uCellD.x, uGrid.y - px.y / uCellD.y) / uGrid);
    vec2 slope = (wt.rg - 0.5) / 0.012;
    float shadow = wt.b;
    float aaw = 0.75 / (uUnit * uView.x);
    // the water: pale paper, each wave lit on the side that faces the light (above left), in cool shade on
    // the other, so the rings and wakes read as soft moving ridges
    const vec2 L = vec2(-0.55, 0.835);
    float lit = dot(-slope, L) * 0.0042;
    vec3 pc = uBg;
    pc = lit > 0.0 ? mix(pc, uPal[4], min(lit, 0.6)) : mix(pc, uPal[3], min(-lit * 0.7, 0.3));
    // the koi's shadows on the floor
    pc = mix(pc, uPal[3], 0.2 * shadow);
    // the koi, seen through the moving surface
    vec2 kw = wp - slope * 1.1e-4;
    K kp = both(kw, aaw);
    float inside = smoothstep(aaw, -aaw, kp.dAny);
    if (inside > 0.0) {
      float inner = clamp(-kp.sd / (0.6 * ${f(W_MAX)}), 0.0, 1.0);
      float emerge = smoothstep(0.0, 0.45, uSwim.z * 1.5 - 0.5 * (1.0 - inner));
      bool white = kp.who > 0.5;
      float body = kp.body;
      // a faint grain of the letters the koi is made of, the only hint at this distance
      int lg = ((ic.x + ic.y) & 1) == 1 ? ${gIndex('H')} : ${gIndex('N')};
      float grain = 0.94 + 0.06 * koiA(lg, 3, lp);
      float st = smoothstep(-aaw, aaw, kp.strk) * step(0.5, body);
      vec3 kc; float ka;
      if (!white) {
        // sumi ink: wet and dark on the flanks and head, a little lighter along the back, thinning in the fins
        kc = uPal[0];
        ka = mix(0.3 + 0.48 * kp.fade, 0.8 + 0.2 * smoothstep(0.3, 0.95, kp.tone), body) * grain;
        kc = mix(kc, uPal[2], st); ka = mix(ka, 1.0, st);
      } else {
        // the white koi: white, greying toward its flanks (it is round) and translucent in the fins
        float side = smoothstep(0.25, 1.0, abs(kp.bq.y));
        kc = mix(uPal[2], mix(uPal[2], uPal[3], 0.22), side * body);
        ka = mix(0.55 + 0.25 * kp.fade, 1.0, body) * grain;
        kc = mix(kc, uPal[0], st); ka = mix(ka, 0.92, st);
      }
      pc = mix(pc, kc, inside * ka * emerge);
      // the white koi's edge: a fine soft line of ink, the brush's outline
      if (white) {
        float dpx = -kp.dAny * uUnit * uView.x;
        float line = 1.0 - smoothstep(0.35, 1.0, abs(dpx - 0.7 * uView.x));
        pc = mix(pc, uPal[0], 0.6 * line * emerge * mix(0.6, 1.0, body));
      }
    } else if (kp.dAny < 3.0 * aaw && kp.who > 0.5) {
      float dpx = -kp.dAny * uUnit * uView.x;
      pc = mix(pc, uPal[0], 0.6 * (1.0 - smoothstep(0.35, 1.0, abs(dpx - 0.7 * uView.x))) * smoothstep(0.5, 0.9, uSwim.z));
    }
    // the tancho: a soft round spot of vermilion on the top of the head, a little deeper at its heart
    float show = smoothstep(0.5, 0.95, uSwim.z);
    for (int k = 0; k < 2; k++) {
      vec4 cr = uCrown[k];
      vec2 cq = kw - cr.xy;
      cq = vec2(dot(cq, vec2(cos(cr.w), sin(cr.w))), dot(cq, vec2(-sin(cr.w), cos(cr.w))));
      float ca = atan(cq.y, cq.x);
      float rr = cr.z * (1.0 + 0.025 * sin(3.0 * ca + 1.0));
      float d = length(cq / vec2(1.08, 0.96));
      // a clean round spot whose edge softens into the skin, deepest at its heart, with a faint sheen where
      // the light falls on the round of the head
      float spot = smoothstep(rr * 1.04, rr * 0.8, d);
      vec3 red = mix(uPal[1], uPal[1] * vec3(0.82, 0.74, 0.74), smoothstep(rr * 0.85, 0.0, d));
      vec2 sh = kw - cr.xy - vec2(-0.3, 0.35) * cr.z;
      red = mix(red, vec3(1.0, 0.72, 0.62), 0.14 * smoothstep(0.55, 0.0, length(sh) / cr.z));
      pc = mix(pc, red, spot * 0.97 * show);
    }
    // the eyes
    if (uSwim.z > 0.5) for (int k = 0; k < 2; k++) for (int e = 0; e < 2; e++) {
      vec2 ew = e == 0 ? uEye[k].xy : uEye[k].zw;
      vec3 ec = paintEye(pc, kw, ew, k, aaw);
      pc = mix(pc, ec, show);
    }
    col = mix(col, pc, uPaint);
  }
  o = vec4(col, 1.0);
}`;


export const PARTICLE_VS = `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec4 aInfo; // glyph, alpha (>1.5 = letter that knocks out the cell), scale, weight
uniform vec2 uCanvas;
uniform float uSize;
out vec4 vInfo;
void main(){
  vInfo = aInfo;
  gl_Position = vec4(aPos.x / uCanvas.x * 2.0 - 1.0, 1.0 - aPos.y / uCanvas.y * 2.0, 0.0, 1.0);
  gl_PointSize = ceil(uSize * aInfo.z);
}`;

export const PARTICLE_FS = `#version 300 es
precision highp float;
precision highp int;
in vec4 vInfo;
out vec4 o;
uniform sampler2D uHi;
uniform vec4 uHiInfo;
uniform vec2 uHiSize, uCellD;
uniform float uSize;
uniform vec3 uInk, uBg;
uniform float uLod, uPaint;
float glyphAt(float g, vec2 lp){
  vec2 hc = uHiInfo.xy, pad = uHiInfo.zz;
  vec2 org = vec2(g, vInfo.w) * (hc + 2.0 * pad) + pad;
  return texture(uHi, (org + lp * hc) / uHiSize).a;
}
void main(){
  float sc = vInfo.z, ps = ceil(uSize * sc);
  vec2 cd = uCellD * sc;
  vec2 lp = (gl_PointCoord * ps - (vec2(ps) - cd) * 0.5) / cd; // 0..1 inside the letter's cell
  if (lp.x < 0.0 || lp.y < 0.0 || lp.x >= 1.0 || lp.y >= 1.0) discard;
  float a = glyphAt(vInfo.x, lp);
  // in the painting a lifted letter is a small bead of water; read closer, the letter again
  float bead = smoothstep(0.32, 0.18, length(lp - 0.5));
  a = mix(a, bead * 0.18, uPaint);
  // in the pond a lifted letter is a drop of water; zoomed in it is the letter again
  if (vInfo.y > 1.5) {
    float drop = glyphAt(${"'".charCodeAt(0) - 32}.0, lp);
    float k = mix(drop * 0.5, a, uLod) * (vInfo.y - 2.0);
    if (k < 0.004) discard;
    o = vec4(uInk, k);
    return;
  }
  a *= vInfo.y * mix(0.5, 1.0, uLod);
  if (a < 0.004) discard;
  o = vec4(uInk, a);
}`;
