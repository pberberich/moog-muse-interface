import { Section, SECTIONS } from "../../domain";

/** Sections whose knob-type params render as faders, like the hardware. */
export const SLIDER_SECTIONS: Record<string, "v" | "h"> = {
  "Filter Envelope": "v",
  "Amplifier Envelope": "v",
  Mixer: "h"
};

/** The hardware gives the filter cutoff knobs extra size. */
export const BIG_KNOB_CCS = new Set([67, 72]);

export function sectionByTitle(title: string): Section | undefined {
  return SECTIONS.find((s) => s.title === title);
}
