/**
 * Component values for one oscillator core, in SI units.
 *
 * These are ordinary analog-VCO part values, not measurements of a Muse.
 * Moog has not published a schematic for the instrument, so the topology
 * modeled here is the standard ramp-and-reset saw core every analog
 * oscillator of this type uses: an exponential converter turns the control
 * voltage into a charging current, that current ramps a timing capacitor,
 * a comparator trips at threshold, and a transistor shorts the capacitor
 * through its own on-resistance.
 *
 * Swap these for measured values if a schematic ever surfaces — nothing in
 * the model hard-codes them beyond this file.
 */

/** Timing capacitor the converter current charges. */
export const C_TIMING = 1e-9; // farads

/** Comparator trip point, i.e. the peak of the ramp. */
export const V_THRESHOLD = 5; // volts

/** On-resistance of the discharge transistor; sets the reset time constant. */
export const R_ON = 220; // ohms

/** How long the comparator holds the discharge switch closed. */
export const T_RESET = 1.5e-6; // seconds

/** Boltzmann's constant over elementary charge, for the thermal voltage. */
export const K_OVER_Q = 8.617333262e-5; // volts per kelvin

/** Junction temperature the tempco resistor is trimmed at (27 °C). */
export const T_NOMINAL = 300.15; // kelvin

/**
 * Converter current at 0 V, picked so that the capacitor and threshold above
 * put the core at A440: f = I / (C · V_th) = 2.2 µA / (1 nF · 5 V).
 */
export const I_REF = 440 * C_TIMING * V_THRESHOLD; // amperes

/**
 * Residual 1V/oct scale error per kelvin away from nominal. A tempco resistor
 * cancels most of the thermal voltage's drift but never all of it, which is
 * why an analog oscillator needs to warm up before it stays in tune.
 */
export const TEMPCO_ERROR = 3.3e-4; // octaves per kelvin

/** Ceiling on comparator trips resolved inside a single step. */
export const MAX_EVENTS_PER_STEP = 64;
