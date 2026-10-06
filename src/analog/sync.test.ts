import { describe, expect, it } from "vitest";
import { magnitudeSpectrum } from "./spectrum";
import { renderPair, windowRate } from "./sync";
import { coreFrequency, VcoCore } from "./vco";

/** 11 Hz per bin, so 440 Hz lands exactly on bin 40 and its harmonics follow. */
const RATE = 45056;
const SIZE = 4096;
const BIN_440 = 40;

const slaveSpectrum = (syncEnabled: boolean, slaveCv: number) =>
  magnitudeSpectrum(renderPair({ masterCv: 0, slaveCv, syncEnabled }, SIZE, RATE, 8).slave);

/** True frequency of a free-running core, from its own reset timestamps. */
function measuredFrequency(cv: number, cycles = 200): number {
  const core = new VcoCore(cv);
  const dt = 1 / 2_000_000;
  let t = 0;
  let first = -1;
  let last = -1;
  let count = 0;
  while (count <= cycles) {
    core.advance(dt, (offset) => {
      if (first < 0) first = t + offset;
      else {
        last = t + offset;
        count++;
      }
    });
    t += dt;
  }
  return count / (last - first);
}

describe("hard sync", () => {
  it("resets the slave once per master cycle", () => {
    const seconds = SIZE / RATE;
    const trace = renderPair({ masterCv: 0, slaveCv: 1.5, syncEnabled: true }, SIZE, RATE, 8);
    expect(trace.syncResets.length).toBe(Math.round(coreFrequency(0) * seconds));
  });

  it("leaves the slave alone when the panel switch is off", () => {
    const trace = renderPair({ masterCv: 0, slaveCv: 1.5, syncEnabled: false }, SIZE, RATE, 8);
    expect(trace.syncResets).toHaveLength(0);
  });

  it("moves the slave's fundamental down to the master", () => {
    const synced = slaveSpectrum(true, 1.5);
    // Partials land on the master's series even though the slave runs at 1244 Hz.
    expect(synced[BIN_440]).toBeGreaterThan(-20);
    expect(synced[BIN_440 * 2]).toBeGreaterThan(-20);
    expect(synced[BIN_440 * 3]).toBeGreaterThan(-20);

    const free = slaveSpectrum(false, 1.5);
    // Free-running, the slave has no energy at the master's pitch at all.
    expect(free[BIN_440]).toBeLessThan(-60);
  });

  it("parks its formant peak on the slave's own tuning", () => {
    const synced = slaveSpectrum(true, 1.5);
    let peak = 0;
    for (let i = 1; i < synced.length; i++) if (synced[i] > synced[peak]) peak = i;

    // Every strong partial is a master harmonic...
    expect(peak % BIN_440).toBe(0);
    // ...but the loudest one sits by the slave's frequency, which is what you
    // hear sweep when the Frequency knob moves.
    const peakHz = (peak * RATE) / SIZE;
    const slaveHz = coreFrequency(1.5);
    expect(Math.abs(peakHz - slaveHz)).toBeLessThan(Math.abs(peakHz - coreFrequency(0)));
  });

  it("holds the slave strictly periodic with the master", () => {
    const trace = renderPair({ masterCv: 0, slaveCv: 1.5, syncEnabled: true }, SIZE, RATE, 8);
    const spacings = trace.syncResets.slice(1).map((r, i) => r - trace.syncResets[i]);
    const nominal = RATE / coreFrequency(0);
    for (const gap of spacings) expect(gap).toBeCloseTo(nominal, 0);
  });

  it("tracks octaves a shade flat, the way a core with a real reset does", () => {
    // Each cycle spends T_RESET discharging and restarts from the residue the
    // switch could not drain, so the measured pitch never lands exactly on the
    // converter's ideal. The error grows with frequency — the reason a real
    // oscillator needs a high-frequency trim on top of its 1V/oct scale.
    const ratio = measuredFrequency(1) / measuredFrequency(0);
    expect(ratio).toBeLessThan(2);
    expect(2 - ratio).toBeLessThan(0.01);
  });
});

describe("scope window", () => {
  it("fits the requested number of master cycles into the buffer", () => {
    const rate = windowRate(0, 4, 800);
    const trace = renderPair({ masterCv: 0, slaveCv: 0, syncEnabled: true }, 800, rate, 4);
    expect(trace.syncResets.length).toBe(4);
  });
});
