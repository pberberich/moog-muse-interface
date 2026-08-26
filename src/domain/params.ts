/**
 * Moog Muse MIDI CC parameter tables.
 *
 * CC assignments follow the Muse MIDI implementation chart (as published in
 * Moog's firmware documentation and mirrored by the open midi.guide dataset).
 * If a firmware update changes an assignment, this file is the only place
 * that needs editing.
 */

export type ParamKind = "knob" | "toggle" | "enum";

export interface EnumOption {
  label: string;
  /** Inclusive incoming-value range that maps to this option. */
  min: number;
  max: number;
}

export interface Param {
  cc: number;
  name: string;
  kind: ParamKind;
  /** Bipolar knobs render a center detent and display -64..+63. */
  bipolar?: boolean;
  options?: EnumOption[];
  defaultValue: number;
  description?: string;
}

export interface Section {
  title: string;
  params: Param[];
}

const ONOFF: EnumOption[] = [
  { label: "Off", min: 0, max: 63 },
  { label: "On", min: 64, max: 127 }
];

const LFO_WAVES: EnumOption[] = [
  { label: "Tri", min: 0, max: 24 },
  { label: "Saw", min: 25, max: 49 },
  { label: "Sqr", min: 50, max: 74 },
  { label: "Rnd", min: 75, max: 99 },
  { label: "User", min: 100, max: 127 }
];

const MODOSC_WAVES: EnumOption[] = [
  { label: "Sine", min: 0, max: 24 },
  { label: "Saw", min: 25, max: 49 },
  { label: "Ramp", min: 50, max: 74 },
  { label: "Sqr", min: 75, max: 99 },
  { label: "Noise", min: 100, max: 127 }
];

const OCTAVES: EnumOption[] = [
  { label: "16'", min: 0, max: 31 },
  { label: "8'", min: 32, max: 63 },
  { label: "4'", min: 64, max: 95 },
  { label: "2'", min: 96, max: 127 }
];

const KB_TRACK: EnumOption[] = [
  { label: "Off", min: 0, max: 42 },
  { label: "Half", min: 43, max: 84 },
  { label: "Full", min: 85, max: 127 }
];

function knob(cc: number, name: string, defaultValue = 0, description?: string): Param {
  return { cc, name, kind: "knob", defaultValue, description };
}

function bipolarKnob(cc: number, name: string, description?: string): Param {
  return { cc, name, kind: "knob", bipolar: true, defaultValue: 64, description };
}

function toggle(cc: number, name: string, defaultValue = 0, description?: string): Param {
  return { cc, name, kind: "toggle", options: ONOFF, defaultValue, description };
}

function enumParam(
  cc: number,
  name: string,
  options: EnumOption[],
  defaultValue = 0,
  description?: string
): Param {
  return { cc, name, kind: "enum", options, defaultValue, description };
}

