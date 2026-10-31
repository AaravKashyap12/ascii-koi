// Grid, atlas and GPU resources shared between layout, page and renderer.
export const G = {
  dpr: 1, cellPx: 12, cw: 6, ch: 12, cols: 1, rows: 1, offX: 0, offY: 0, gw: 1, gh: 1, unit: 1, W: 1, H: 1,
  fbo: null as WebGLFramebuffer | null, tData: null as WebGLTexture | null, tPageD: null as WebGLTexture | null,
  shape: null as WebGLTexture | null, tWater: null as WebGLTexture | null,
  atlas: null as WebGLTexture | null, atlasW: 1, atlasH: 1, perRow: 95,
  hi: null as WebGLTexture | null, hiCw: 1, hiCh: 1, hiPad: 2, hiW: 1, hiH: 1,
  base: null as Uint8Array | null, page: null as Uint8Array | null, tPage: null as WebGLTexture | null,
  box: [0, 0, 1, 1] as [number, number, number, number],
};
