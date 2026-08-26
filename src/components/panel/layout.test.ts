import { describe, expect, it } from "vitest";
import { SECTIONS } from "../../domain";
import { PANEL_COLUMNS, sectionByTitle, SLIDER_SECTIONS } from "./rows";

function placedTitles(): string[] {
  return PANEL_COLUMNS.flatMap((col) =>
    col.groups.flatMap((g) => (Array.isArray(g) ? g : g === "@brand" ? [] : [g]))
  );
}

describe("panel layout", () => {
  it("places every domain section exactly once", () => {
    const titles = placedTitles();
    expect(titles.sort()).toEqual(SECTIONS.map((s) => s.title).sort());
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("only references real section titles", () => {
    for (const title of placedTitles()) {
      expect(sectionByTitle(title), title).toBeDefined();
    }
    for (const title of Object.keys(SLIDER_SECTIONS)) {
      expect(sectionByTitle(title), title).toBeDefined();
    }
  });
});
