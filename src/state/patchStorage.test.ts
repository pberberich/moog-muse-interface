import { beforeEach, describe, expect, it } from "vitest";
import {
  loadChannel,
  loadPatches,
  parsePatchJson,
  storeChannel,
  storePatches
} from "./patchStorage";

beforeEach(() => {
  localStorage.clear();
});

describe("patch storage", () => {
  it("round-trips patches through localStorage", () => {
    const patch = { name: "p1", savedAt: "2026-01-01T00:00:00Z", values: { 67: 100 } };
    storePatches([patch]);
    expect(loadPatches()).toEqual([patch]);
  });

  it("returns an empty list for missing or corrupt data", () => {
    expect(loadPatches()).toEqual([]);
    localStorage.setItem("muse-patches-v1", "{broken");
    expect(loadPatches()).toEqual([]);
  });
});

describe("channel storage", () => {
  it("round-trips a valid channel", () => {
    storeChannel(7);
    expect(loadChannel()).toBe(7);
  });

  it("rejects out-of-range or missing values", () => {
    expect(loadChannel()).toBeNull();
    localStorage.setItem("muse-midi-channel", "99");
    expect(loadChannel()).toBeNull();
  });
});

describe("parsePatchJson", () => {
  it("accepts a single patch or an array", () => {
    const patch = { name: "solo", savedAt: "", values: {} };
    expect(parsePatchJson(JSON.stringify(patch))).toHaveLength(1);
    expect(parsePatchJson(JSON.stringify([patch, patch]))).toHaveLength(2);
  });

  it("filters entries without a name or values", () => {
    const json = JSON.stringify([{ name: "ok", values: {} }, { name: 5 }, { values: {} }, null]);
    expect(parsePatchJson(json)).toHaveLength(1);
  });
});
