// Constants shared by the CPU side and the shaders.
// Render architecture adapted from SiddDevZ/horizon (MIT, © 2026 Siddharth Meena).

export const LOOP = 12; // seconds; the post loop
// The two koi are different (one black, one white), so the loop must bring each back to its own place:
// the pair swims one whole turn per loop, and each koi beats a whole number of times (half a cycle
// apart from the other). Flicks come every half beat, alternating koi; flick j + FLICKS is the same koi.
export const BEATS = 5;
export const FLICKS = 2 * BEATS;
export const TURNS = 1; // a full turn per loop: the chase visibly travels (about half a body length a beat)
// cruising effort: how hard the tail beats on the way round (1 = the old, wider swing)
export const CRUISE = 0.6;
// each stroke of the tail pushes its koi forward a little, then it glides: the angle it gains (radians)
export const SURGE = 0.045;
export const SLOW_CYCLES = 2; // slow body bends per loop
// the curl breathes once per loop
export const BREATH_RATE = Math.PI / LOOP;

export const ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i));
export const gIndex = (ch: string) => ch.charCodeAt(0) - 32;

export const FONT_STACK = 'ui-monospace, Menlo, monospace';
// three inks: page text, fins, body. Menlo has no 800, so the heavy row is bold plus a hairline stroke.
export const WEIGHTS = [400, 700, 800];
export const HEAVY_STROKE = 0.11; // of the font size: the koi are the boldest ink on the page
export const LINE = 12 / 11; // cell height / font size: set tight so the ink reads solid

export const CELL = 10; // CSS px font size; one letter per cell (Sid sets his page at ~10 px)
export const CELL_SMALL = 9; // on phones, so the koi still get enough cells
export const PAGE_TONE = 0.24; // ink strength of the page text: quiet, so the koi carry the frame
export const FRAME_WORLD = 2.6; // the yin-yang, fins and tails at full swing, fills ~85% of the viewport height

// a pond of pale, cool paper, so the white koi (white type) shows on it; warm black ink; one vermilion;
// the water's shade a cool slate and its glint white
export const THEME = { bg: '#e8ebe5', ink: '#16140f', accent: '#de3f1c', white: '#fdfcf7', shade: '#435a5f', glint: '#ffffff' };

export const MAX_PARTS = 160;
export const TRAIL = 4;
export const MAX_RINGS = 32;
