import { describe, expect, it } from "vitest";
import { SECTIONS } from "../../domain";
import { BRAND_FRAME, FRAMES, MOOG_FRAME, PROGRAMMER_FRAME, STAGE } from "./geometry";
import { sectionByTitle, SLIDER_SECTIONS } from "./rows";

const specials = [
  { title: "@brand", ...BRAND_FRAME },
  { title: "@programmer", ...PROGRAMMER_FRAME },
  { title: "@moog", ...MOOG_FRAME }
];

describe("faceplate geometry", () => {
  it("places every domain section exactly once", () => {
    const titles = FRAMES.map((f) => f.title);
    expect(titles.sort()).toEqual(SECTIONS.map((s) => s.title).sort());
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("only references real section titles", () => {
    for (const f of FRAMES) expect(sectionByTitle(f.title), f.title).toBeDefined();
    for (const title of Object.keys(SLIDER_SECTIONS)) {
      expect(sectionByTitle(title), title).toBeDefined();
    }
  });

  it("keeps every frame inside the stage bounds", () => {
    for (const f of [...FRAMES, ...specials]) {
      expect(f.x, f.title).toBeGreaterThanOrEqual(0);
      expect(f.y, f.title).toBeGreaterThanOrEqual(0);
      expect(f.x + f.w, f.title).toBeLessThanOrEqual(STAGE.w);
      expect(f.y + f.h, f.title).toBeLessThanOrEqual(STAGE.h);
    }
  });

  it("has no overlapping frames", () => {
    const all = [...FRAMES, ...specials];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i];
        const b = all[j];
        const overlap =
          a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        expect(overlap, `${a.title} overlaps ${b.title}`).toBe(false);
      }
    }
  });
});
