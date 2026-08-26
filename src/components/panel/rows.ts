import { Section, SECTIONS } from "../../domain";

/** Sections whose knob-type params render as horizontal faders (hardware). */
export const SLIDER_SECTIONS: Record<string, "h"> = {
  "Filter Envelope": "h",
  "Amplifier Envelope": "h",
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

/** Bottom-strip sections sit slightly tighter than the default. */
export const COMPACT_SECTIONS = new Set(["Pitch LFO", "Performance", "Sync / FM"]);

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
