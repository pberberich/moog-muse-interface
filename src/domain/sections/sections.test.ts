import { describe, expect, it } from "vitest";
import { ALL_PARAMS, PARAMS_BY_CC, SECTIONS } from ".";

describe("Muse parameter tables", () => {
  it("covers the full published CC chart (100+ parameters)", () => {
    expect(ALL_PARAMS.length).toBeGreaterThanOrEqual(100);
    expect(SECTIONS.length).toBe(17);
  });

  it("has no duplicate CC assignments", () => {
    const ccs = ALL_PARAMS.map((p) => p.cc);
    expect(new Set(ccs).size).toBe(ccs.length);
  });

  it("keeps every CC and default inside the 7-bit MIDI range", () => {
    for (const p of ALL_PARAMS) {
      expect(p.cc, p.name).toBeGreaterThanOrEqual(0);
      expect(p.cc, p.name).toBeLessThanOrEqual(127);
      expect(p.defaultValue, p.name).toBeGreaterThanOrEqual(0);
      expect(p.defaultValue, p.name).toBeLessThanOrEqual(127);
    }
  });

  it("gives every enum/toggle contiguous options covering 0-127 exactly", () => {
    for (const p of ALL_PARAMS) {
      if (!p.options) continue;
      let expectedMin = 0;
      for (const opt of p.options) {
        expect(opt.min, `${p.name}/${opt.label}`).toBe(expectedMin);
        expect(opt.max, `${p.name}/${opt.label}`).toBeGreaterThanOrEqual(opt.min);
        expectedMin = opt.max + 1;
      }
      expect(expectedMin - 1, p.name).toBe(127);
    }
  });

  it("indexes every parameter by CC", () => {
    expect(PARAMS_BY_CC.size).toBe(ALL_PARAMS.length);
    expect(PARAMS_BY_CC.get(67)?.name).toBe("Cutoff");
    expect(PARAMS_BY_CC.get(1)?.name).toBe("Mod Wheel");
  });

  it("pins spot-checked assignments from the published chart", () => {
    const expected: Record<number, string> = {
      12: "Rate", // LFO 1
      44: "Octave", // OSC 1
      58: "Osc 1", // mixer level
      67: "Cutoff", // Filter 1
      72: "Frequency", // Filter 2
      86: "Attack", // amp envelope
      105: "Mix", // delay
      116: "Tempo"
    };
    for (const [cc, name] of Object.entries(expected)) {
      expect(PARAMS_BY_CC.get(Number(cc))?.name, `CC ${cc}`).toBe(name);
    }
  });
});
