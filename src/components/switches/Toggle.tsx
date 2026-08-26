import { useSyncExternalStore } from "react";
import { Param } from "../../domain";

export interface SwitchProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
  /** Light-up cap color; undefined renders the red lozenge LED-button. */
  accent?: "yellow" | "orange" | "cyan" | "white";
}

/**
 * The hardware has two button families, both of which ARE their own
 * indicator (no separate LED):
 *  - small red lozenge buttons that light red when engaged (KB Reset,
 *    Unipolar, Loop, Velocity, Link, Mute, High Pass…)
 *  - larger light-up caps in white/yellow/cyan (Hold, Arp On, Timbres)
 * Caps are 3D-rendered sprites (scripts/btn_render.py); CSS gradients
 * remain as the fallback when the art is missing.
 */
const SPRITE_URL = (name: string) => `btn-${name}.png`;

type AssetStatus = "loading" | "ok" | "fail";
const listeners = new Set<() => void>();
let spriteStatus: AssetStatus = "loading";
if (typeof Image !== "undefined") {
  const probe = new Image();
  probe.onload = () => {
    spriteStatus = "ok";
    listeners.forEach((l) => l());
  };
  probe.onerror = () => {
    spriteStatus = "fail";
    listeners.forEach((l) => l());
  };
  probe.src = SPRITE_URL("red");
} else {
  spriteStatus = "fail";
}

function useButtonSprites(): AssetStatus {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => spriteStatus
  );
}

export function Toggle({ param, value, onChange, accent }: SwitchProps) {
  const on = value >= 64;
  const sprites = useButtonSprites();
  const classes = ["push-btn", accent ? `accent-${accent}` : "lozenge"];
  if (sprites === "ok") classes.push("sprite");
  // accent caps are white plastic that lights its color from behind: the
  // unlit sprite is the white cap, the lit one the colored render
  const spriteName = accent ? (on ? accent : "white") : "red";
  return (
    <div className="control toggle" title={param.description ?? param.name}>
      <button
        type="button"
        className={classes.join(" ")}
        style={
          sprites === "ok"
            ? {
                backgroundImage: `url(${SPRITE_URL(spriteName)})`,
                backgroundSize: "100% 100%"
              }
            : undefined
        }
        aria-pressed={on}
        onClick={() => onChange(on ? 0 : 127)}
      />
      <span className="control-label">{param.name}</span>
    </div>
  );
}
