import { describe, expect, it } from "vitest";
import { ALL_PARAMS, PRESETS } from "../domain";
import {
  OSC1_FREQUENCY_CC,
  OSC1_OCTAVE_CC,
  REFERENCE_NOTE,
  SYNC_CC,
  noteCv,
  oscillatorCv,
  syncPairFromPanel
} from "./patch";
import { coreFrequency } from "./vco";

/** The init panel, overlaid with whatever the case under test changes. */
function panelReader(overrides: Record<number, number> = {}) {
  const values = new Map(ALL_PARAMS.map((p) => [p.cc, p.defaultValue]));
  for (const [cc, value] of Object.entries(overrides)) values.set(Number(cc), value);
  return (cc: number) => values.get(cc) ?? 0;
}

const syncLead = PRESETS.find((p) => p.name === "Sync Lead")!;

describe("panel to control voltage", () => {
  it("puts A440 at zero volts", () => {
    expect(noteCv(69)).toBe(0);
    expect(coreFrequency(noteCv(69))).toBeCloseTo(440, 6);
    expect(coreFrequency(noteCv(57))).toBeCloseTo(220, 6);
  });

  it("reads the init panel as a plain 8-foot oscillator on the reference note", () => {
    const cv = oscillatorCv(panelReader(), OSC1_OCTAVE_CC, OSC1_FREQUENCY_CC);
    expect(cv).toBeCloseTo(noteCv(REFERENCE_NOTE), 9);
  });

  it("shifts an octave per footage step", () => {
    const at = (value: number) =>
      oscillatorCv(panelReader({ [OSC1_OCTAVE_CC]: value }), OSC1_OCTAVE_CC, OSC1_FREQUENCY_CC);
    expect(at(16)).toBeCloseTo(at(40) - 1, 9); // 16' against 8'
    expect(at(80)).toBeCloseTo(at(40) + 1, 9); // 4'
    expect(at(112)).toBeCloseTo(at(40) + 2, 9); // 2'
  });

  it("detunes up to seven semitones either side of the knob's detent", () => {
    const at = (value: number) =>
      oscillatorCv(panelReader({ [OSC1_FREQUENCY_CC]: value }), OSC1_OCTAVE_CC, OSC1_FREQUENCY_CC);
    const centre = at(64);
    expect((at(0) - centre) * 12).toBeCloseTo(-7, 6);
    expect((at(127) - centre) * 12).toBeGreaterThan(6.8);
  });
});

describe("syncPairFromPanel", () => {
  it("leaves sync off on the init panel", () => {
    expect(syncPairFromPanel(panelReader()).syncEnabled).toBe(false);
  });

  it("reads the Sync Lead preset with OSC 2 driving OSC 1", () => {
    const pair = syncPairFromPanel(panelReader(syncLead.values));
    expect(syncLead.values[SYNC_CC]).toBeGreaterThanOrEqual(64);
    expect(pair.syncEnabled).toBe(true);
    // The preset puts the slave an octave up and sharp; the master holds the note.
    expect(pair.slaveCv).toBeGreaterThan(pair.masterCv + 1);
    expect(pair.masterCv).toBeCloseTo(noteCv(REFERENCE_NOTE), 9);
  });

  it("keeps the slave audibly above the master, where sync has something to cut", () => {
    const pair = syncPairFromPanel(panelReader(syncLead.values));
    expect(coreFrequency(pair.slaveCv)).toBeGreaterThan(coreFrequency(pair.masterCv) * 2);
  });
});
