// Typesets the poem into the grid like a book page.
// Adapted from SiddDevZ/horizon (MIT, © 2026 Siddharth Meena).
import { POEM } from './poem';
import { G } from './state';
import { gl, makeTex } from './gl/context';

// r holds the glyph index, g says a letter is on the page
export function buildPage() {
  const cols = G.cols, rows = G.rows;
  const paras = POEM.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
  const mx = Math.max(2, Math.round(cols * 0.045));
  const top = Math.max(2, Math.ceil((54 * G.dpr) / G.ch)), bot = Math.max(2, Math.ceil((48 * G.dpr) / G.ch));
  const width = Math.max(8, cols - mx * 2);
  // set the way Sid sets his essay: one running block with no short lines, so wherever a koi swims there
  // are letters for it to be written in. Paragraphs run on after two spaces; section heads run in.
  const [title, ...rest] = paras;
  const body = rest.map((p) => (/^[IVX]+\. /.test(p) ? p + '.' : p)).join('  ');
  const lines: string[] = [title, ''];
  let line = '';
  let guard = 0;
  while (lines.length < rows && guard++ < 80) {
    for (let w of body.split(/(?<=\S) (?=\S)/)) {
      while (w.length > width) { if (line) { lines.push(line); line = ''; } lines.push(w.slice(0, width)); w = w.slice(width); }
      const add = line ? ' ' + w : w.trimStart();
      if (line.length + add.length <= width) line += add;
      else { lines.push(line); line = w.trimStart(); }
    }
    line += '  ';
  }
  if (line.trim()) lines.push(line);
  G.box = [mx, top, cols - mx, rows - bot];
  const data = new Uint8Array(cols * rows * 4);
  let li = 0;
  for (let r = top; r < rows - bot && li < lines.length; r++, li++) {
    const s = lines[li];
    for (let i = 0; i < s.length && mx + i < cols; i++) {
      const g = s.charCodeAt(i) - 32;
      if (g <= 0 || g > 94) continue;
      const o = (r * cols + mx + i) * 4;
      data[o] = g; data[o + 1] = 255; data[o + 3] = 255;
    }
  }
  G.base = data;
  G.page = new Uint8Array(data);
  if (G.tPage) gl.deleteTexture(G.tPage);
  G.tPage = makeTex(cols, rows, data);
}

/** The letter at a page cell (0 = none). */
export function letterAt(c: number, r: number): number {
  if (!G.base || c < 0 || r < 0 || c >= G.cols || r >= G.rows) return 0;
  const o = (r * G.cols + c) * 4;
  return G.base[o + 1] ? G.base[o] : 0;
}
