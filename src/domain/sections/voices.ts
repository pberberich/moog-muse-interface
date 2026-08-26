import { bipolarKnob, knob, toggle } from "../builders";
import { Section } from "../types";

export const VOICES: Section = {
  title: "Voices",
  params: [
    knob(92, "Detune", 0, "Voice-to-voice detuning"),
    toggle(108, "Unison", 0, "Stack voices in unison"),
    toggle(109, "Mono", 0, "Monophonic mode"),
    knob(5, "Glide", 0, "Glide (portamento) time"),
    knob(9, "Pan Spread", 0, "Spread voices across the stereo field"),
    bipolarKnob(10, "Pan", "Pan position of the active timbre"),
    knob(7, "Volume", 100, "Volume of the active timbre"),
    knob(8, "Low Cut", 0, "Low-cut filter on the output")
  ]
};
