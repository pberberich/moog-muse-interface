import { useSyncExternalStore } from "react";
import { Param } from "../../domain";

export interface SwitchProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
  /** Colored cap, matching the hardware's accent buttons. */
  accent?: "yellow" | "orange" | "cyan";
}

/**
 * The button caps are 3D-rendered sprites (scripts/btn_render.py); if the
 * art is missing the CSS-gradient caps remain as the fallback. One probe
 * decides for the whole sprite set.
 */
const SPRITE_URL = (color: string) => `btn-${color}.png`;

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
  probe.src = SPRITE_URL("gray");
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

/**
 * Hardware-style panel button: a small gray (or colored) cap with a separate
 * red LED indicator above it, label printed below.
 */
export function Toggle({ param, value, onChange, accent }: SwitchProps) {
  const on = value >= 64;
  const sprites = useButtonSprites();
  const classes = ["push-btn"];
  if (accent) classes.push(`accent-${accent}`);
  if (sprites === "ok") classes.push("sprite");
  return (
    <div className="control toggle" title={param.description ?? param.name}>
      <span className={on ? "led-dot on" : "led-dot"} />
      <button
        type="button"
        className={classes.join(" ")}
        style={
          sprites === "ok"
            ? {
                backgroundImage: `url(${SPRITE_URL(accent ?? "gray")})`,
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
