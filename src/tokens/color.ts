import type { Hex } from './types.ts';

function channels(c: Hex): [number, number, number] {
  const n = Number.parseInt(c.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function hex(r: number, g: number, b: number): Hex {
  return `#${((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).padStart(6, '0')}`;
}

/** Linear mix in sRGB; `t = 0` gives `a`. */
export function mix(a: Hex, b: Hex, t: number): Hex {
  const k = Math.min(1, Math.max(0, t));
  const [ar, ag, ab] = channels(a);
  const [br, bg, bb] = channels(b);
  return hex(ar + (br - ar) * k, ag + (bg - ag) * k, ab + (bb - ab) * k);
}

export const lighten = (c: Hex, t: number): Hex => mix(c, '#ffffff', t);
export const darken = (c: Hex, t: number): Hex => mix(c, '#000000', t);

/** WCAG 2 relative luminance, 0..1. */
export function luminance(c: Hex): number {
  const lin = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = channels(c);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG 2 contrast ratio, 1..21. */
export function contrastRatio(a: Hex, b: Hex): number {
  const x = luminance(a) + 0.05;
  const y = luminance(b) + 0.05;
  return x > y ? x / y : y / x;
}

/** `rgb(r g b / a)` for CSS. */
export function rgba(c: Hex, alpha: number): string {
  const [r, g, b] = channels(c);
  return alpha >= 1 ? c : `rgb(${r} ${g} ${b} / ${Number(alpha.toFixed(3))})`;
}

/** `#rrggbb` → `0xRRGGBB`, for C and C++ renderers. */
export function toInt(c: Hex): number {
  return Number.parseInt(c.slice(1), 16);
}

export function isHex(value: string): value is Hex {
  return /^#[0-9a-f]{6}$/i.test(value);
}
