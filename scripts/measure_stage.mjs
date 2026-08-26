/**
 * Dumps the rendered faceplate's element geometry (in unscaled stage units)
 * to scripts/stage-map.json. scripts/plate_render.py consumes this to bake
 * the 3D panel plate, so it always matches the live DOM layout exactly.
 *
 * Run against a preview server:  node scripts/measure_stage.mjs [url] [out]
 */

import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const URL = process.argv[2] ?? "http://localhost:4173/";
const OUT = process.argv[3] ?? "scripts/stage-map.json";

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium"
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const map = await page.evaluate(() => {
  const stage = document.querySelector(".stage");
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / stage.offsetWidth;

  const rel = (r) => ({
    x: (r.left - stageRect.left) / scale,
    y: (r.top - stageRect.top) / scale,
    w: r.width / scale,
    h: r.height / scale
  });

  const style = (el) => getComputedStyle(el);

  const texts = [];
  const collect = (selector, kind) => {
    document.querySelectorAll(selector).forEach((el) => {
      const r = rel(el.getBoundingClientRect());
      if (r.w === 0 || r.h === 0) return;
      const s = style(el);
      texts.push({
        kind,
        text: (el.innerText ?? el.textContent).trim(),
        ...r,
        fontSize: parseFloat(s.fontSize) / scale,
        letterSpacing: (parseFloat(s.letterSpacing) || 0) / scale,
        align: "center"
      });
    });
  };

  collect(".panel-section > h2", "title");
  collect(".section-sub", "label");
  collect(".control-label", "label");
  collect(".enum-text", "enum");
  collect(".hslider-name", "sliderName");
  collect(".brand-plate-name", "brandName");
  collect(".brand-plate-tag", "brandTag");
  collect(".moog-badge", "badge");
  collect(".preset-heading", "label");

  const frames = [];
  document.querySelectorAll(".panel-section, .brand-plate").forEach((el) => {
    frames.push(rel(el.getBoundingClientRect()));
  });
  const badge = document.querySelector(".moog-badge");
  const badgeFrame = badge ? rel(badge.getBoundingClientRect()) : null;

  const knobs = [];
  document.querySelectorAll(".knob-stage").forEach((el) => {
    const r = rel(el.getBoundingClientRect());
    knobs.push({
      cx: r.x + r.w / 2,
      cy: r.y + r.h / 2,
      size: r.w,
      bipolar: !!el.querySelector(".knob-tick.center")
    });
  });

  return {
    stage: { w: stage.offsetWidth, h: stage.offsetHeight },
    frames,
    badgeFrame,
    texts,
    knobs
  };
});

writeFileSync(OUT, JSON.stringify(map, null, 1));
console.log(
  `stage ${map.stage.w}x${map.stage.h}: ${map.frames.length} frames, ` +
    `${map.texts.length} texts, ${map.knobs.length} knobs -> ${OUT}`
);
await browser.close();
