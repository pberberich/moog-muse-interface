import { EnumOption } from "./types";

export const ONOFF: EnumOption[] = [
  { label: "Off", min: 0, max: 63 },
  { label: "On", min: 64, max: 127 }
];

export const LFO_WAVES: EnumOption[] = [
  { label: "Tri", min: 0, max: 24 },
  { label: "Saw", min: 25, max: 49 },
  { label: "Sqr", min: 50, max: 74 },
  { label: "Rnd", min: 75, max: 99 },
  { label: "User", min: 100, max: 127 }
];

export const MODOSC_WAVES: EnumOption[] = [
  { label: "Sine", min: 0, max: 24 },
  { label: "Saw", min: 25, max: 49 },
  { label: "Ramp", min: 50, max: 74 },
  { label: "Sqr", min: 75, max: 99 },
  { label: "Noise", min: 100, max: 127 }
];

export const OCTAVES: EnumOption[] = [
  { label: "16'", min: 0, max: 31 },
  { label: "8'", min: 32, max: 63 },
  { label: "4'", min: 64, max: 95 },
  { label: "2'", min: 96, max: 127 }
];

/* Option labels below match the panel silkscreen on the hardware. */

export const KB_TRACK: EnumOption[] = [
  { label: "Off", min: 0, max: 42 },
  { label: "1:2", min: 43, max: 84 },
  { label: "1:1", min: 85, max: 127 }
];

export const FILTER_ORDER: EnumOption[] = [
  { label: "Ser", min: 0, max: 42 },
  { label: "Str", min: 43, max: 84 },
  { label: "Par", min: 85, max: 127 }
];

export const ARP_DIRECTION: EnumOption[] = [
  { label: "Ord", min: 0, max: 42 },
  { label: "Ptn", min: 43, max: 84 },
  { label: "Rnd", min: 85, max: 127 }
];

export const ARP_OCTAVES: EnumOption[] = [
  { label: "1", min: 0, max: 31 },
  { label: "2", min: 32, max: 63 },
  { label: "3", min: 64, max: 95 },
  { label: "4", min: 96, max: 127 }
];
