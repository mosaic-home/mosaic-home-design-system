import { withAccent, type AccentName } from '../tokens/accents.ts';
import { themeVariables } from '../tokens/css.ts';
import { resolveTokens } from '../tokens/resolve.ts';
import { DEFAULT_THEME_ID, THEMES, themeById, withCharacter } from '../tokens/themes.ts';
import type { Character, DeviceClass, Theme, Tokens } from '../tokens/types.ts';

export interface ApplyThemeOptions {
  /** Default `phone`. */
  deviceClass?: DeviceClass;
  /** Override parts of the theme's character: corners, density, depth, glow, outline, backdrop, outlined. */
  character?: Partial<Character>;
  /** A named accent in place of the theme's own. */
  accent?: AccentName | 'default';
}

/**
 * Applies a theme to an element (default `<html>`) as inline CSS variables, and records it in `data-mh-theme`,
 * `data-mh-device`, `data-mh-mode`, `data-mh-corners` and `data-mh-depth` for CSS to key on. Returns the resolved
 * tokens. Pages that only need a built-in theme can skip this and set `data-mh-theme` themselves (themes.css).
 */
export function applyTheme(theme: Theme | string, options: ApplyThemeOptions = {}, target: HTMLElement = document.documentElement): Tokens {
  let resolved = typeof theme === 'string' ? (themeById(theme) ?? themeById(DEFAULT_THEME_ID)!) : theme;
  if (options.character) resolved = withCharacter(resolved, options.character);
  if (options.accent) resolved = withAccent(resolved, options.accent);
  const tokens = resolveTokens(resolved, options.deviceClass ?? 'phone');
  for (const [name, value] of Object.entries(themeVariables(tokens))) {
    if (name === '--mh-color-scheme') target.style.colorScheme = value;
    else target.style.setProperty(name, value);
  }
  target.dataset.mhTheme = resolved.id;
  target.dataset.mhDevice = tokens.deviceClass;
  target.dataset.mhMode = resolved.dark ? 'dark' : 'light';
  target.dataset.mhCorners = resolved.character.corners;
  target.dataset.mhDepth = resolved.highContrast ? 'flat' : resolved.character.depth;
  target.toggleAttribute('data-mh-high-contrast', resolved.highContrast);
  target.dispatchEvent(new CustomEvent<Tokens>('mh-themechange', { detail: tokens, bubbles: true }));
  return tokens;
}

/** Every built-in theme, for a theme menu. */
export function listThemes(): readonly Theme[] {
  return THEMES;
}
