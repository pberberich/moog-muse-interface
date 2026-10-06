/**
 * In-place iterative radix-2 FFT. Both arrays must share a power-of-two
 * length. Small enough to keep here rather than pull a dependency in for a
 * scope display.
 */
export function fft(re: Float32Array, im: Float32Array): void {
  const n = re.length;
  if (n <= 1) return;

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const step = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const angle = step * k;
        const wr = Math.cos(angle);
        const wi = Math.sin(angle);
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b] * wr - im[b] * wi;
        const ti = re[b] * wi + im[b] * wr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
      }
    }
  }
}

/**
 * Hann-windowed magnitude spectrum in dB, normalized so the loudest bin sits
 * at 0 dB and anything below `floorDb` is clamped there.
 *
 * The DC term is removed first: the oscillator core's ramp swings 0..1, and
 * its offset would otherwise dominate the display.
 */
export function magnitudeSpectrum(signal: Float32Array, floorDb = -90): Float32Array {
  const n = signal.length;
  const re = new Float32Array(n);
  const im = new Float32Array(n);

  let mean = 0;
  for (let i = 0; i < n; i++) mean += signal[i];
  mean /= n;

  for (let i = 0; i < n; i++) {
    const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
    re[i] = (signal[i] - mean) * window;
  }

  fft(re, im);

  const bins = new Float32Array(n / 2);
  let peak = 1e-20;
  for (let i = 0; i < bins.length; i++) {
    bins[i] = Math.hypot(re[i], im[i]);
    if (bins[i] > peak) peak = bins[i];
  }

  for (let i = 0; i < bins.length; i++) {
    bins[i] = Math.max(floorDb, 20 * Math.log10(bins[i] / peak));
  }
  return bins;
}
