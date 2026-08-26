import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../../state";
import { isBlackKey, KEY_TO_SEMITONE, NUM_KEYS } from "./layout";

export function Keyboard() {
  const store = useStore();
  const [baseOctave, setBaseOctave] = useState(4); // C4-based
  const [velocity, setVelocity] = useState(100);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const velocityRef = useRef(velocity);
  velocityRef.current = velocity;
  const heldRef = useRef(held);
  heldRef.current = held;
  const baseNote = baseOctave * 12; // C of the base octave

  const noteOn = useCallback(
    (note: number) => {
      if (note < 0 || note > 127 || heldRef.current.has(note)) return;
      store.noteOn(note, velocityRef.current);
      setHeld((prev) => new Set(prev).add(note));
    },
    [store]
  );

  const noteOff = useCallback(
    (note: number) => {
      if (!heldRef.current.has(note)) return;
      store.noteOff(note);
      setHeld((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    },
    [store]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA")
        return;
      const key = e.key.toLowerCase();
      if (key === "z") setBaseOctave((o) => Math.max(0, o - 1));
      else if (key === "x") setBaseOctave((o) => Math.min(8, o + 1));
      else if (key in KEY_TO_SEMITONE) noteOn(baseNote + KEY_TO_SEMITONE[key]);
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in KEY_TO_SEMITONE) noteOff(baseNote + KEY_TO_SEMITONE[key]);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [baseNote, noteOn, noteOff]);

  const keys = Array.from({ length: NUM_KEYS }, (_, i) => baseNote + i);

  return (
    <div className="keyboard-wrap">
      <div className="keyboard-info">
        <button type="button" onClick={() => setBaseOctave((o) => Math.max(0, o - 1))}>
          Oct −
        </button>
        <span>C{baseOctave - 1}</span>
        <button type="button" onClick={() => setBaseOctave((o) => Math.min(8, o + 1))}>
          Oct +
        </button>
        <label className="velocity-label">
          Vel {velocity}
          <input
            type="range"
            min={1}
            max={127}
            value={velocity}
            onChange={(e) => setVelocity(Number(e.target.value))}
          />
        </label>
        <span className="keyboard-hint">Play with A–L keys · Z/X shifts octave</span>
      </div>
      <div className="keyboard">
        {keys.map((note) => (
          <button
            key={note}
            type="button"
            className={[
              isBlackKey(note) ? "key black" : "key white",
              held.has(note) ? "held" : ""
            ].join(" ")}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture(e.pointerId);
              noteOn(note);
            }}
            onPointerUp={() => noteOff(note)}
            onPointerCancel={() => noteOff(note)}
            aria-label={`Note ${note}`}
          />
        ))}
      </div>
    </div>
  );
}
