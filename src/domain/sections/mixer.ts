import { knob } from "../builders";
import { Section } from "../types";

export const MIXER: Section = {
  title: "Mixer",
  params: [
    knob(58, "Osc 1", 100, "OSC 1 level"),
    knob(59, "Osc 2", 0, "OSC 2 level"),
    knob(60, "Ring Mod", 0, "Ring modulator level"),
    knob(61, "Mod Osc", 0, "Modulation oscillator level"),
    knob(62, "Noise", 0, "Noise level"),
    knob(65, "Clip Level", 0, "Mixer clipping/drive level")
  ]
};
