import { describe, expect, it } from "vitest";
import { bipolarKnob, enumParam, knob } from "./builders";
import { formatValue, optionForValue, optionSendValue } from "./format";
import { LFO_WAVES } from "./options";

describe("optionSendValue", () => {
  it("returns the midpoint of an option's range", () => {
    expect(optionSendValue({ label: "Off", min: 0, max: 63 })).toBe(31);
    expect(optionSendValue({ label: "On", min: 64, max: 127 })).toBe(95);
  });

  it("always lands inside the option's own range (round-trip stable)", () => {
    const param = enumParam(14, "Wave", LFO_WAVES);
    for (const opt of LFO_WAVES) {
      expect(optionForValue(param, optionSendValue(opt))).toBe(opt);
    }
  });
});

describe("optionForValue", () => {
  const param = enumParam(14, "Wave", LFO_WAVES);

  it("maps boundary values to the right option", () => {
    expect(optionForValue(param, 0)?.label).toBe("Tri");
    expect(optionForValue(param, 24)?.label).toBe("Tri");
    expect(optionForValue(param, 25)?.label).toBe("Saw");
    expect(optionForValue(param, 127)?.label).toBe("User");
  });

  it("returns undefined for params without options", () => {
    expect(optionForValue(knob(67, "Cutoff"), 64)).toBeUndefined();
  });
});

describe("formatValue", () => {
  it("shows plain numbers for unipolar knobs", () => {
    expect(formatValue(knob(67, "Cutoff"), 96)).toBe("96");
  });

  it("shows signed values around the center for bipolar knobs", () => {
    const pan = bipolarKnob(10, "Pan");
    expect(formatValue(pan, 64)).toBe("0");
    expect(formatValue(pan, 127)).toBe("+63");
    expect(formatValue(pan, 0)).toBe("-64");
  });

  it("shows the option label for enums", () => {
    expect(formatValue(enumParam(14, "Wave", LFO_WAVES), 30)).toBe("Saw");
  });
});
