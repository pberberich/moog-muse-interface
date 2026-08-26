import { useEffect, useRef, useState } from "react";
import { PanelSection } from "./PanelSection";
import { COLUMNS, STAGE_W } from "./geometry";
import { sectionByTitle } from "./rows";

function BrandPlate() {
  return (
    <div className="brand-plate">
      <span className="brand-plate-name">MUSE</span>
      <span className="brand-plate-tag">
        8-Voice Polyphonic
        <br />
        Analog Control Panel
      </span>
    </div>
  );
}

/**
 * Fixed-coordinate faceplate: columns sit at absolute traced x-positions on
 * a fixed-width canvas and the whole plate scales uniformly to the viewport,
 * so the geometry never reflows — like real panel art.
 */
export function Stage() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [stageH, setStageH] = useState(700);

  useEffect(() => {
    const el = wrap.current!;
    // Column heights come from the tallest column's natural content; the
    // other columns stretch their last frame so all bottoms align.
    const measure = () => {
      setScale(el.clientWidth / STAGE_W);
      let max = 0;
      stage.current!.querySelectorAll<HTMLElement>(".stage-col").forEach((col) => {
        let sum = (col.children.length - 1) * 10;
        for (const child of Array.from(col.children)) {
          sum += (child as HTMLElement).offsetHeight;
        }
        max = Math.max(max, sum);
      });
      if (max > 0) setStageH((prev) => Math.max(prev === 700 ? 0 : prev, max + 28));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stage-wrap" ref={wrap} style={{ height: stageH * scale }}>
      <div
        className="stage"
        ref={stage}
        style={{ width: STAGE_W, height: stageH, transform: `scale(${scale})` }}
      >
        {COLUMNS.map((col) => (
          <div
            key={col.x}
            className="stage-col"
            style={{ left: col.x, width: col.w, height: stageH - 28 }}
          >
            {col.titles.map((title) => {
              if (title === "@brand") return <BrandPlate key={title} />;
              const section = sectionByTitle(title);
              return section ? <PanelSection key={title} section={section} /> : null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
