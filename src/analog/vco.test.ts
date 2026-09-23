import { describe, expect, it } from "vitest";
import { T_NOMINAL, V_THRESHOLD } from "./constants";
import { converterCurrent, coreFrequency, TAU_RESET, VcoCore } from "./vco";

describe("exponential converter", () => {
  it("turns one volt into one octave", () => {
    expect(converterCurrent(1) / converterCurrent(0)).toBeCloseTo(2, 9);
    expect(converterCurrent(-1) / converterCurrent(0)).toBeCloseTo(0.5, 9);
  });

  it("is trimmed so 0 V runs the core at A440", () => {
    expect(coreFrequency(0)).toBeCloseTo(440, 6);
    expect(coreFrequency(1)).toBeCloseTo(880, 6);
    expect(coreFrequency(-2)).toBeCloseTo(110, 6);
  });

  it("drifts sharp as the junction warms past the tempco trim point", () => {
    const warm = coreFrequency(0, T_NOMINAL + 10);
    expect(warm).toBeGreaterThan(coreFrequency(0));
    // A few cents over ten degrees, not a semitone.
    expect(1200 * Math.log2(warm / coreFrequency(0))).toBeLessThan(10);
  });
});

describe("oscillator core", () => {
  const rate = 96000;

  it("free-runs at the frequency its control voltage asks for", () => {
    const core = new VcoCore(0);
    let resets = 0;
    for (let i = 0; i < rate; i++) core.advance(1 / rate, () => resets++);
    expect(resets).toBe(440);
  });

  it("keeps the ramp inside the comparator's window", () => {
    const core = new VcoCore(1);
    for (let i = 0; i < 2000; i++) {
      core.advance(1 / rate);
      expect(core.ramp).toBeGreaterThanOrEqual(0);
      expect(core.ramp).toBeLessThanOrEqual(1);
    }
  });

  it("reports resets at their sub-sample time, not on the sample grid", () => {
    const core = new VcoCore(0.37);
    const offsets: number[] = [];
    for (let i = 0; i < 500; i++) core.advance(1 / rate, (o) => offsets.push(o));
    expect(offsets.length).toBeGreaterThan(0);
    expect(offsets.some((o) => o > 1e-12 && o < 1 / rate)).toBe(true);
  });

  it("discharges through the switch resistance rather than snapping to zero", () => {
    const core = new VcoCore(0);
    core.v = V_THRESHOLD;
    core.forceReset();
    core.advance(TAU_RESET);
    // One time constant leaves 1/e of the charge on the capacitor.
    expect(core.ramp).toBeCloseTo(Math.exp(-1), 2);
  });
});
