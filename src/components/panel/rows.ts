import { Section, SECTIONS } from "../../domain";

/**
 * Faceplate layout traced from reference photography of the hardware:
 * vertical columns of stacked sections, left to right. A string[] entry
 * places two sections side by side (Oscillators, Filters), and the "@brand"
 * marker renders the MUSE nameplate like the hardware's center block.
 */
export type PanelGroup = string | string[];

export interface PanelColumn {
  span: number;
  groups: PanelGroup[];
}

export const PANEL_COLUMNS: PanelColumn[] = [
  { span: 3, groups: ["LFO 1", "LFO 2", "Pitch LFO"] },
  { span: 4, groups: ["Modulation Oscillator", "Mod Routing"] },
  { span: 4, groups: [["Oscillator 1", "Oscillator 2"], "Sync / FM"] },
  { span: 4, groups: ["@brand", "Mixer", "Arp / Clock"] },
  { span: 5, groups: [["Filter 1", "Filter 2"], "Voices"] },
  { span: 4, groups: ["Filter Envelope", "Amplifier Envelope"] },
  { span: 3, groups: ["Performance", "Delay"] }
];

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
