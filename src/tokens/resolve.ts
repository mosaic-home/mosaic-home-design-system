import type { Corners, Density, DeviceClass, Elevation, Motion, Radii, Spacing, Theme, Tokens, TypeScale, Typeface } from './types.ts';

export const DEVICE_CLASSES: readonly DeviceClass[] = ['wearable', 'phone', 'tablet', 'tv'];
export const CORNERS: readonly Corners[] = ['square', 'crisp', 'soft', 'round', 'pill', 'mosaic'];
export const DENSITIES: readonly Density[] = ['compact', 'regular', 'comfortable'];

interface ClassScale {
  type: TypeScale;
  radius: [number, number, number, number];
  space: Spacing;
}

const SPACE: Spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/**
 * Per device class: type sizes (display, headline, title, body, label, caption), card radii (sm, md, lg, xl) for
 * the `mosaic` corners, and spacing. TV sizes are for content read from about three metres on a 1920 x 1080 dp
 * screen.
 */
const CLASS_SCALES: Record<DeviceClass, ClassScale> = {
  wearable: {
    type: { display: 76, headline: 34, title: 17, body: 15, label: 13, caption: 11 },
    radius: [8, 14, 20, 28],
    space: { xxs: 2, xs: 4, sm: 6, md: 10, lg: 12, xl: 16, xxl: 22 },
  },
  phone: {
    type: { display: 96, headline: 40, title: 19, body: 16, label: 13, caption: 11 },
    radius: [10, 16, 24, 30],
    space: SPACE,
  },
  tablet: {
    type: { display: 120, headline: 46, title: 21, body: 17, label: 14, caption: 12 },
    radius: [12, 18, 26, 34],
    space: { xxs: 2, xs: 4, sm: 8, md: 12, lg: 18, xl: 26, xxl: 36 },
  },
  tv: {
    type: { display: 150, headline: 46, title: 24, body: 20, label: 18, caption: 15 },
    radius: [12, 18, 26, 34],
    space: { xxs: 3, xs: 6, sm: 10, md: 14, lg: 20, xl: 28, xxl: 40 },
  },
};

/** Phone radii (sm, md, lg, xl) for every corner language except `mosaic`, which keeps the per-class radii. */
const SHAPES: Record<Exclude<Corners, 'mosaic'>, [number, number, number, number]> = {
  square: [0, 0, 0, 0],
  crisp: [2, 3, 4, 8],
  soft: [5, 8, 10, 20],
  round: [8, 12, 16, 28],
  pill: [6, 10, 12, 28],
};

/** Shapes are drawn a little tighter on watches and a little rounder on tablets and TVs. */
const SHAPE_FACTOR: Record<DeviceClass, number> = { wearable: 0.85, phone: 1, tablet: 1.1, tv: 1.1 };

export const DENSITY_FACTOR: Record<Density, number> = { compact: 0.75, regular: 1, comfortable: 1.25 };

export const MOTION: Motion = { fast: 140, normal: 260, slow: 420, reflow: 480, enter: 420, exit: 220, stagger: 40, overlay: 360 };

/** Inter is the reference face (the LVGL kit renders it); platforms fall back to their system face. */
export const TYPEFACE: Typeface = {
  sans: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Menlo, Consolas, monospace",
  serif: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
};

/** Control heights at regular density (a 44 dp touch target for `md`). */
const CONTROL = { sm: 32, md: 44, lg: 52 };

const ROUND_DP = (v: number): number => Math.round(v * 100) / 100;

/** Resolves a theme for one device class: the values every renderer draws with. */
export function resolveTokens(theme: Theme, deviceClass: DeviceClass = 'phone'): Tokens {
  const scale = CLASS_SCALES[deviceClass];
  const ch = theme.character;

  let radius: Radii;
  if (ch.corners === 'mosaic') {
    const [sm, md, lg, xl] = scale.radius;
    radius = { sm, md, lg, xl, full: 9999, pillControls: true };
  } else {
    const k = SHAPE_FACTOR[deviceClass];
    const [sm, md, lg, xl] = SHAPES[ch.corners].map((v) => ROUND_DP(v * k)) as [number, number, number, number];
    radius = { sm, md, lg, xl, full: 9999, pillControls: ch.corners === 'pill' };
  }

  const density = DENSITY_FACTOR[ch.density];
  const space = Object.fromEntries(Object.entries(scale.space).map(([k, v]) => [k, Math.round(v * density)])) as unknown as Spacing;
  const controlFactor = 1 + (density - 1) / 2;
  const control = { sm: Math.round(CONTROL.sm * controlFactor), md: Math.round(CONTROL.md * controlFactor), lg: Math.round(CONTROL.lg * controlFactor) };

  const none: Elevation = { blur: 0, offsetY: 0, alpha: 0 };
  const flat = theme.highContrast || ch.depth === 'flat';
  const elevation: Tokens['elevation'] = flat
    ? [none, none, none, none]
    : [
        none,
        { blur: 18, offsetY: 4, alpha: theme.dark ? 0.275 : 0.11 },
        { blur: 30, offsetY: 10, alpha: theme.dark ? 0.431 : 0.157 },
        { blur: 48, offsetY: 18, alpha: theme.dark ? 0.588 : 0.22 },
      ];

  return { theme, deviceClass, type: { ...scale.type }, space, radius, motion: MOTION, elevation, density, control, typeface: TYPEFACE };
}
