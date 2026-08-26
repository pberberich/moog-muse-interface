import { describe, expect, it } from "vitest";
import { PARAMS_BY_CC } from "../sections";
import { PRESETS } from "./presets";

describe("starter presets", () => {
  it("has uniquely named presets with descriptions", () => {
    const names = PRESETS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
    for (const p of PRESETS) expect(p.description.length).toBeGreaterThan(0);
  });

  it("only references CCs that exist in the parameter tables", () => {
    for (const preset of PRESETS) {
      for (const cc of Object.keys(preset.values)) {
        expect(PARAMS_BY_CC.has(Number(cc)), `${preset.name}: CC ${cc}`).toBe(true);
      }
    }
  });

  it("keeps every value inside the 7-bit MIDI range", () => {
    for (const preset of PRESETS) {
      for (const [cc, value] of Object.entries(preset.values)) {
        expect(value, `${preset.name}: CC ${cc}`).toBeGreaterThanOrEqual(0);
        expect(value, `${preset.name}: CC ${cc}`).toBeLessThanOrEqual(127);
      }
    }
  });

  it("respects enum option boundaries for switch parameters", () => {
    for (const preset of PRESETS) {
      for (const [cc, value] of Object.entries(preset.values)) {
        const param = PARAMS_BY_CC.get(Number(cc))!;
        if (!param.options) continue;
        const hit = param.options.some((o) => value >= o.min && value <= o.max);
        expect(hit, `${preset.name}: CC ${cc} = ${value}`).toBe(true);
      }
    }
  });
});
