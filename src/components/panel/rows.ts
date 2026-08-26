import { Section, SECTIONS } from "../../domain";

/** Sections whose knob-type params render as faders — all vertical on the
 *  hardware (envelope banks and the MIX block alike). */
export const SLIDER_SECTIONS: Record<string, "v" | "h"> = {
  "Filter Envelope": "v",
  "VCA Envelope": "v",
  Mixer: "v"
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

/** Light-up cap buttons, matching the hardware. Buttons not listed here
 *  render as the small red lozenge LED-buttons used across the panel. */
export const ACCENT_CCS: Record<number, "yellow" | "orange" | "cyan" | "white"> = {
  112: "yellow", // Arp On
  71: "white", // Hold — white cap on the hardware's left cheek
  106: "cyan", // Delay Timbre A
  107: "cyan" // Delay Timbre B
};

export function sectionByTitle(title: string): Section | undefined {
  return SECTIONS.find((s) => s.title === title);
}
