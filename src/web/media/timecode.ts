// Time and number formatting shared by the media editors.

export interface TimecodeOptions {
  /** Frames per second: adds a frame field (`HH:MM:SS:FF`, always with hours). */
  fps?: number;
  /** Always show hours (`0:01:05`). */
  hours?: boolean;
  /** Digits after the seconds (`1:05.25`); ignored with `fps`. */
  decimals?: number;
}

const pad = (n: number, width = 2): string => String(n).padStart(width, '0');

/**
 * `1:05`, `1:02:05`, `00:01:05:12` (with `fps`). Negative times get a minus sign; non-finite ones read as zero.
 * Frames are counted down (a frame is shown once it has fully begun).
 */
export function formatTimecode(seconds: number, options: TimecodeOptions = {}): string {
  const value = Number.isFinite(seconds) ? seconds : 0;
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const fps = options.fps && options.fps > 0 ? Math.round(options.fps) : 0;
  if (fps) {
    // A small tolerance so 0.1 s at 30 fps is frame 3, not 2.9999.
    const frames = Math.floor(abs * fps + 1e-6);
    const f = frames % fps;
    const total = Math.floor(frames / fps);
    return `${sign}${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}:${pad(f)}`;
  }
  const decimals = Math.max(0, Math.min(3, Math.floor(options.decimals ?? 0)));
  const unit = 10 ** decimals;
  const scaled = Math.round(abs * unit);
  const total = Math.floor(scaled / unit);
  const fraction = decimals ? `.${pad(scaled % unit, decimals)}` : '';
  const h = Math.floor(total / 3600);
  const m = Math.floor(total / 60) % 60;
  const s = total % 60;
  if (h || options.hours) return `${sign}${h}:${pad(m)}:${pad(s)}${fraction}`;
  return `${sign}${m}:${pad(s)}${fraction}`;
}

/** Rounds to at most `decimals` places and drops trailing zeros (`12.5`, `12`). */
export function trimNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0';
  const unit = 10 ** decimals;
  const rounded = Math.round(value * unit) / unit;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
