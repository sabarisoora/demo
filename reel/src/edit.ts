// Cut list and timing for the first 30 s of the raw selfie video.
// Segments are source seconds, with edges taken from the audio speech mask (pauses > ~0.3 s removed).
export const FPS = 30;

import EDIT from "./edit.json";
export const SEGMENTS: { s: number; e: number; z: number[] }[] = EDIT.segments;
export const EVENTS: Record<string, number> = EDIT.events;
export const STING = EDIT.sting;

// output start (seconds) of each segment
export const OUT_START: number[] = [];
{
  let t = 0;
  for (const g of SEGMENTS) {
    OUT_START.push(t);
    t += g.e - g.s;
  }
}
export const SPEECH_END = OUT_START[OUT_START.length - 1] + SEGMENTS[SEGMENTS.length - 1].e - SEGMENTS[SEGMENTS.length - 1].s;
export const TOTAL = SPEECH_END + STING;
export const TOTAL_FRAMES = Math.round(TOTAL * FPS);

// source seconds -> output seconds (null if the moment was cut out)
export function out(src: number): number {
  for (let i = 0; i < SEGMENTS.length; i++) {
    const g = SEGMENTS[i];
    if (src >= g.s - 0.001 && src <= g.e + 0.001) return OUT_START[i] + (src - g.s);
  }
  // snap to the next segment start if it falls in a removed pause
  for (let i = 0; i < SEGMENTS.length; i++) if (src < SEGMENTS[i].s) return OUT_START[i];
  return SPEECH_END;
}
export const fo = (src: number) => Math.round(out(src) * FPS);
