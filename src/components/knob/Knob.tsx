import { useCallback, useRef } from "react";
import { formatValue, Param } from "../../domain";

export interface KnobProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
  /** Rendered diameter in px; geometry scales via the fixed viewBox. */
  size?: number;
  className?: string;
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
export function Knob({ param, value, onChange, size = SIZE, className }: KnobProps) {
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
    <div
      className={className ? `control knob ${className}` : "control knob"}
      title={param.description ?? param.name}
    >
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
          <radialGradient id="knob-skirt-g" cx="35%" cy="26%" r="88%">
            <stop offset="0%" stopColor="#4c4c52" />
            <stop offset="42%" stopColor="#242427" />
            <stop offset="78%" stopColor="#121214" />
            <stop offset="100%" stopColor="#050506" />
          </radialGradient>
          <radialGradient id="knob-cap-g" cx="38%" cy="28%" r="82%">
            <stop offset="0%" stopColor="#3e3e44" />
            <stop offset="55%" stopColor="#1c1c1f" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </radialGradient>
          <linearGradient id="knob-sheen-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <filter id="knob-blur-g" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.7" />
          </filter>
        </defs>
        {ticks}
        {/* ambient drop shadow */}
        <ellipse
          cx={C}
          cy={C + 2.6}
          rx={24.6}
          ry={23.4}
          fill="#000"
          opacity="0.6"
          filter="url(#knob-blur-g)"
        />
        {/* rubberized skirt with rim light */}
        <circle cx={C} cy={C} r={24} fill="url(#knob-skirt-g)" stroke="#000" strokeWidth="1" />
        <circle cx={C} cy={C} r={23.1} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
        <circle cx={C} cy={C} r={16.6} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1.4" />
        {/* domed cap with sheen and specular */}
        <circle cx={C} cy={C} r={15.6} fill="url(#knob-cap-g)" stroke="#000" strokeWidth="1" />
        <circle cx={C} cy={C} r={15.2} fill="url(#knob-sheen-g)" />
        <ellipse
          cx={C - 4.6}
          cy={C - 6.8}
          rx={6.4}
          ry={4}
          fill="#fff"
          opacity="0.09"
          filter="url(#knob-blur-g)"
        />
        {/* pointer with its own cast shadow */}
        <line
          x1={ix + 0.7}
          y1={iy + 1.1}
          x2={px + 0.7}
          y2={py + 1.1}
          stroke="#000"
          strokeWidth="2.8"
          strokeLinecap="round"
          opacity="0.5"
        />
        <line x1={ix} y1={iy} x2={px} y2={py} className="knob-pointer" />
      </svg>
      <span className="control-value">{formatValue(param, value)}</span>
    </div>
  );
}
