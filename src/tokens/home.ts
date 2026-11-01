import { mix } from './color.ts';
import type { Hex, Theme } from './types.ts';

/** Optional colours for home-control screens (thermostats, lights), derived from a theme's general roles. */
export interface HomeColors {
  heat: Hex;
  cool: Hex;
  /** Heat-cool / auto. */
  auto: Hex;
  /** Dehumidifying. */
  dry: Hex;
  /** A lit light's warm tint. */
  lightOn: Hex;
}

/** Values tuned by hand for the built-in themes. */
const TUNED: Record<string, HomeColors> = {
  midnight: { heat: '#ff8a4c', cool: '#4fc3f7', auto: '#b39dff', dry: '#e6c35c', lightOn: '#ffc98a' },
  daylight: { heat: '#ee6a2c', cool: '#1b8fd6', auto: '#7b5cf0', dry: '#c49a1a', lightOn: '#f2a23c' },
  nightstand: { heat: '#ff8a4c', cool: '#86a9c6', auto: '#c99bd6', dry: '#d9b45a', lightOn: '#ffb36b' },
  contrast: { heat: '#ffa05c', cool: '#5cd2ff', auto: '#c7b3ff', dry: '#ffe066', lightOn: '#ffd89a' },
};

export function homeColors(theme: Theme): HomeColors {
  const tuned = TUNED[theme.id];
  if (tuned) return tuned;
  const p = theme.palette;
  return {
    heat: theme.dark ? '#ff8a4c' : '#ee6a2c',
    cool: p.info,
    auto: mix(p.accentLight, p.info, 0.5),
    dry: mix(p.warning, p.surface, 0.15),
    lightOn: theme.dark ? '#ffc98a' : '#f2a23c',
  };
}

/**
 * The home colours as CSS custom properties: `--mh-home-heat`, `--mh-home-cool`, `--mh-home-auto`, `--mh-home-dry`
 * and `--mh-home-light-on`. Opt-in: home components fall back to the theme's general roles when they're absent.
 */
export function homeColorVariables(theme: Theme): Record<string, string> {
  const c = homeColors(theme);
  return {
    '--mh-home-heat': c.heat,
    '--mh-home-cool': c.cool,
    '--mh-home-auto': c.auto,
    '--mh-home-dry': c.dry,
    '--mh-home-light-on': c.lightOn,
  };
}
