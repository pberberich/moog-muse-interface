import { Section, SECTIONS } from "../../domain";

/** Sections whose knob-type params render as faders, like the hardware:
 *  vertical for the envelope banks, horizontal for the MIX block. */
export const SLIDER_SECTIONS: Record<string, "v" | "h"> = {
  "Filter Envelope": "v",
  "Amplifier Envelope": "v",
  Mixer: "h"
};

/** The hardware gives the filter cutoff knobs extra size, mounted on top. */
export const BIG_KNOB_CCS = new Set([67, 72]);

/** Densely packed sections use the smallest knobs, like the hardware. */
export const DENSE_SECTIONS = new Set([
  "Modulation Oscillator",
  "Mod Routing",
  "Arp / Clock"
]);

/** Narrow sections sit slightly tighter so knob pairs fit side by side. */
export const COMPACT_SECTIONS = new Set([
  "Pitch LFO",
  "Performance",
  "Sync / FM",
  "LFO 1",
  "LFO 2"
]);

/** Colored button caps, matching the hardware's accent buttons. */
export const ACCENT_CCS: Record<number, "yellow" | "orange" | "cyan"> = {
  112: "yellow", // Arp On
  71: "orange", // Hold
  106: "cyan", // Delay Timbre A
  107: "cyan" // Delay Timbre B
};

export function sectionByTitle(title: string): Section | undefined {
  return SECTIONS.find((s) => s.title === title);
}
