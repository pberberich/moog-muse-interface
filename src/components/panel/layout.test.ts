import { describe, expect, it } from "vitest";
import { SECTIONS } from "../../domain";
import { COLUMNS, STAGE_W } from "./geometry";
import { sectionByTitle, SLIDER_SECTIONS } from "./rows";

const placedTitles = () => COLUMNS.flatMap((c) => c.titles.filter((t) => t !== "@brand"));

describe("faceplate geometry", () => {
  it("places every domain section exactly once", () => {
    const titles = placedTitles();
    expect(titles.sort()).toEqual(SECTIONS.map((s) => s.title).sort());
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("only references real section titles", () => {
    for (const title of placedTitles()) expect(sectionByTitle(title), title).toBeDefined();
    for (const title of Object.keys(SLIDER_SECTIONS)) {
      expect(sectionByTitle(title), title).toBeDefined();
    }
  });

  it("keeps columns inside the stage and non-overlapping", () => {
    const sorted = [...COLUMNS].sort((a, b) => a.x - b.x);
    let prevRight = 0;
    for (const col of sorted) {
      expect(col.x).toBeGreaterThanOrEqual(prevRight);
      prevRight = col.x + col.w;
    }
    expect(prevRight).toBeLessThanOrEqual(STAGE_W);
  });
});
