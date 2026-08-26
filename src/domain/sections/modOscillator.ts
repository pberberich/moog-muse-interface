import { enumParam, knob, toggle } from "../builders";
import { MODOSC_WAVES } from "../options";
import { Section } from "../types";

export const MOD_OSCILLATOR: Section = {
  title: "Modulation Oscillator",
  params: [
    knob(25, "Frequency", 32, "Modulation oscillator frequency"),
    enumParam(28, "Wave", MODOSC_WAVES, 0, "Modulation oscillator waveform"),
    toggle(26, "Audio", 0, "Audio-rate operation"),
    toggle(27, "KB Track", 0, "Keyboard tracking of frequency"),
    toggle(29, "KB Reset", 0, "Restart wave cycle on each key press"),
    toggle(30, "Unipolar", 0, "Unipolar output mode")
  ]
};

export const MOD_ROUTING: Section = {
  title: "Mod Routing",
  params: [
    knob(31, "Pitch Amt", 0, "FM depth into the oscillator section"),
    toggle(33, "Pitch→1", 0, "Frequency modulation of OSC 1"),
    toggle(34, "Pitch→2", 0, "Frequency modulation of OSC 2"),
    knob(35, "PWM Amt", 0, "Pulse-width modulation depth"),
    toggle(36, "PWM→1", 0, "PWM of OSC 1"),
    toggle(37, "PWM→2", 0, "PWM of OSC 2"),
    knob(39, "Filter Amt", 0, "Cutoff modulation depth"),
    toggle(40, "→ Filt 1", 0, "Cutoff modulation of Filter 1"),
    toggle(41, "→ Filt 2", 0, "Cutoff modulation of Filter 2"),
    knob(42, "VCA Amt", 0, "Amplitude modulation (tremolo)"),
    toggle(43, "VCA Pan", 0, "Invert right-VCA phase for auto-pan")
  ]
};
