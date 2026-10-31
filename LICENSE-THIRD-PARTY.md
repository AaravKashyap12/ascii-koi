# Third-party notices

## SiddDevZ/horizon

The render architecture of this piece is adapted from **horizon** by Siddharth Meena
(https://github.com/SiddDevZ/horizon): a scene pass at character-grid resolution writing
glyph/tone/accent/kind per cell, six-point glyph shape matching against all 95 printable ASCII
characters (contrast boost + hash dither), glyph expansion from a font atlas with alpha
`0.3 + 0.7 * smoothstep(0, 0.85, tone)` on a flat ground, letter particles as point sprites with trails,
and book-style page typesetting. Adapted files carry a header note: `src/gl/context.ts`,
`src/gl/glyphs.ts`, `src/gl/scene.ts`, `src/gl/glyph.ts`, `src/gl/renderer.ts`, `src/page.ts`,
`src/config.ts`, `src/main.ts`.

The koi, the water model, the poem and the interaction are original to this piece.

```
MIT License

Copyright (c) 2026 Siddharth Meena

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
