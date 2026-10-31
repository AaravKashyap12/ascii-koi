// The loop clock and each koi's pose: a pure function of time, shared by the page and the scratch
// geometry checks. Every phase here returns to itself after one loop (the seam).
import { BEATS, BREATH_RATE, CRUISE, LOOP, SLOW_CYCLES, SURGE, TURNS } from './config';
import { R, type Pose } from './koi';

export const PHI0 = 0.35;
export const PHI_RATE = (2 * Math.PI * TURNS) / LOOP;
export const PSI_RATE = (2 * Math.PI * BEATS) / LOOP;
export const SLOW_RATE = (2 * Math.PI * SLOW_CYCLES) / LOOP;

export interface Clock { t: number; phi: number; psi: number; slow: number; br: number; amp: number; surf: number; wake: number }
export const loopClock = (t: number): Clock => ({ t, phi: PHI0 + PHI_RATE * t, psi: PSI_RATE * t, slow: SLOW_RATE * t, br: BREATH_RATE * t, amp: CRUISE, surf: 1, wake: 1 });

// the koi beat half a cycle apart and keep half a turn between them, so the S of water between them stays
// nearly the same width all the way round. Each surges a little on its own stroke and glides after it
// (its speed swings about a quarter either side of the cruise), so it reads as pushing itself along
export const poseOf = (c: Clock, k: number): Pose => ({
  phi: c.phi + k * Math.PI + SURGE * Math.sin(c.psi + k * Math.PI - 0.6) * c.amp / CRUISE,
  psi: c.psi + k * Math.PI,
  amp: c.amp,
  slow: c.slow,
  rad: R,
  curl: 1 + CURL_BREATH * Math.sin(2 * c.br + 0.7),
});
export const CURL_BREATH = 0.02;
