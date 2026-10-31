// The three render passes.
// Adapted from SiddDevZ/horizon renderer.js (MIT, © 2026 Siddharth Meena).
import { MAX_PARTS, PAGE_TONE, THEME, TRAIL } from '../config';
import { FP, NB, NF, NT, type KoiFrame } from '../koi';
import { G } from '../state';
import type { WaterFrame } from '../water';
import { gl, program, type Program } from './context';
import { SCENE_FS } from './scene';
import { GLYPH_FS, PARTICLE_FS, PARTICLE_VS } from './glyph';

let P1: Program, P2: Program, P3: Program, vao: WebGLVertexArrayObject, pvao: WebGLVertexArrayObject, pbuf: WebGLBuffer;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const BG = hex(THEME.bg), INK = hex(THEME.ink), ACCENT = hex(THEME.accent);
const PAL = new Float32Array([THEME.ink, THEME.accent, THEME.white, THEME.shade, THEME.glint].flatMap(hex));

const body = new Float32Array(NB * 8), tail = new Float32Array(NT * 8), fins = new Float32Array(NF * FP * 8);
const v8 = new Float32Array(8);

export interface View { zoom: number; panX: number; panY: number }
// the page resolves as the glyphs grow on screen: pond below LOD_PX, readable prose above LOD_PX + 12
const LOD_PX = 13;
export const lodFor = (zoom: number) => { const x = Math.min(1, Math.max(0, (G.cellPx * zoom - LOD_PX) / 12)); return x * x * (3 - 2 * x); };
export interface Swim { loop: number; amp: number; surf: number; wake: number }

export function initRenderer() {
  P1 = program(SCENE_FS); P2 = program(GLYPH_FS); P3 = program(PARTICLE_FS, PARTICLE_VS);
  vao = gl.createVertexArray()!;
  pvao = gl.createVertexArray()!; pbuf = gl.createBuffer()!;
  gl.bindVertexArray(pvao);
  gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
  gl.bufferData(gl.ARRAY_BUFFER, MAX_PARTS * (TRAIL + 1) * 24, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
  gl.bindVertexArray(null);
}

// the koi's geometry, for both the scene pass and the glyph pass
function koiUniforms(u: Record<string, WebGLUniformLocation>, koi: KoiFrame[], swim: Swim) {
  body.set(koi[0].body, 0); body.set(koi[1].body, NB * 4);
  tail.set(koi[0].tail, 0); tail.set(koi[1].tail, NT * 4);
  fins.set(koi[0].fins, 0); fins.set(koi[1].fins, NF * FP * 4);
  gl.uniform4fv(u.uBody, body); gl.uniform4fv(u.uTail, tail); gl.uniform4fv(u.uFin, fins);
  const pack = (fn: (k: KoiFrame) => number[]) => { v8.fill(0); koi.forEach((k, i) => v8.set(fn(k), i * 4)); return v8; };
  gl.uniform4fv(u.uEye, pack((k) => k.eyes));
  gl.uniform4fv(u.uCrown, pack((k) => k.crown));
  gl.uniform4fv(u.uGill, pack((k) => k.gill));
  gl.uniform4fv(u.uTip, pack((k) => [...k.tip, k.psi]));
  gl.uniform4fv(u.uBound, pack((k) => [...k.bound, 0]));
  gl.uniform4f(u.uSwim, swim.loop, swim.amp, swim.surf, swim.wake);
}

function drawScene(koi: KoiFrame[], swim: Swim, water: WaterFrame, view: View) {
  gl.bindVertexArray(vao);
  gl.disable(gl.BLEND);
  gl.bindFramebuffer(gl.FRAMEBUFFER, G.fbo);
  gl.viewport(0, 0, G.cols, G.rows);
  gl.useProgram(P1.p);
  const u = P1.u;
  gl.uniform2f(u.uGrid, G.cols, G.rows);
  gl.uniform2f(u.uCell, G.cw, G.ch);
  gl.uniform2f(u.uGridPx, G.gw, G.gh);
  gl.uniform1f(u.uUnit, G.unit);
  koiUniforms(u, koi, swim);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, G.shape); gl.uniform1i(u.uShape, 1);
  gl.uniform4f(u.uBox, G.box[0], G.box[1], G.box[2], G.box[3]);
  gl.uniform4fv(u.uRing, water.rings); gl.uniform4fv(u.uRingP, water.ringP); gl.uniform1i(u.uRingN, water.ringN);
  gl.uniform1f(u.uPageTone, PAGE_TONE);
  gl.uniform1f(u.uLod, lodFor(view.zoom));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// the painted pond gives way to the characters as you lean in
export const paintFor = (zoom: number) => { const x = Math.min(1, Math.max(0, (zoom - 1.12) / 0.8)); return 1 - x * x * (3 - 2 * x); };

function drawGlyphs(koi: KoiFrame[], swim: Swim, view: View) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, G.W, G.H);
  gl.useProgram(P2.p);
  const v = P2.u;
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.tData); gl.uniform1i(v.uData, 0);
  gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, G.tPage); gl.uniform1i(v.uPage, 4);
  gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, G.tPageD); gl.uniform1i(v.uPageD, 5);
  gl.uniform3fv(v.uPal, PAL);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, G.atlas); gl.uniform1i(v.uAtlas, 2);
  gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, G.hi); gl.uniform1i(v.uHi, 3);
  gl.uniform3fv(v.uBg, BG); gl.uniform3fv(v.uInk, INK); gl.uniform3fv(v.uAccent, ACCENT);
  gl.uniform2f(v.uOff, G.offX, G.offY);
  gl.uniform2f(v.uCellD, G.cw, G.ch);
  gl.uniform2f(v.uGrid, G.cols, G.rows);
  gl.uniform2f(v.uCanvas, G.W, G.H);
  gl.uniform2f(v.uAtlasSize, G.atlasW, G.atlasH);
  gl.uniform1f(v.uLod, lodFor(view.zoom));
  gl.uniform3f(v.uView, view.zoom, view.panX, view.panY);
  gl.uniform4f(v.uHiInfo, G.hiCw, G.hiCh, G.hiPad, 0);
  gl.uniform2f(v.uHiSize, G.hiW, G.hiH);
  koiUniforms(v, koi, swim);
  gl.uniform2f(v.uGridPx, G.gw, G.gh);
  gl.uniform1f(v.uUnit, G.unit);
  gl.uniform1f(v.uPaint, paintFor(view.zoom));
  gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, G.tWater); gl.uniform1i(v.uWater, 6);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// lifted letters ride on top with a short trail of dots
