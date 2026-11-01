// Nice axis scales: round tick steps (1, 2, 2.5, 5 times a power of ten) that cover the data.

export interface NiceScale {
  min: number;
  max: number;
  step: number;
  /** Tick values from `min` to `max`, both included. */
  ticks: number[];
}

/** A round step close to `range / count`. */
export function niceStep(range: number, count = 4): number {
  if (!(range > 0) || !Number.isFinite(range)) return 1;
  const raw = range / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * mag;
}

/** Decimals needed to write multiples of `step` exactly (2.5 → 1, 0.25 → 2, 50 → 0). */
export function stepDecimals(step: number): number {
  let d = 0;
  while (d < 10 && Math.abs(Math.round(step * 10 ** d) - step * 10 ** d) > 1e-6) d += 1;
  return d;
}

/** A scale with about `count` round steps covering `lo`..`hi`. A flat range is widened so it still has a height. */
export function niceScale(lo: number, hi: number, count = 4): NiceScale {
  let a = Number.isFinite(lo) ? lo : 0;
  let b = Number.isFinite(hi) ? hi : a;
  if (a > b) [a, b] = [b, a];
  if (a === b) {
    if (a === 0) b = 1;
    else if (a > 0) a = 0;
    else b = 0;
  }
  const step = niceStep(b - a, count);
  const d = stepDecimals(step);
  const fix = (v: number): number => Number(v.toFixed(d));
  const min = fix(Math.floor(a / step + 1e-9) * step);
  const max = fix(Math.ceil(b / step - 1e-9) * step);
  const ticks: number[] = [];
  for (let i = 0; i <= Math.round((max - min) / step); i += 1) ticks.push(fix(min + i * step));
  return { min, max, step, ticks };
}

/** Formats a tick of a scale with the step's decimals. */
export function tickText(value: number, step: number): string {
  const v = value.toFixed(stepDecimals(step));
  return v === '-0' ? '0' : v;
}

/** The default number format of the charts: up to two decimals, no trailing zeros. */
export function plainNumber(value: number): string {
  return String(Number(value.toFixed(2)));
}
