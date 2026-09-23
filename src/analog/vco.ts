import {
  C_TIMING,
  I_REF,
  K_OVER_Q,
  MAX_EVENTS_PER_STEP,
  R_ON,
  TEMPCO_ERROR,
  T_NOMINAL,
  T_RESET,
  V_THRESHOLD
} from "./constants";

/** Discharge time constant of the reset switch, τ = R·C. */
export const TAU_RESET = R_ON * C_TIMING;

/** Thermal voltage kT/q — the exponential converter's scale factor. */
export function thermalVoltage(temperature: number): number {
  return K_OVER_Q * temperature;
}

/**
 * Collector current out of the exponential converter.
 *
 * The input resistor divides the control voltage down to the transistor's
 * base so one volt is one doubling: I = I_ref · 2^cv. The tempco resistor is
 * trimmed at T_NOMINAL, so any departure from it leaves a residual scale
 * error — the model's drift.
 */
export function converterCurrent(cv: number, temperature = T_NOMINAL): number {
  return I_REF * Math.pow(2, cv + (temperature - T_NOMINAL) * TEMPCO_ERROR);
}

/** Free-running core frequency for a control voltage: f = I / (C · V_th). */
export function coreFrequency(cv: number, temperature = T_NOMINAL): number {
  return converterCurrent(cv, temperature) / (C_TIMING * V_THRESHOLD);
}

/**
 * One oscillator core integrated in the time domain.
 *
 * The state is the capacitor voltage plus whether the discharge switch is
 * closed. Both phases use the exact solution of their circuit rather than a
 * numerical integrator — a straight line for constant current into a
 * capacitor, an exponential for the RC through the switch — so neither phase
 * accumulates integration error. Steps are split at each comparator trip so
 * resets land on their true sub-sample time.
 */
export class VcoCore {
  /** Capacitor voltage. */
  v = 0;
  /** True while the comparator holds the discharge transistor closed. */
  resetting = false;

  private resetRemaining = 0;
  private current: number;

  constructor(cv: number, temperature = T_NOMINAL) {
    this.current = converterCurrent(cv, temperature);
  }

  setCv(cv: number, temperature = T_NOMINAL): void {
    this.current = converterCurrent(cv, temperature);
  }

  /** Core output as the raw ramp, normalized to 0..1. */
  get ramp(): number {
    return this.v / V_THRESHOLD;
  }

  /**
   * Close the discharge switch wherever the ramp happens to be.
   *
   * This is the sync input: the master's reset pulse is coupled into this
   * core's discharge transistor, so the slave restarts mid-cycle. It is the
   * same path the comparator uses, which is why hard sync sounds like the
   * oscillator's own reset rather than a separate effect.
   */
  forceReset(): void {
    this.resetting = true;
    this.resetRemaining = T_RESET;
  }

  /**
   * Advance the core by dt seconds.
   *
   * `onReset` fires for each comparator trip inside the step, with its offset
   * in seconds from the start of the step. That offset is the sub-sample
   * timing a band-limited audio path needs to place a correction; the scope
   * uses it to draw the reset where it actually happened.
   */
  advance(dt: number, onReset?: (offset: number) => void): void {
    let t = 0;
    let events = 0;

    while (t < dt && events < MAX_EVENTS_PER_STEP) {
      if (this.resetting) {
        const span = Math.min(dt - t, this.resetRemaining);
        this.v *= Math.exp(-span / TAU_RESET);
        this.resetRemaining -= span;
        t += span;
        if (this.resetRemaining <= 0) this.resetting = false;
        continue;
      }

      const slope = this.current / C_TIMING; // volts per second
      const toThreshold = (V_THRESHOLD - this.v) / slope;
      if (toThreshold > dt - t) {
        this.v += slope * (dt - t);
        return;
      }

      t += toThreshold;
      this.v = V_THRESHOLD;
      this.forceReset();
      onReset?.(t);
      events++;
    }
  }
}
