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

export const KB_TRACK: EnumOption[] = [
  { label: "Off", min: 0, max: 42 },
  { label: "Half", min: 43, max: 84 },
  { label: "Full", min: 85, max: 127 }
];

export const FILTER_ORDER: EnumOption[] = [
  { label: "Serial", min: 0, max: 42 },
  { label: "Stereo", min: 43, max: 84 },
  { label: "Parallel", min: 85, max: 127 }
];

export const ARP_DIRECTION: EnumOption[] = [
  { label: "Order", min: 0, max: 42 },
  { label: "Pattern", min: 43, max: 84 },
  { label: "Random", min: 85, max: 127 }
];

export const ARP_OCTAVES: EnumOption[] = [
  { label: "1", min: 0, max: 31 },
  { label: "2", min: 32, max: 63 },
  { label: "3", min: 64, max: 95 },
  { label: "4", min: 96, max: 127 }
];
