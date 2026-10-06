import { optionForValue, PARAMS_BY_CC } from "../domain";
import { SyncPairOptions } from "./sync";

/** Panel CCs the oscillator pair reads, from the published chart. */
export const OSC1_OCTAVE_CC = 44;
export const OSC1_FREQUENCY_CC = 45;
export const OSC2_OCTAVE_CC = 49;
export const OSC2_FREQUENCY_CC = 50;
export const SYNC_CC = 54;

/** Footage legend on the panel, as octaves relative to 8'. */
const OCTAVE_CV: Record<string, number> = {
  "16'": -1,
  "8'": 0,
  "4'": 1,
  "2'": 2
};

/** Travel of the Frequency knob, per the parameter table's description. */
const DETUNE_SEMITONES = 7;

/** Note the scope holds while you sweep the panel, A3. */
export const REFERENCE_NOTE = 57;

/** MIDI note to 1V/oct, with A440 (note 69) at 0 V to match I_REF. */
export function noteCv(note: number): number {
  return (note - 69) / 12;
}

/** Reads a panel value by CC — `store.getValue` satisfies this. */
export type ValueReader = (cc: number) => number;

/**
 * Control voltage one oscillator sees: the played note, shifted by the
 * footage selector and the Frequency knob's detune.
 */
export function oscillatorCv(
  read: ValueReader,
  octaveCc: number,
  frequencyCc: number,
  note = REFERENCE_NOTE
): number {
  const octaveParam = PARAMS_BY_CC.get(octaveCc);
  const label = octaveParam && optionForValue(octaveParam, read(octaveCc))?.label;
  const octaves = label ? OCTAVE_CV[label] ?? 0 : 0;
  const detune = ((read(frequencyCc) - 64) / 64) * (DETUNE_SEMITONES / 12);
  return noteCv(note) + octaves + detune;
}

/**
 * Wire the live panel into the circuit model.
 *
 * CC 54 is labelled "Sync 2→1" on the panel, so OSC 2 is the master and OSC 1
 * is the slave whose ramp gets cut short — the oscillator the Sync Lead preset
 * sweeps with the filter envelope.
 */
export function syncPairFromPanel(read: ValueReader, note = REFERENCE_NOTE): SyncPairOptions {
  return {
    masterCv: oscillatorCv(read, OSC2_OCTAVE_CC, OSC2_FREQUENCY_CC, note),
    slaveCv: oscillatorCv(read, OSC1_OCTAVE_CC, OSC1_FREQUENCY_CC, note),
    syncEnabled: read(SYNC_CC) >= 64
  };
}
