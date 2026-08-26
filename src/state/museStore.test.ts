import { beforeEach, describe, expect, it } from "vitest";
import { ALL_PARAMS, PARAMS_BY_CC, PRESETS } from "../domain";
import { FakeTransport } from "../midi/fakeTransport";
import { MuseStore } from "./museStore";

let transport: FakeTransport;
let store: MuseStore;

beforeEach(async () => {
  localStorage.clear();
  transport = new FakeTransport();
  store = new MuseStore(transport);
  await store.init();
});

describe("parameter values", () => {
  it("starts every parameter at its default", () => {
    for (const p of ALL_PARAMS) expect(store.getValue(p.cc)).toBe(p.defaultValue);
  });

  it("transmits a CC on the selected channel when set from the UI", () => {
    store.setChannel(3);
    store.setValue(67, 100);
    expect(transport.sent).toContainEqual([0xb3, 67, 100]);
    expect(store.getValue(67)).toBe(100);
  });

  it("clamps and rounds values to 0-127", () => {
    store.setValue(67, 999);
    expect(store.getValue(67)).toBe(127);
    store.setValue(67, -5);
    expect(store.getValue(67)).toBe(0);
    store.setValue(67, 63.7);
    expect(store.getValue(67)).toBe(64);
  });

  it("does not re-send when the value is unchanged", () => {
    store.setValue(67, 100);
    const sends = transport.sent.length;
    store.setValue(67, 100);
    expect(transport.sent.length).toBe(sends);
  });
});

describe("incoming MIDI", () => {
  it("updates state from a CC on the active channel without echoing it back", () => {
    transport.receive([0xb0, 67, 42]);
    expect(store.getValue(67)).toBe(42);
    expect(store.lastIncoming).toBe("CC 67 = 42");
    expect(transport.sent).toHaveLength(0);
  });

  it("ignores CCs on other channels", () => {
    transport.receive([0xb5, 67, 42]);
    expect(store.getValue(67)).toBe(PARAMS_BY_CC.get(67)!.defaultValue);
  });

  it("ignores unmapped CCs and non-CC messages", () => {
    transport.receive([0xb0, 4, 99]); // CC 4 is not in the chart
    transport.receive([0x90, 60, 100]); // note on
    expect(store.lastIncoming).toBe("");
  });
});

describe("notes and bulk send", () => {
  it("sends note on/off on the selected channel", () => {
    store.setChannel(1);
    store.noteOn(60, 90);
    store.noteOff(60);
    expect(transport.sent).toContainEqual([0x91, 60, 90]);
    expect(transport.sent).toContainEqual([0x81, 60, 0]);
  });

  it("sends 14-bit pitch bend with center/extremes clamped", () => {
    store.pitchBend(0);
    store.pitchBend(1.5);
    store.pitchBend(-2);
    expect(transport.sent).toContainEqual([0xe0, 8192 & 0x7f, 8192 >> 7]); // center
    expect(transport.sent).toContainEqual([0xe0, 16383 & 0x7f, 16383 >> 7]); // max
    expect(transport.sent).toContainEqual([0xe0, 1 & 0x7f, 0]); // min (8192-8191)
  });

  it("sendAll transmits exactly one CC per parameter", () => {
    store.sendAll();
    expect(transport.sent).toHaveLength(ALL_PARAMS.length);
    const ccs = transport.sent.map(([, cc]) => cc);
    expect(new Set(ccs).size).toBe(ALL_PARAMS.length);
  });

  it("swapCompare flips between two independent edit buffers", () => {
    store.setValue(67, 10);
    store.swapCompare(); // seeds buffer B with the current panel
    store.setValue(67, 120);

    store.swapCompare();
    expect(store.getValue(67)).toBe(10);
    store.swapCompare();
    expect(store.getValue(67)).toBe(120);
  });

  it("swapCompare transmits the swapped buffer", () => {
    store.swapCompare();
    transport.sent = [];
    store.swapCompare();
    expect(transport.sent).toHaveLength(ALL_PARAMS.length);
  });

  it("panic sends all-sound-off and all-notes-off on the active channel", () => {
    store.setChannel(2);
    store.panic();
    expect(transport.sent).toContainEqual([0xb2, 120, 0]);
    expect(transport.sent).toContainEqual([0xb2, 123, 0]);
  });
});

describe("presets", () => {
  it("applies preset values on top of init defaults and transmits everything", () => {
    const pad = PRESETS.find((p) => p.name === "Warm Pad")!;
    store.setValue(3, 127); // stray change a preset never touches (Mute)

    transport.sent = [];
    store.applyPreset(pad);

    for (const [cc, value] of Object.entries(pad.values)) {
      expect(store.getValue(Number(cc))).toBe(value);
    }
    expect(store.getValue(3)).toBe(PARAMS_BY_CC.get(3)!.defaultValue);
    expect(transport.sent).toHaveLength(ALL_PARAMS.length);
  });
});

describe("patch library", () => {
  it("saves, loads, and deletes patches", () => {
    store.setValue(67, 12);
    store.savePatch("dark pad");
    store.setValue(67, 120);

    store.loadPatch(store.listPatches()[0]);
    expect(store.getValue(67)).toBe(12);

    store.deletePatch("dark pad");
    expect(store.listPatches()).toHaveLength(0);
  });

  it("transmits the whole patch when loading", () => {
    store.savePatch("init copy");
    transport.sent = [];
    store.loadPatch(store.listPatches()[0]);
    expect(transport.sent).toHaveLength(ALL_PARAMS.length);
  });

  it("round-trips through export/import", () => {
    store.setValue(67, 33);
    store.savePatch("exported");
    const json = store.exportPatches();

    localStorage.clear();
    expect(store.listPatches()).toHaveLength(0);

    expect(store.importPatches(json)).toBe(1);
    expect(store.listPatches()[0].name).toBe("exported");
    expect(store.listPatches()[0].values[67]).toBe(33);
  });

  it("rejects malformed imports without corrupting the library", () => {
    store.savePatch("keep me");
    expect(() => store.importPatches("not json")).toThrow();
    expect(store.importPatches(JSON.stringify([{ bogus: true }]))).toBe(0);
    expect(store.listPatches().map((p) => p.name)).toEqual(["keep me"]);
  });
});
