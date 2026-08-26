import { bipolarKnob, enumParam, knob, toggle } from "../builders";
import { OCTAVES } from "../options";
import { Section } from "../types";

export const OSCILLATOR_1: Section = {
  title: "Oscillator 1",
  params: [
    enumParam(44, "Octave", OCTAVES, 40, "OSC 1 octave (16'/8'/4'/2')"),
    bipolarKnob(45, "Frequency", "Detune ±7 semitones"),
    knob(46, "Tri/Saw", 0, "Triangle ↔ sawtooth blend"),
    knob(47, "Pulse Width", 64, "Pulse wave duty cycle"),
    knob(48, "Wave Mix", 0, "Tri/saw ↔ pulse blend")
  ]
};

export const OSCILLATOR_2: Section = {
  title: "Oscillator 2",
  params: [
    enumParam(49, "Octave", OCTAVES, 40, "OSC 2 octave (16'/8'/4'/2')"),
    bipolarKnob(50, "Frequency", "Detune ±7 semitones"),
    knob(51, "Tri/Saw", 0, "Triangle ↔ sawtooth blend"),
    knob(52, "Pulse Width", 64, "Pulse wave duty cycle"),
    knob(53, "Wave Mix", 0, "Tri/saw ↔ pulse blend")
  ]
};

export const SYNC_FM: Section = {
  title: "Sync / FM",
  params: [
    toggle(54, "Sync 2→1", 0, "Hard sync OSC 1 to OSC 2"),
    toggle(55, "FM 2→1", 0, "OSC 2 frequency-modulates OSC 1"),
    toggle(56, "FM 1→2", 0, "OSC 1 frequency-modulates OSC 2"),
    knob(57, "FM Amount", 0, "Oscillator FM depth")
  ]
};
