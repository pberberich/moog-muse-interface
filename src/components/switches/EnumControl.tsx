import { useSyncExternalStore } from "react";
import { optionForValue, optionSendValue } from "../../domain";
import { SwitchProps } from "./Toggle";

/**
 * Hardware-style option selector: a horizontal LED row above the option
 * legends, with a wide gray rocker button below that steps through the
 * options — exactly how the instrument's WAVEFORM / KB TRACKING / ORDER /
 * DIRECTION selectors work. LEDs and legends are also directly clickable.
 */
const ROCKER_URL = "btn-rocker.png";

type AssetStatus = "loading" | "ok" | "fail";
const listeners = new Set<() => void>();
let rockerStatus: AssetStatus = "loading";
if (typeof Image !== "undefined") {
  const probe = new Image();
  probe.onload = () => {
    rockerStatus = "ok";
    listeners.forEach((l) => l());
  };
  probe.onerror = () => {
    rockerStatus = "fail";
    listeners.forEach((l) => l());
  };
  probe.src = ROCKER_URL;
} else {
  rockerStatus = "fail";
}

function useRockerSprite(): AssetStatus {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => rockerStatus
  );
}

export function EnumControl({ param, value, onChange }: SwitchProps) {
  const active = optionForValue(param, value);
  const sprite = useRockerSprite();
  const options = param.options!;
  const cycle = () => {
    const i = options.indexOf(active!);
    onChange(optionSendValue(options[(i + 1) % options.length]));
  };
  return (
    <div className="control enum" title={param.description ?? param.name}>
      <div className="enum-options" role="radiogroup" aria-label={param.name}>
        {options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={opt === active}
            className={opt === active ? "enum-btn active" : "enum-btn"}
            onClick={() => onChange(optionSendValue(opt))}
          >
            <span className="enum-led" />
            <span className="enum-text">{opt.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={sprite === "ok" ? "rocker sprite" : "rocker"}
        aria-label={`${param.name}: next option`}
        style={
          sprite === "ok"
            ? { backgroundImage: `url(${ROCKER_URL})`, backgroundSize: "100% 100%" }
            : undefined
        }
        onClick={cycle}
      >
        <span className="rocker-chevron" aria-hidden="true">
          ‹
        </span>
      </button>
      <span className="control-label">{param.name}</span>
    </div>
  );
}
