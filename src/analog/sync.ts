import { coreFrequency, VcoCore } from "./vco";
import { T_NOMINAL } from "./constants";

export interface SyncPairOptions {
  /** 1V/oct for OSC 2 — the sync master, whose resets drive the pair. */
  masterCv: number;
  /** 1V/oct for OSC 1 — the slave whose ramp gets truncated. */
  slaveCv: number;
  /** CC 54: whether the master's reset pulse reaches the slave's switch. */
  syncEnabled: boolean;
  temperature?: number;
}

export interface PairTrace {
  /** Master ramp, 0..1, one entry per output sample. */
  master: Float32Array;
  /** Slave ramp, 0..1, truncated by the master when sync is on. */
  slave: Float32Array;
  /** Fractional output-sample indices where the slave was forced down. */
  syncResets: number[];
  sampleRate: number;
}

/**
 * Run both cores and couple the master's resets into the slave.
 *
 * Each inner step advances the master first, then walks the slave up to every
 * reset instant the master reported, slams it, and carries on — so the slave
 * is truncated at the master's true sub-sample timing rather than at a step
 * boundary. That timing is the whole character of hard sync: quantizing it to
 * the sample grid is what makes naive implementations sound wrong.
 *
 * Decimation back down to `sampleRate` is a box average over the oversampled
 * run. That is fine for drawing a trace, and deliberately not good enough for
 * audio: every reset is a step discontinuity, so an audio path needs BLEP or
 * antiderivative antialiasing on top of this, not just more oversampling.
 */
export function renderPair(
  options: SyncPairOptions,
  sampleCount: number,
  sampleRate: number,
  oversample = 1
): PairTrace {
  const temperature = options.temperature ?? T_NOMINAL;
  const master = new VcoCore(options.masterCv, temperature);
  const slave = new VcoCore(options.slaveCv, temperature);

  const masterOut = new Float32Array(sampleCount);
  const slaveOut = new Float32Array(sampleCount);
  const syncResets: number[] = [];

  const dt = 1 / (sampleRate * oversample);
  const offsets: number[] = [];
  let masterAcc = 0;
  let slaveAcc = 0;
  let inStep = 0;
  let out = 0;

  for (let k = 0; k < sampleCount * oversample; k++) {
    offsets.length = 0;
    master.advance(dt, (offset) => offsets.push(offset));

    let cursor = 0;
    for (const offset of offsets) {
      slave.advance(offset - cursor);
      if (options.syncEnabled) {
        slave.forceReset();
        syncResets.push((k + offset / dt) / oversample);
      }
      cursor = offset;
    }
    slave.advance(dt - cursor);

    masterAcc += master.ramp;
    slaveAcc += slave.ramp;
    if (++inStep === oversample) {
      masterOut[out] = masterAcc / oversample;
      slaveOut[out] = slaveAcc / oversample;
      out++;
      masterAcc = 0;
      slaveAcc = 0;
      inStep = 0;
    }
  }

  return { master: masterOut, slave: slaveOut, syncResets, sampleRate };
}

/** Sample rate that fits `periods` master cycles into `sampleCount` samples. */
export function windowRate(
  masterCv: number,
  periods: number,
  sampleCount: number,
  temperature = T_NOMINAL
): number {
  return (sampleCount * coreFrequency(masterCv, temperature)) / periods;
}
