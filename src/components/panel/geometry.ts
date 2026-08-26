/**
 * Faceplate geometry traced from reference photography of the hardware.
 * All values are fixed stage units; the plate scales uniformly, so the
 * proportions never reflow.
 *
 * The panel is two bands, like the instrument:
 *  - tall top band: LFO stack · modulation oscillator block · oscillator
 *    towers · center MUSE plate / MIX faders / arp · dual filters ·
 *    envelope slider blocks · voices · delay
 *  - short bottom strip: pitch LFO · performance controllers · sync/FM ·
 *    programmer · moog badge
 */

export interface Frame {
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const STAGE = { w: 2200, h: 602 };

export const FRAMES: Frame[] = [
  // top band — left
  { title: "LFO 1", x: 20, y: 14, w: 145, h: 196 },
  { title: "LFO 2", x: 20, y: 218, w: 145, h: 196 },
  { title: "Modulation Oscillator", x: 175, y: 14, w: 265, h: 150 },
  { title: "Mod Routing", x: 175, y: 172, w: 265, h: 242 },
  { title: "Oscillator 1", x: 450, y: 14, w: 185, h: 400 },
  { title: "Oscillator 2", x: 645, y: 14, w: 185, h: 400 },
  // top band — center (below the MUSE nameplate)
  { title: "Mixer", x: 840, y: 66, w: 215, h: 172 },
  { title: "Sync / FM", x: 840, y: 246, w: 215, h: 168 },
  // top band — filters and envelopes
  { title: "Filter 1", x: 1065, y: 14, w: 210, h: 400 },
  { title: "Filter 2", x: 1285, y: 14, w: 215, h: 400 },
  { title: "Filter Envelope", x: 1510, y: 14, w: 235, h: 196 },
  { title: "Amplifier Envelope", x: 1510, y: 218, w: 235, h: 196 },
  // top band — right
  { title: "Voices", x: 1755, y: 14, w: 175, h: 400 },
  { title: "Delay", x: 1940, y: 14, w: 240, h: 400 },
  // bottom strip
  { title: "Pitch LFO", x: 20, y: 424, w: 440, h: 164 },
  { title: "Performance", x: 470, y: 424, w: 250, h: 164 },
  { title: "Arp / Clock", x: 730, y: 424, w: 350, h: 164 }
];

export const BRAND_FRAME = { x: 840, y: 14, w: 215, h: 44 };
export const PROGRAMMER_FRAME = { x: 1090, y: 424, w: 900, h: 164 };
export const MOOG_FRAME = { x: 2000, y: 424, w: 180, h: 164 };
