import { useCallback, useRef } from "react";
import { formatValue, Param } from "../../domain";

export interface SliderProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
}

function useSliderKeys(value: number, onChange: (v: number) => void) {
  return useCallback(
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
}

/** Vertical fader, used for the envelope banks like the hardware. */
export function VSlider({ param, value, onChange }: SliderProps) {
  const track = useRef<HTMLDivElement>(null);
  const onKeyDown = useSliderKeys(value, onChange);

  const valueFromPointer = useCallback(
    (e: React.PointerEvent) => {
      const rect = track.current!.getBoundingClientRect();
      const ratio = 1 - (e.clientY - rect.top) / rect.height;
      onChange(ratio * 127);
    },
    [onChange]
  );

  return (
    <div className="control vslider" title={param.description ?? param.name}>
      <div
        ref={track}
        className="vslider-track"
        role="slider"
        tabIndex={0}
        aria-label={param.name}
        aria-orientation="vertical"
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
        <span className="vslider-slot" />
        <span
          className="vslider-thumb"
          style={{ bottom: `calc((100% - 16px) * ${value / 127})` }}
        />
      </div>
      <span className="control-label">{param.name}</span>
      <span className="control-value">{formatValue(param, value)}</span>
    </div>
  );
}
