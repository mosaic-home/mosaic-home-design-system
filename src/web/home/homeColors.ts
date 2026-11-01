import { homeColorVariables } from '../../tokens/home.ts';
import { DEFAULT_THEME_ID, themeById } from '../../tokens/themes.ts';
import type { Theme } from '../../tokens/types.ts';

/**
 * Turns on the optional home colours (`--mh-home-heat`, `--mh-home-cool`, `--mh-home-auto`, `--mh-home-dry`,
 * `--mh-home-light-on`) for a theme on an element (default `<html>`). Without them the home controls use the
 * theme's general roles (warning for heat and lit lights, info for cooling).
 */
export function applyHomeColors(theme: Theme | string, target: HTMLElement = document.documentElement): void {
  const resolved = typeof theme === 'string' ? (themeById(theme) ?? themeById(DEFAULT_THEME_ID)!) : theme;
  for (const [name, value] of Object.entries(homeColorVariables(resolved))) target.style.setProperty(name, value);
}

/** Removes the home colours set by `applyHomeColors`. */
export function clearHomeColors(target: HTMLElement = document.documentElement): void {
  for (const name of Object.keys(homeColorVariables(themeById(DEFAULT_THEME_ID)!))) target.style.removeProperty(name);
}
