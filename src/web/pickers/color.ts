// Colour maths for the pickers: hex parsing and formatting, and RGB ↔ HSV (hue 0–360, saturation and value 0–1).

export interface Rgba {
  /** 0–255 */
  r: number;
  g: number;
  b: number;
  /** 0–1 */
  a: number;
}

export interface Hsva {
  /** 0–360 */
  h: number;
  /** 0–1 */
  s: number;
  v: number;
  a: number;
}

const HEX = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Parses `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` (the `#` optional); null when it isn't one. */
export function parseHex(text: string): Rgba | null {
  const m = HEX.exec(text.trim());
  if (!m) return null;
  let hex = m[1]!;
  if (hex.length <= 4) hex = [...hex].map((c) => c + c).join('');
  const n = (i: number): number => parseInt(hex.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? Math.round((n(6) / 255) * 1000) / 1000 : 1 };
}

const byte = (n: number): string =>
  Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, '0');

/** `#rrggbb`, or `#rrggbbaa` when `alpha` is on and the colour isn't opaque. Lower case. */
export function toHex(c: Rgba, alpha = false): string {
  const base = `#${byte(c.r)}${byte(c.g)}${byte(c.b)}`;
  return alpha && c.a < 1 ? base + byte(c.a * 255) : base;
}

export function rgbToHsv(c: Rgba): Hsva {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d > 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: max === 0 ? 0 : d / max, v: max, a: c.a };
}

export function hsvToRgb(c: Hsva): Rgba {
  const hue = (((c.h % 360) + 360) % 360) / 60;
  const chroma = c.v * c.s;
  const x = chroma * (1 - Math.abs((hue % 2) - 1));
  const m = c.v - chroma;
  const [r, g, b] = hue < 1 ? [chroma, x, 0] : hue < 2 ? [x, chroma, 0] : hue < 3 ? [0, chroma, x] : hue < 4 ? [0, x, chroma] : hue < 5 ? [x, 0, chroma] : [chroma, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255, a: c.a };
}

/** Linear mix of two colours in sRGB, `t` from 0 (`a`) to 1 (`b`). */
export function mixRgba(a: Rgba, b: Rgba, t: number): Rgba {
  const k = Math.min(1, Math.max(0, t));
  return { r: a.r + (b.r - a.r) * k, g: a.g + (b.g - a.g) * k, b: a.b + (b.b - a.b) * k, a: a.a + (b.a - a.a) * k };
}

/** `rgb(r g b / a)` for inline styles. */
export function cssRgba(c: Rgba): string {
  const r = (n: number): number => Math.round(Math.min(255, Math.max(0, n)));
  return `rgb(${r(c.r)} ${r(c.g)} ${r(c.b)} / ${Math.round(c.a * 1000) / 1000})`;
}

/** Relative luminance (WCAG), 0 black to 1 white. */
export function luminance(c: Rgba): number {
  const lin = (n: number): number => {
    const s = n / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/**
 * A starter set of swatches: twelve hues around the wheel at a bright, saturated tone, then white, a mid grey and
 * black. Generated, so any app can replace it with its own list.
 */
export function defaultSwatches(): string[] {
  const hues = Array.from({ length: 12 }, (_, i) => toHex(hsvToRgb({ h: i * 30, s: 0.72, v: 0.92, a: 1 })));
  return [...hues, '#ffffff', '#808080', '#000000'];
}
