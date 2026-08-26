import { bipolarKnob, enumParam, knob, toggle } from "../builders";
import { FILTER_ORDER, KB_TRACK } from "../options";
import { Section } from "../types";

export const FILTER_1: Section = {
  title: "Filter 1",
  subtitle: "High / Low Pass",
  params: [
    knob(66, "High Pass", 0, "High-pass filter cutoff"),
    knob(67, "Cutoff", 96, "Low-pass ladder cutoff"),
    knob(68, "Resonance", 0, "Ladder resonance"),
    bipolarKnob(69, "Env Amount", "Filter envelope → cutoff"),
    enumParam(70, "KB Track", KB_TRACK, 0, "Keyboard tracking")
  ]
};

export const FILTER_2: Section = {
  title: "Filter 2",
  subtitle: "Low Pass",
  params: [
    knob(72, "Frequency", 96, "State-variable filter frequency"),
    knob(73, "Resonance", 0, "SVF resonance"),
    bipolarKnob(75, "Env Amount", "Filter envelope → frequency"),
    enumParam(76, "KB Track", KB_TRACK, 0, "Keyboard tracking"),
    toggle(77, "Link", 0, "Link both filters' controls"),
    enumParam(78, "Order", FILTER_ORDER, 0, "Filter routing")
  ]
};
