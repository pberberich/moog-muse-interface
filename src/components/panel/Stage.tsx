import { useEffect, useRef, useState } from "react";
import { PatchLibrary } from "../patch-library";
import { PanelSection } from "./PanelSection";
import { BRAND_FRAME, FRAMES, MOOG_FRAME, PROGRAMMER_FRAME, STAGE } from "./geometry";
import { sectionByTitle } from "./rows";

/**
 * 1:1 photo mode: when public/panel-photo.png exists (a straight-on,
 * high-resolution photograph of the faceplate), it renders underneath the
 * controls and the drawn framing fades out. Append ?calibrate to the URL to
 * see both layers half-transparent with frame outlines while aligning
 * geometry.ts to the photograph.
 */
const PANEL_PHOTO = "panel-photo.png";

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
        <img
          className="stage-photo"
          src={PANEL_PHOTO}
          alt=""
          aria-hidden="true"
          onLoad={() => setHasPhoto(true)}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
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
