import { useEffect, useMemo, useRef } from "react";
import {
  coreFrequency,
  magnitudeSpectrum,
  renderPair,
  syncPairFromPanel,
  windowRate
} from "../../analog";
import { useStore } from "../../state";

/** Master cycles held in the waveform pane, so the trace never runs away. */
const CYCLES = 3;
const WAVE_SAMPLES = 1200;

/** 11 Hz per bin: fine enough to resolve the comb sync builds. */
const ANALYSIS_RATE = 45056;
const FFT_SIZE = 4096;
/** Bins drawn, i.e. up to about 5.6 kHz — where the sync formant lives. */
const BINS_SHOWN = 512;
const FLOOR_DB = -72;

const OVERSAMPLE = 8;

const INK = "#9d998c";
const AMBER = "#ffb02e";
const LED = "#ff5c1f";
const GRID = "rgba(255, 255, 255, 0.055)";

/** Size the backing store to the device pixel ratio and return CSS dimensions. */
function prepare(canvas: HTMLCanvasElement): [CanvasRenderingContext2D, number, number] | null {
  const ctx = canvas.getContext("2d");
  const { clientWidth: w, clientHeight: h } = canvas;
  if (!ctx || !w || !h) return null;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return [ctx, w, h];
}

function plot(ctx: CanvasRenderingContext2D, data: Float32Array, w: number, h: number): void {
  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = (i / (data.length - 1)) * w;
    const y = h - data[i] * (h - 2) - 1;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/**
 * Outboard scope for the oscillator pair, driven by the circuit model in
 * `src/analog` rather than by a drawing of what sync is supposed to look like.
 * The panel's own CCs are the input, so flipping Sync 2→1 or moving either
 * Frequency knob redraws both panes.
 */
export function SyncScope() {
  const store = useStore();
  const waveRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<HTMLCanvasElement>(null);

  const { masterCv, slaveCv, syncEnabled } = syncPairFromPanel((cc) => store.getValue(cc));

  const trace = useMemo(
    () =>
      renderPair(
        { masterCv, slaveCv, syncEnabled },
        WAVE_SAMPLES,
        windowRate(masterCv, CYCLES, WAVE_SAMPLES),
        OVERSAMPLE
      ),
    [masterCv, slaveCv, syncEnabled]
  );

  const spectrum = useMemo(
    () =>
      magnitudeSpectrum(
        renderPair({ masterCv, slaveCv, syncEnabled }, FFT_SIZE, ANALYSIS_RATE, OVERSAMPLE).slave,
        FLOOR_DB
      ),
    [masterCv, slaveCv, syncEnabled]
  );

  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas) return;
    const prepared = prepare(canvas);
    if (!prepared) return;
    const [ctx, w, h] = prepared;

    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = Math.round((h * i) / 4) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = INK;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1;
    plot(ctx, trace.master, w, h);

    ctx.globalAlpha = 1;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.75;
    plot(ctx, trace.slave, w, h);

    // Last, so the pulse stays visible over the slave's own falling edge.
    ctx.strokeStyle = LED;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    for (const reset of trace.syncResets) {
      const x = Math.round((reset / (WAVE_SAMPLES - 1)) * w) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [trace]);

  useEffect(() => {
    const canvas = spectrumRef.current;
    if (!canvas) return;
    const prepared = prepare(canvas);
    if (!prepared) return;
    const [ctx, w, h] = prepared;

    const width = w / BINS_SHOWN;
    for (let i = 0; i < BINS_SHOWN; i++) {
      const level = (spectrum[i] - FLOOR_DB) / -FLOOR_DB;
      if (level <= 0) continue;
      ctx.fillStyle = i === 0 ? GRID : AMBER;
      ctx.globalAlpha = 0.35 + level * 0.65;
      ctx.fillRect(i * width, h - level * h, Math.max(width - 0.5, 0.6), level * h);
    }
    ctx.globalAlpha = 1;
  }, [spectrum]);

  const masterHz = coreFrequency(masterCv);
  const slaveHz = coreFrequency(slaveCv);

  return (
    <section className="scope" aria-label="Oscillator sync scope">
      <header className="scope-head">
        <h2>Sync Scope</h2>
        <p>
          OSC 2 <b>{masterHz.toFixed(1)} Hz</b> · OSC 1 <b>{slaveHz.toFixed(1)} Hz</b>
          <span className={syncEnabled ? "scope-lamp on" : "scope-lamp"}>
            {syncEnabled ? "Sync 2→1 engaged" : "Sync 2→1 off"}
          </span>
        </p>
      </header>

      <div className="scope-pane">
        <canvas ref={waveRef} />
        <span className="scope-caption">
          Capacitor ramps · {CYCLES} master cycles
          {syncEnabled && <em> · red marks the reset pulse</em>}
        </span>
      </div>

      <div className="scope-pane">
        <canvas ref={spectrumRef} />
        <span className="scope-caption">
          Harmonics of OSC 1 · 0–{Math.round((BINS_SHOWN * ANALYSIS_RATE) / FFT_SIZE / 100) / 10} kHz
        </span>
      </div>

      <p className="scope-note">
        Both panes come from a circuit model of the ramp-and-reset core —
        exponential converter, timing capacitor, comparator, discharge switch —
        integrated with resets placed at their true sub-sample times. It drives
        a picture, not the speakers: every reset is a step discontinuity, so an
        audio path would need band-limited correction on top of this.
      </p>
    </section>
  );
}
