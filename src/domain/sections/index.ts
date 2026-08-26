import { Param, Section } from "../types";
import { ARP_CLOCK } from "./arpClock";
import { DELAY } from "./delay";
import { AMP_ENVELOPE, FILTER_ENVELOPE } from "./envelopes";
import { FILTER_1, FILTER_2 } from "./filters";
import { LFO_1, LFO_2, PITCH_LFO } from "./lfos";
import { MIXER } from "./mixer";
import { MOD_OSCILLATOR, MOD_ROUTING } from "./modOscillator";
import { OSCILLATOR_1, OSCILLATOR_2, SYNC_FM } from "./oscillators";
import { PERFORMANCE } from "./performance";
import { VOICES } from "./voices";

/** Panel layout order. */
export const SECTIONS: Section[] = [
  PITCH_LFO,
  LFO_1,
  LFO_2,
  MOD_OSCILLATOR,
  MOD_ROUTING,
  OSCILLATOR_1,
  OSCILLATOR_2,
  SYNC_FM,
  MIXER,
  FILTER_1,
  FILTER_2,
  FILTER_ENVELOPE,
  AMP_ENVELOPE,
  VOICES,
  DELAY,
  ARP_CLOCK,
  PERFORMANCE
];

export const ALL_PARAMS: Param[] = SECTIONS.flatMap((s) => s.params);

export const PARAMS_BY_CC = new Map<number, Param>(ALL_PARAMS.map((p) => [p.cc, p]));

export * from "./arpClock";
export * from "./delay";
export * from "./envelopes";
export * from "./filters";
export * from "./lfos";
export * from "./mixer";
export * from "./modOscillator";
export * from "./oscillators";
export * from "./performance";
export * from "./voices";
