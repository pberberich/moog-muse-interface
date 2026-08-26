import { Section, SECTIONS } from "../../domain";

/**
 * Faceplate layout: sections grouped into horizontal strips, echoing the
 * hardware's left-to-right flow (performance/mod sources → sound sources →
 * modifiers → voices/effects). Titles reference ../../domain/sections.
 */
export const PANEL_ROWS: string[][] = [
  ["Performance", "LFO 1", "LFO 2", "Modulation Oscillator"],
  ["Pitch LFO", "Mod Routing"],
  ["Oscillator 1", "Oscillator 2", "Sync / FM"],
  ["Mixer", "Filter 1 · Ladder", "Filter 2 · SVF"],
  ["Filter Envelope", "Amplifier Envelope", "Arp / Clock"],
  ["Voices", "Delay"]
];

export function rowSections(titles: string[]): Section[] {
  return titles
    .map((t) => SECTIONS.find((s) => s.title === t))
    .filter((s): s is Section => s !== undefined);
}