function drawParticles(water: WaterFrame, view: View) {
  const n = water.partN;
  if (!n) return;
  const d = water.parts;
  // grid px -> device px on screen
  for (let i = 0; i < n; i++) {
    d[i * 6] = view.panX + (G.offX + d[i * 6]) * view.zoom;
    d[i * 6 + 1] = view.panY + (G.offY + d[i * 6 + 1]) * view.zoom;
  }
  gl.bindVertexArray(pvao);
  gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, d, 0, n * 6);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(P3.p);
  const w = P3.u;
  gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, G.hi); gl.uniform1i(w.uHi, 3);
  gl.uniform4f(w.uHiInfo, G.hiCw, G.hiCh, G.hiPad, 0);
  gl.uniform2f(w.uHiSize, G.hiW, G.hiH);
  gl.uniform2f(w.uCellD, G.cw * view.zoom, G.ch * view.zoom);
  gl.uniform2f(w.uCanvas, G.W, G.H);
  gl.uniform1f(w.uSize, Math.max(G.cw, G.ch) * view.zoom);
  gl.uniform3fv(w.uInk, INK); gl.uniform3fv(w.uBg, BG);
  gl.uniform1f(w.uLod, lodFor(view.zoom));
  gl.uniform1f(w.uPaint, paintFor(view.zoom));
  gl.drawArrays(gl.POINTS, 0, n);
  gl.disable(gl.BLEND);
  gl.bindVertexArray(null);
}

export function render(koi: KoiFrame[], swim: Swim, water: WaterFrame, view: View) {
  // lifted letters leave their cells empty until they settle back
  const page = G.page!, base = G.base!;
  page.set(base);
  for (const i of water.lifted) page[i * 4 + 1] = 0;
  gl.bindTexture(gl.TEXTURE_2D, G.tPage);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, G.cols, G.rows, gl.RGBA, gl.UNSIGNED_BYTE, page);
  drawScene(koi, swim, water, view);
  drawGlyphs(koi, swim, view);
  drawParticles(water, view);
}
