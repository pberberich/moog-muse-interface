import { useCallback, useRef } from "react";
import { formatValue, Param } from "../../domain";

export interface KnobProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
  /** Rendered diameter in px; geometry scales via the fixed viewBox. */
  size?: number;
}

const SWEEP = 270; // degrees of rotation from min to max
const START = -135;
const SIZE = 64;
const C = SIZE / 2;
const TICK_COUNT = 11;

function polar(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [C + Math.cos(rad) * radius, C + Math.sin(rad) * radius];
}

/** Moog-style skirted knob: tick ring, black skirt, domed cap, white pointer. */
export function Knob({ param, value, onChange, size = SIZE }: KnobProps) {
  const dragState = useRef<{ startY: number; startValue: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dragState.current = { startY: e.clientY, startValue: value };
    },
    [value]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragState.current) return;
      const dy = dragState.current.startY - e.clientY;
      const scale = e.shiftKey ? 0.25 : 0.85;
      onChange(dragState.current.startValue + dy * scale);
    },
    [onChange]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    dragState.current = null;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      onChange(value + (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 1 : 3));
    },
    [value, onChange]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGSVGElement>) => {
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

  const angle = START + (value / 127) * SWEEP;
  const [px, py] = polar(angle, 22);
  const [ix, iy] = polar(angle, 7);

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
    <div className="control knob" title={param.description ?? param.name}>
      <span className="control-label">{param.name}</span>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
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
        <defs>
          <radialGradient id="knob-skirt-g" cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#3d3d40" />
            <stop offset="55%" stopColor="#1a1a1c" />
            <stop offset="100%" stopColor="#050506" />
          </radialGradient>
          <radialGradient id="knob-cap-g" cx="40%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#333336" />
            <stop offset="65%" stopColor="#131315" />
            <stop offset="100%" stopColor="#0a0a0b" />
          </radialGradient>
        </defs>
        {ticks}
        <circle cx={C} cy={C} r={24.5} fill="#000" opacity="0.55" />
        <circle cx={C} cy={C} r={24} fill="url(#knob-skirt-g)" stroke="#000" strokeWidth="1" />
        <circle
          cx={C}
          cy={C}
          r={15.5}
          fill="url(#knob-cap-g)"
          stroke="#000"
          strokeWidth="1"
        />
        <circle cx={C} cy={C - 13.2} r={4.5} fill="#ffffff" opacity="0.04" />
        <line x1={ix} y1={iy} x2={px} y2={py} className="knob-pointer" />
      </svg>
      <span className="control-value">{formatValue(param, value)}</span>
    </div>
  );
}
