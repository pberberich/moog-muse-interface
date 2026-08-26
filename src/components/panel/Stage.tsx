import { useEffect, useRef, useState } from "react";
import { PatchLibrary } from "../patch-library";
import { PanelSection } from "./PanelSection";
import { BRAND_FRAME, FRAMES, MOOG_FRAME, PROGRAMMER_FRAME, STAGE } from "./geometry";
import { sectionByTitle } from "./rows";

/**
 * Plate underlay, first source that loads wins:
 *  - panel-photo.png: a straight-on photograph of the real faceplate
 *    (1:1 photo mode; ?calibrate overlays both layers for alignment)
 *  - panel-plate.png: the Blender-baked 3D plate (scripts/plate_render.py),
 *    regenerated from the DOM via scripts/measure_stage.mjs
 * The drawn framing/silkscreen fades out when an underlay is active.
 */
const PLATE_SOURCES = ["panel-photo.png", "panel-plate.png"];

const frameStyle = (f: { x: number; y: number; w: number; h: number }) => ({
  left: f.x,
  top: f.y,
  width: f.w,
  height: f.h
});

/**
 * Fixed-coordinate faceplate traced from the hardware: every frame sits at
 * absolute coordinates on a fixed canvas, and the whole plate scales
 * uniformly to the viewport — geometry never reflows, like real panel art.
 */
export function Stage() {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const calibrate =
    typeof window !== "undefined" && window.location.search.includes("calibrate");

  useEffect(() => {
    const el = wrap.current!;
    const update = () => setScale(el.clientWidth / STAGE.w);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stageClasses = [
    "stage",
    hasPhoto ? "has-photo" : "",
    hasPhoto && calibrate ? "calibrate" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="stage-wrap" ref={wrap} style={{ height: STAGE.h * scale }}>
      <div
        className={stageClasses}
        style={{ width: STAGE.w, height: STAGE.h, transform: `scale(${scale})` }}
      >
        {sourceIndex < PLATE_SOURCES.length && (
          <img
            className="stage-photo"
            src={PLATE_SOURCES[sourceIndex]}
            alt=""
            aria-hidden="true"
            onLoad={() => setHasPhoto(true)}
            onError={() => setSourceIndex((i) => i + 1)}
          />
        )}
        <div className="brand-plate" style={frameStyle(BRAND_FRAME)}>
          <span className="brand-plate-name">MUSE</span>
          <span className="brand-plate-tag">
            8-Voice Polyphonic
            <br />
            Analog Control Panel
          </span>
        </div>

        {FRAMES.map((f) => {
          const section = sectionByTitle(f.title);
          if (!section) return null;
          return (
            <div key={f.title} className="frame" style={frameStyle(f)}>
              <PanelSection section={section} />
            </div>
          );
        })}

        <div className="frame programmer-frame" style={frameStyle(PROGRAMMER_FRAME)}>
          <PatchLibrary />
        </div>

        <div className="moog-frame" style={frameStyle(MOOG_FRAME)}>
          <span className="moog-badge">moog</span>
        </div>
      </div>
    </div>
  );
}
