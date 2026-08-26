import { useCallback, useRef } from "react";
import { formatValue, Param } from "../../domain";

export interface KnobProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
  /** Rendered diameter in px; the filmstrip frame scales to fit. */
  size?: number;
  className?: string;
}

const SWEEP = 270; // degrees of rotation from min to max
const START = -135;
const VB = 64; // tick-ring viewBox
const C = VB / 2;
const TICK_COUNT = 11;

/**
 * Pre-rendered rotation filmstrip (Blender, PBR materials, studio lighting)
 * — the same technique commercial plugin GUIs use. One frame per rotation
 * step; scripts/knob_render.py regenerates the strip.
 */
const STRIP_FRAMES = 64;
const STRIP_URL = "knob-strip.png";

function polar(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [C + Math.cos(rad) * radius, C + Math.sin(rad) * radius];
}

export function Knob({ param, value, onChange, size = VB, className }: KnobProps) {
  const dragState = useRef<{ startY: number; startValue: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dragState.current = { startY: e.clientY, startValue: value };
    },
    [value]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      const dy = dragState.current.startY - e.clientY;
      const scale = e.shiftKey ? 0.25 : 0.85;
      onChange(dragState.current.startValue + dy * scale);
    },
    [onChange]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = null;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      onChange(value + (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 1 : 3));
    },
    [value, onChange]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 1 : 4;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") onChange(value + step);
      else if (e.key === "ArrowDown" || e.key === "ArrowLeft") onChange(value - step);
      else if (e.key === "Home") onChange(0);
      else if (e.key === "End") onChange(127);
      else return;
      e.preventDefault();
    },
    [value, onChange]
  );

  const frame = Math.round((value / 127) * (STRIP_FRAMES - 1));

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const a = START + (i / (TICK_COUNT - 1)) * SWEEP;
    const major = i === 0 || i === TICK_COUNT - 1 || i === (TICK_COUNT - 1) / 2;
    const [x1, y1] = polar(a, major ? 26.5 : 27.5);
    const [x2, y2] = polar(a, 30.5);
    const center = param.bipolar && i === (TICK_COUNT - 1) / 2;
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={center ? "knob-tick center" : major ? "knob-tick major" : "knob-tick"}
      />
    );
  });

  return (
    <div
      className={className ? `control knob ${className}` : "control knob"}
      title={param.description ?? param.name}
    >
      <span className="control-label">{param.name}</span>
      <div
        className="knob-stage"
        style={{ width: size, height: size }}
        tabIndex={0}
        role="slider"
        aria-label={param.name}
        aria-valuemin={0}
        aria-valuemax={127}
        aria-valuenow={value}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        onDoubleClick={() => onChange(param.defaultValue)}
      >
        <svg className="knob-ticks" viewBox={`0 0 ${VB} ${VB}`} aria-hidden="true">
          {/* vector fallback body, hidden beneath the filmstrip once loaded */}
          <circle cx={C} cy={C} r={21} fill="#101012" stroke="#000" />
          {ticks}
        </svg>
        <div
          className="knob-photo"
          style={{
            backgroundImage: `url(${STRIP_URL})`,
            backgroundSize: `100% ${STRIP_FRAMES * 100}%`,
            backgroundPositionY: `${(frame / (STRIP_FRAMES - 1)) * 100}%`
          }}
        />
      </div>
      <span className="control-value">{formatValue(param, value)}</span>
    </div>
  );
}
