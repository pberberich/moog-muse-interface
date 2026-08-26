import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../state/store";

/** Computer-keyboard note layout (classic tracker/DAW mapping). */
const KEY_TO_SEMITONE: Record<string, number> = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11,
  k: 12, o: 13, l: 14, p: 15, ";": 16
};

const NUM_KEYS = 25; // two octaves on screen

export function Keyboard() {
  const store = useStore();
  const [baseOctave, setBaseOctave] = useState(4); // C4-based
  const [held, setHeld] = useState<Set<number>>(new Set());
  const heldRef = useRef(held);
  heldRef.current = held;
  const baseNote = baseOctave * 12; // C of the base octave (C4 = 48 here)

  const noteOn = useCallback(
    (note: number) => {
      if (note < 0 || note > 127 || heldRef.current.has(note)) return;
      store.noteOn(note);
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

  const isBlack = (semitone: number) => [1, 3, 6, 8, 10].includes(semitone % 12);
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
        <span className="keyboard-hint">Play with A–L keys · Z/X shifts octave</span>
      </div>
      <div className="keyboard">
        {keys.map((note) => (
          <button
            key={note}
            type="button"
            className={[
              isBlack(note) ? "key black" : "key white",
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
