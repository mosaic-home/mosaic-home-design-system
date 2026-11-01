import { luminance, mix } from './color.ts';
import type { Hex, Theme } from './types.ts';

export type AccentName = 'coral' | 'amber' | 'lime' | 'teal' | 'sky' | 'violet' | 'rose';

/** Named accents, as `[on dark canvases, on light canvases]`. */
const ACCENTS: Record<AccentName, readonly [Hex, Hex]> = {
  coral: ['#ff8a70', '#e0553a'],
  amber: ['#ffc24d', '#b57500'],
  lime: ['#a8e063', '#4a9418'],
  teal: ['#4fd1c5', '#0e8c84'],
  sky: ['#6ec6ff', '#1c7acc'],
  violet: ['#b39dff', '#6c4bdd'],
  rose: ['#ff80ae', '#d13c74'],
};

export const ACCENT_NAMES = Object.keys(ACCENTS) as AccentName[];

/** A named accent tuned for the theme's canvas: lighter on dark themes, deeper on light ones. */
export function namedAccent(name: AccentName, theme: Theme): Hex {
  const [dark, light] = ACCENTS[name];
  if (!theme.dark) return light;
  // Nightstand keeps everything dim and warm: take the edge off.
  return theme.id === 'nightstand' ? mix(dark, '#000000', 0.22) : dark;
}

/** The theme with its accent replaced by a named one, and `onAccent` picked for contrast. */
export function withAccent(theme: Theme, name: AccentName | 'default'): Theme {
  if (name === 'default' || !(name in ACCENTS)) return theme;
  const c = namedAccent(name, theme);
  const p = theme.palette;
  const onAccent: Hex = theme.highContrast ? '#000000' : luminance(c) > 0.3 ? mix(c, '#000000', 0.86) : '#ffffff';
  return {
    ...theme,
    palette: {
      ...p,
      accent: c,
      accentLight: mix(c, '#ffffff', 0.3),
      accentDark: mix(c, '#000000', 0.25),
      focus: theme.dark ? mix(c, '#ffffff', 0.3) : c,
      selection: c,
      series: [c, p.series[1], p.series[2], p.series[3], p.series[4], p.series[5]],
      onAccent,
    },
  };
}
