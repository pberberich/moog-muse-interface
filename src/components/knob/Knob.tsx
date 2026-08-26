import { useCallback, useRef } from "react";
import { formatValue, Param } from "../../domain";

export interface KnobProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
}

const SWEEP = 270; // degrees of rotation from min to max
const START = -135;

export function Knob({ param, value, onChange }: KnobProps) {
  const dragState = useRef<{ startY: number; startValue: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
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
    (e.target as Element).releasePointerCapture(e.pointerId);
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
  const rad = ((angle - 90) * Math.PI) / 180;
  const cx = 24;
  const cy = 24;
  const r = 15;
  const px = cx + Math.cos(rad) * r * 0.72;
  const py = cy + Math.sin(rad) * r * 0.72;

  return (
    <div className="control knob" title={param.description ?? param.name}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
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
        <circle cx={cx} cy={cy} r={19} className="knob-ring" />
        <circle cx={cx} cy={cy} r={r} className="knob-body" />
        {param.bipolar && <line x1={cx} y1={2.5} x2={cx} y2={6.5} className="knob-detent" />}
        <line x1={cx} y1={cy} x2={px} y2={py} className="knob-pointer" />
      </svg>
      <span className="control-label">{param.name}</span>
      <span className="control-value">{formatValue(param, value)}</span>
    </div>
  );
}