export const SECTIONS: Section[] = [
  {
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
  },
  {
    title: "LFO 1",
    params: [
      knob(12, "Rate", 32, "LFO 1 frequency"),
      knob(13, "Amount", 0, "LFO 1 amount"),
      enumParam(14, "Wave", LFO_WAVES, 0, "LFO 1 waveform")
    ]
  },
  {
    title: "LFO 2",
    params: [
      knob(15, "Rate", 32, "LFO 2 frequency"),
      knob(16, "Amount", 0, "LFO 2 amount"),
      enumParam(17, "Wave", LFO_WAVES, 0, "LFO 2 waveform")
    ]
  },
  {
    title: "Modulation Oscillator",
    params: [
      knob(25, "Frequency", 32, "Modulation oscillator frequency"),
      enumParam(28, "Wave", MODOSC_WAVES, 0, "Modulation oscillator waveform"),
      toggle(26, "Audio", 0, "Audio-rate operation"),
      toggle(27, "KB Track", 0, "Keyboard tracking of frequency"),
      toggle(29, "KB Reset", 0, "Restart wave cycle on each key press"),
      toggle(30, "Unipolar", 0, "Unipolar output mode")
    ]
  },
  {
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
  },
  {
    title: "Oscillator 1",
    params: [
      enumParam(44, "Octave", OCTAVES, 40, "OSC 1 octave (16'/8'/4'/2')"),
      bipolarKnob(45, "Frequency", "Detune ±7 semitones"),
      knob(46, "Tri/Saw", 0, "Triangle ↔ sawtooth blend"),
      knob(47, "Pulse Width", 64, "Pulse wave duty cycle"),
      knob(48, "Wave Mix", 0, "Tri/saw ↔ pulse blend")
    ]
  },
  {
    title: "Oscillator 2",
    params: [
      enumParam(49, "Octave", OCTAVES, 40, "OSC 2 octave (16'/8'/4'/2')"),
      bipolarKnob(50, "Frequency", "Detune ±7 semitones"),
      knob(51, "Tri/Saw", 0, "Triangle ↔ sawtooth blend"),
      knob(52, "Pulse Width", 64, "Pulse wave duty cycle"),
      knob(53, "Wave Mix", 0, "Tri/saw ↔ pulse blend")
    ]
  },
  {
    title: "Sync / FM",
    params: [
      toggle(54, "Sync 2→1", 0, "Hard sync OSC 1 to OSC 2"),
      toggle(55, "FM 2→1", 0, "OSC 2 frequency-modulates OSC 1"),
      toggle(56, "FM 1→2", 0, "OSC 1 frequency-modulates OSC 2"),
      knob(57, "FM Amount", 0, "Oscillator FM depth")
    ]
  },
  {
    title: "Mixer",
    params: [
      knob(58, "Osc 1", 100, "OSC 1 level"),
      knob(59, "Osc 2", 0, "OSC 2 level"),
      knob(60, "Ring Mod", 0, "Ring modulator level"),
      knob(61, "Mod Osc", 0, "Modulation oscillator level"),
      knob(62, "Noise", 0, "Noise level"),
      knob(65, "Clip Level", 0, "Mixer clipping/drive level")
    ]
  },
  {
    title: "Filter 1 · Ladder",
    params: [
      knob(66, "High Pass", 0, "High-pass filter cutoff"),
      knob(67, "Cutoff", 96, "Low-pass ladder cutoff"),
      knob(68, "Resonance", 0, "Ladder resonance"),
      bipolarKnob(69, "Env Amount", "Filter envelope → cutoff"),
      enumParam(70, "KB Track", KB_TRACK, 0, "Keyboard tracking")
    ]
  },
  {
    title: "Filter 2 · SVF",
    params: [
      knob(72, "Frequency", 96, "State-variable filter frequency"),
      knob(73, "Resonance", 0, "SVF resonance"),
      bipolarKnob(75, "Env Amount", "Filter envelope → frequency"),
      enumParam(76, "KB Track", KB_TRACK, 0, "Keyboard tracking"),
      toggle(77, "Link", 0, "Link both filters' controls"),
      enumParam(
        78,
        "Order",
        [
          { label: "Serial", min: 0, max: 42 },
          { label: "Stereo", min: 43, max: 84 },
          { label: "Parallel", min: 85, max: 127 }
        ],
        0,
        "Filter routing"
      )
    ]
  },
  {
    title: "Filter Envelope",
    params: [
      knob(79, "Attack", 0),
      knob(81, "Decay", 40, "Published chart lists CC 81 as “Delay”; it is the decay stage"),
      knob(80, "Sustain", 64),
      knob(82, "Release", 40),
      toggle(83, "Loop", 0, "Loop the envelope"),
      toggle(85, "Velocity", 0, "Velocity scales envelope amount")
    ]
  },
  {
    title: "Amplifier Envelope",
    params: [
      knob(86, "Attack", 0),
      knob(88, "Decay", 40, "Published chart lists CC 88 as “Delay”; it is the decay stage"),
      knob(87, "Sustain", 127),
      knob(89, "Release", 40),
      toggle(90, "Loop", 0, "Loop the envelope"),
      toggle(91, "Velocity", 0, "Velocity scales loudness")
    ]
  },
  {
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
  },
  {
    title: "Delay",
    params: [
      knob(93, "Time L", 32, "Left delay time"),
      knob(94, "Time R", 32, "Right delay time"),
      toggle(95, "Link", 127, "Link left/right delay times"),
      toggle(102, "Clock Sync", 0, "Sync delay time to the clock"),
      knob(103, "Feedback", 32),
      knob(104, "Character", 0, "Delay tone/character"),
      knob(105, "Mix", 0, "Dry/wet mix"),
      toggle(106, "Timbre A", 127, "Delay on Timbre A"),
      toggle(107, "Timbre B", 127, "Delay on Timbre B")
    ]
  },
  {
    title: "Arp / Clock",
    params: [
      toggle(112, "Arp On", 0, "Arpeggiator on/off"),
      enumParam(
        114,
        "Direction",
        [
          { label: "Order", min: 0, max: 42 },
          { label: "Pattern", min: 43, max: 84 },
          { label: "Random", min: 85, max: 127 }
        ],
        0,
        "Arpeggiator direction mode"
      ),
      toggle(113, "FW/BK", 0, "Arpeggiator forward/backward"),
      enumParam(
        115,
        "Octaves",
        [
          { label: "1", min: 0, max: 31 },
          { label: "2", min: 32, max: 63 },
          { label: "3", min: 64, max: 95 },
          { label: "4", min: 96, max: 127 }
        ],
        0,
        "Arpeggiator octave range"
      ),
      knob(111, "Arp Div", 64, "Arpeggiator clock division"),
      knob(110, "Seq Div", 64, "Sequencer clock division"),
      knob(116, "Tempo", 64, "Clock tempo")
    ]
  },
  {
    title: "Performance",
    params: [
      knob(1, "Mod Wheel", 0, "Modulation wheel"),
      knob(11, "Expression", 127, "Expression pedal"),
      toggle(64, "Sustain", 0, "Sustain pedal"),
      toggle(71, "Hold", 0, "Hold"),
      toggle(3, "Mute", 0, "Clickless mute of the main output")
    ]
  }
];

export const ALL_PARAMS: Param[] = SECTIONS.flatMap((s) => s.params);

export const PARAMS_BY_CC = new Map<number, Param>(ALL_PARAMS.map((p) => [p.cc, p]));

/** Value to transmit when the user picks an enum option (midpoint of its range). */
export function optionSendValue(opt: EnumOption): number {
  return Math.floor((opt.min + opt.max) / 2);
}

/** Which option an incoming 0-127 value falls into. */
export function optionForValue(param: Param, value: number): EnumOption | undefined {
  return param.options?.find((o) => value >= o.min && value <= o.max);
}

export function formatValue(param: Param, value: number): string {
  if (param.options) return optionForValue(param, value)?.label ?? String(value);
  if (param.bipolar) {
    const v = value - 64;
    return v > 0 ? `+${v}` : String(v);
  }
  return String(value);
}
