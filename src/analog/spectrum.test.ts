import { describe, expect, it } from "vitest";
import { fft, magnitudeSpectrum } from "./spectrum";

describe("fft", () => {
  it("puts a pure tone in its own bin", () => {
    const n = 64;
    const re = new Float32Array(n);
    const im = new Float32Array(n);
    for (let i = 0; i < n; i++) re[i] = Math.sin((2 * Math.PI * 8 * i) / n);

    fft(re, im);

    const magnitude = Array.from({ length: n / 2 }, (_, i) => Math.hypot(re[i], im[i]));
    let peak = 0;
    for (let i = 1; i < magnitude.length; i++) if (magnitude[i] > magnitude[peak]) peak = i;
    expect(peak).toBe(8);
  });

  it("leaves a constant signal entirely in DC", () => {
    const n = 32;
    const re = new Float32Array(n).fill(1);
    const im = new Float32Array(n);

    fft(re, im);

    expect(re[0]).toBeCloseTo(n, 4);
    for (let i = 1; i < n; i++) expect(Math.hypot(re[i], im[i])).toBeCloseTo(0, 4);
  });
});

describe("magnitudeSpectrum", () => {
  it("normalizes its loudest partial to 0 dB", () => {
    const n = 512;
    const signal = new Float32Array(n);
    for (let i = 0; i < n; i++) signal[i] = 0.1 * Math.sin((2 * Math.PI * 16 * i) / n);
    expect(Math.max(...magnitudeSpectrum(signal))).toBeCloseTo(0, 6);
  });

  it("ignores the ramp's DC offset rather than letting it swamp the display", () => {
    const n = 512;
    const signal = new Float32Array(n);
    for (let i = 0; i < n; i++) signal[i] = 0.5 + 0.1 * Math.sin((2 * Math.PI * 16 * i) / n);
    const bins = magnitudeSpectrum(signal);
    expect(bins[0]).toBeLessThan(-40);
    expect(bins[16]).toBeCloseTo(0, 6);
  });
});
