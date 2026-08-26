import { bipolarKnob, enumParam, knob, toggle } from "../builders";
import { LFO_WAVES } from "../options";
import { Section } from "../types";

export const PITCH_LFO: Section = {
  title: "Pitch LFO",
  params: [
    knob(18, "Rate", 32, "Pitch LFO frequency"),
    bipolarKnob(19, "Shape", "Waveform angle: saw ↔ triangle ↔ ramp"),
    bipolarKnob(20, "Amount", "Modulation depth of hardwired destinations"),
    toggle(21, "Osc 1", 0, "Route Pitch LFO to Oscillator 1"),
    toggle(22, "Osc 2", 0, "Route Pitch LFO to Oscillator 2"),
    toggle(23, "Mod Osc", 0, "Route Pitch LFO to the Modulation Oscillator"),
    toggle(24, "Detune", 0, "Route Pitch LFO to Voice Detune")
  ]
};

export const LFO_1: Section = {
  title: "LFO 1",
  params: [
    knob(12, "Rate", 32, "LFO 1 frequency"),
    knob(13, "Amount", 0, "LFO 1 amount"),
    enumParam(14, "Wave", LFO_WAVES, 0, "LFO 1 waveform")
  ]
};

export const LFO_2: Section = {
  title: "LFO 2",
  params: [
    knob(15, "Rate", 32, "LFO 2 frequency"),
    knob(16, "Amount", 0, "LFO 2 amount"),
    enumParam(17, "Wave", LFO_WAVES, 0, "LFO 2 waveform")
  ]
};
