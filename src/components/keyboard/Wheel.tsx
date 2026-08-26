import { useCallback, useRef, useState } from "react";
import { useStore } from "../../state";

interface WheelProps {
  mode: "pitch" | "mod";
}

/**
 * Performance wheel. Pitch springs back to center on release; mod holds its
 * position and transmits CC 1 through the normal parameter path.
 */
export function Wheel({ mode }: WheelProps) {
  const store = useStore();
  // 0..1 vertical position (1 = pushed away from the player)
  const [pos, setPos] = useState(mode === "pitch" ? 0.5 : 0);
  const drag = useRef<{ startY: number; startPos: number } | null>(null);

  const apply = useCallback(
    (p: number) => {
      const clamped = Math.max(0, Math.min(1, p));
      setPos(clamped);
      if (mode === "pitch") store.pitchBend(clamped * 2 - 1);
      else store.setValue(1, Math.round(clamped * 127));
    },
    [mode, store]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      drag.current = { startY: e.clientY, startPos: pos };
    },
    [pos]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return;
      const dy = drag.current.startY - e.clientY;
      apply(drag.current.startPos + dy / 90);
    },
    [apply]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      drag.current = null;
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      if (mode === "pitch") apply(0.5); // spring back
    },
    [mode, apply]
  );

  const modPos = mode === "mod" ? store.getValue(1) / 127 : pos;
  const shown = mode === "mod" ? modPos : pos;

  return (
    <div className="wheel-unit">
      <div
        className="wheel"
        role="slider"
        aria-label={mode === "pitch" ? "Pitch bend" : "Mod wheel"}
        aria-valuemin={0}
        aria-valuemax={127}
        aria-valuenow={Math.round(shown * 127)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="wheel-groove" style={{ bottom: `${8 + shown * 74}%` }} />
      </div>
      <span className="wheel-label">{mode === "pitch" ? "Pitch" : "Mod"}</span>
    </div>
  );
}
