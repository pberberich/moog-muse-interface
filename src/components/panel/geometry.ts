/**
 * Fixed-coordinate faceplate geometry, traced from reference photography of
 * the hardware. Column x-positions and widths are fixed stage units (the
 * panel's visual signature); section heights flow to their contents. The
 * whole stage scales uniformly, so geometry never reflows.
 *
 * Hardware flow, left to right: LFO stack · tall modulation column ·
 * oscillator towers · center MUSE plate / MIX faders / arp · dual filters ·
 * envelope fader banks · voice control · delay.
 */

export interface StageColumn {
  x: number;
  w: number;
  /** Section titles stacked top to bottom; "@brand" is the MUSE nameplate. */
  titles: string[];
}

export const STAGE_W = 1760;

export const COLUMNS: StageColumn[] = [
  { x: 10, w: 150, titles: ["LFO 1", "LFO 2", "Pitch LFO"] },
  { x: 168, w: 200, titles: ["Modulation Oscillator", "Mod Routing"] },
  { x: 376, w: 150, titles: ["Oscillator 1", "Sync / FM"] },
  { x: 534, w: 150, titles: ["Oscillator 2", "Performance"] },
  { x: 692, w: 210, titles: ["@brand", "Mixer", "Arp / Clock"] },
  { x: 910, w: 168, titles: ["Filter 1"] },
  { x: 1086, w: 168, titles: ["Filter 2"] },
  { x: 1262, w: 180, titles: ["Filter Envelope", "Amplifier Envelope"] },
  { x: 1450, w: 148, titles: ["Voices"] },
  { x: 1606, w: 144, titles: ["Delay"] }
];
