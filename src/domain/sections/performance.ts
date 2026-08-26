import { knob, toggle } from "../builders";
import { Section } from "../types";

export const PERFORMANCE: Section = {
  title: "Performance",
  params: [
    knob(1, "Mod Wheel", 0, "Modulation wheel"),
    knob(11, "Expression", 127, "Expression pedal"),
    toggle(64, "Sustain", 0, "Sustain pedal"),
    toggle(71, "Hold", 0, "Hold"),
    toggle(3, "Mute", 0, "Clickless mute of the main output")
  ]
};
