/** Computer-keyboard note layout (classic tracker/DAW mapping). */
export const KEY_TO_SEMITONE: Record<string, number> = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11,
  k: 12, o: 13, l: 14, p: 15, ";": 16
};

/** Number of keys rendered on screen (two octaves + top C). */
export const NUM_KEYS = 25;

export function isBlackKey(note: number): boolean {
  return [1, 3, 6, 8, 10].includes(note % 12);
}
