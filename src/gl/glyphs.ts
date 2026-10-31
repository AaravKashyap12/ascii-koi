// Font atlases.
// Adapted from SiddDevZ/horizon (MIT, © 2026 Siddharth Meena), extended to four rows: regular, bold,
// heavy (bold plus a hairline stroke when the face has no 800) and the koi's ink cut: a condensed heavy
// face (Impact, a macOS system font) whose capitals fill the cell, so the body reads as continuous ink
// while every letter stays crisp type (no stretching). Plus each glyph's ink at six points, for matching.
import { ASCII, FONT_STACK, HEAVY_STROKE, LINE, WEIGHTS } from '../config';

const SAMPLE_POINTS: [number, number][] = [[0.28, 0.2], [0.72, 0.2], [0.28, 0.5], [0.72, 0.5], [0.28, 0.8], [0.72, 0.8]];
import { G } from '../state';
import { gl, makeTex } from './context';

const fontAt = (w: number, px: number) => `${w} ${px}px ${FONT_STACK}`;

export const ROWS = 4;
export const COLS = 95; // the printable ASCII glyphs, nothing else
const INK_FONT = (px: number) => `400 ${px}px Impact, "Arial Narrow", ${FONT_STACK}`;
const INK_SIZE = 15 / 12; // of the cell's font size

function drawRow(x: CanvasRenderingContext2D, wi: number, cw: number, ch: number, fpx: number, y0: number, pad = 0) {
  const cellX = (i: number) => i * (cw + pad * 2) + pad;
  const clip = (i: number, f: () => void) => {
    x.save(); x.beginPath(); x.rect(cellX(i), y0 + pad, cw, ch); x.clip(); f(); x.restore();
  };
  x.fillStyle = '#fff'; x.strokeStyle = '#fff'; x.lineWidth = fpx * HEAVY_STROKE; x.lineJoin = 'round';
  if (wi === 3) {
    // the ink cut. Capitals are set so their cap height is exactly the cell's height: every row's ink
    // meets the next, so the wash reads as continuous ink, not stripes. Lowercase (the contour, the
    // tancho) keeps a fit of its own, x-height and descender centred in the cell.
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.font = INK_FONT(100);
    const capPx = (ch / x.measureText('H').actualBoundingBoxAscent) * 100;
    const ipx = fpx * INK_SIZE;
    x.font = INK_FONT(ipx);
    const asc = x.measureText('d').actualBoundingBoxAscent, dsc = x.measureText('g').actualBoundingBoxDescent;
    const base = Math.round(y0 + pad + ch - Math.max(0, (ch - (asc + dsc)) / 2) - dsc);
    ASCII.forEach((g, i) => {
      const cap = g >= 'A' && g <= 'Z';
      x.font = INK_FONT(cap ? capPx : ipx);
      clip(i, () => x.fillText(g, cellX(i) + cw / 2, cap ? y0 + pad + ch : base));
    });
  } else {
    x.font = fontAt(WEIGHTS[wi], fpx); x.textBaseline = 'middle'; x.textAlign = 'center';
    ASCII.forEach((g, i) => {
      const gx = cellX(i) + cw / 2, gy = y0 + pad + ch / 2 + fpx * 0.04;
      x.fillText(g, gx, gy);
      if (wi === 2) x.strokeText(g, gx, gy);
    });
  }
}

// each glyph's ink in six sampling circles (horizon's measure), for the scene pass to match against:
// rows 0-1 the regular face normalised per point (line shapes), rows 2-3 the ink cut and 4-5 the bold
// face with absolute coverage (so a nearly full cell matches a nearly solid letter)
export function buildShapes() {
  const fpx = 48, c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true })!;
  x.font = fontAt(400, fpx);
  const cw = Math.round(x.measureText('M').width), ch = Math.round(fpx * LINE);
  c.width = cw * COLS; c.height = ch;
  const data = new Uint8Array(95 * 6 * 4);
  [0, 3, 1].forEach((wi, set) => {
    x.clearRect(0, 0, c.width, c.height);
    drawRow(x, wi, cw, ch, fpx, 0);
    const img = x.getImageData(0, 0, c.width, c.height).data;
    const R = 0.21 * cw;
    const vec = ASCII.map((_, g) => SAMPLE_POINTS.map(([fx, fy]) => {
      const cx = g * cw + fx * cw, cy = fy * ch; let sum = 0, n = 0;
      for (let yy = Math.floor(cy - R); yy <= Math.ceil(cy + R); yy++) for (let xx = Math.floor(cx - R); xx <= Math.ceil(cx + R); xx++) {
        if ((xx - cx) ** 2 + (yy - cy) ** 2 > R * R) continue;
        sum += img[(yy * c.width + xx) * 4 + 3] / 255; n++;
      }
      return sum / n;
    }));
    const mx = [0, 1, 2, 3, 4, 5].map((k) => set ? 1 : Math.max(1e-3, ...vec.map((v) => v[k])));
    vec.forEach((v, g) => {
      for (let k = 0; k < 6; k++) {
        const row = set * 2 + (k < 4 ? 0 : 1), c2 = k < 4 ? k : k - 4;
        data[(row * 95 + g) * 4 + c2] = Math.round(Math.min(1, v[k] / mx[k]) * 255);
      }
    });
  });
  if (G.shape) gl.deleteTexture(G.shape);
  G.shape = makeTex(95, 6, data);
}

// every printable glyph in three weights at the cell size (crisp, texelFetch), plus a large padded
// copy with mipmaps for zoomed views and lifted letters
export function buildAtlas(cellPx: number) {
  const fpx = cellPx * G.dpr;
  const c = document.createElement('canvas'), x = c.getContext('2d')!;
  x.font = fontAt(400, fpx);
  G.cw = Math.max(2, Math.round(x.measureText('M').width));
  G.ch = Math.max(3, Math.round((cellPx * LINE) * G.dpr));
  c.width = COLS * G.cw; c.height = ROWS * G.ch;
  for (let w = 0; w < ROWS; w++) drawRow(x, w, G.cw, G.ch, fpx, w * G.ch);
  if (G.atlas) gl.deleteTexture(G.atlas);
  // filtered so page letters can sit between pixels; grid glyphs still read it texel by texel
  G.atlas = makeTex(c.width, c.height, c, true);
  G.atlasW = c.width; G.atlasH = c.height;

  const hpx = 64, h = document.createElement('canvas'), hx = h.getContext('2d')!;
  hx.font = fontAt(400, hpx);
  G.hiCw = Math.round(hx.measureText('M').width); G.hiCh = Math.round(hpx * LINE);
  const pad = G.hiPad;
  h.width = COLS * (G.hiCw + pad * 2); h.height = ROWS * (G.hiCh + pad * 2);
  for (let w = 0; w < ROWS; w++) drawRow(hx, w, G.hiCw, G.hiCh, hpx, w * (G.hiCh + pad * 2), pad);
  G.hiW = h.width; G.hiH = h.height;
  if (G.hi) gl.deleteTexture(G.hi);
  G.hi = makeTex(h.width, h.height, h, true);
}
