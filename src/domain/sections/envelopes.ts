import { knob, toggle } from "../builders";
import { Section } from "../types";

export const FILTER_ENVELOPE: Section = {
  title: "Filter Envelope",
  params: [
    knob(79, "Attack", 0),
    knob(81, "Decay", 40, "Published chart lists CC 81 as “Delay”; it is the decay stage"),
    knob(80, "Sustain", 64),
    knob(82, "Release", 40),
    toggle(83, "Loop", 0, "Loop the envelope"),
    toggle(85, "Velocity", 0, "Velocity scales envelope amount")
  ]
};

export const AMP_ENVELOPE: Section = {
  title: "Amplifier Envelope",
  params: [
    knob(86, "Attack", 0),
    knob(88, "Decay", 40, "Published chart lists CC 88 as “Delay”; it is the decay stage"),
    knob(87, "Sustain", 127),
    knob(89, "Release", 40),
    toggle(90, "Loop", 0, "Loop the envelope"),
    toggle(91, "Velocity", 0, "Velocity scales loudness")
  ]
};
