import { useCallback, useRef } from "react";
import { SliderProps } from "./VSlider";

/**
 * Compact horizontal fader row (track with the label printed at its side),
 * used for the MIX block and the envelope sections like the hardware.
 */
export function HSlider({ param, value, onChange }: SliderProps) {
  const track = useRef<HTMLDivElement>(null);

  const valueFromPointer = useCallback(
    (e: React.PointerEvent) => {
      const rect = track.current!.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      onChange(ratio * 127);
    },
    [onChange]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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

  return (
    <div className="control hslider" title={param.description ?? param.name}>
      <div
        ref={track}
        className="hslider-track"
        role="slider"
        tabIndex={0}
        aria-label={param.name}
        aria-valuemin={0}
        aria-valuemax={127}
        aria-valuenow={value}
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          valueFromPointer(e);
        }}
        onPointerMove={(e) => e.buttons > 0 && valueFromPointer(e)}
        onKeyDown={onKeyDown}
        onWheel={(e) => onChange(value + (e.deltaY < 0 ? 3 : -3))}
        onDoubleClick={() => onChange(param.defaultValue)}
      >
        <span className="hslider-slot" />
        <span
          className="hslider-thumb"
          style={{ left: `calc((100% - 14px) * ${value / 127})` }}
        />
      </div>
      <span className="hslider-name">{param.name}</span>
    </div>
  );
}
