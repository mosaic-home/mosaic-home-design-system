import { ACCENT_NAMES, namedAccent } from './accents.ts';
import { homeColors } from './home.ts';
import { DENSITY_FACTOR, DEVICE_CLASSES, MOTION, resolveTokens } from './resolve.ts';
import { THEMES } from './themes.ts';
import type { DeviceClass, Theme } from './types.ts';

/** Bumped when the shape of the export changes, so importers can refuse a format they don't know. */
export const TOKENS_FORMAT = 1;

/**
 * Everything other renderers need, as plain data: every built-in theme (palette, character, home colours, named
 * accents) and the scales per device class. The LVGL kit generates its C++ themes from this file.
 */
export function exportTokens(themes: readonly Theme[] = THEMES): object {
  const scales = Object.fromEntries(
    DEVICE_CLASSES.map((dc: DeviceClass) => {
      const t = resolveTokens(THEMES[0]!, dc);
      return [dc, { type: t.type, space: t.space, radius: { sm: t.radius.sm, md: t.radius.md, lg: t.radius.lg, xl: t.radius.xl }, control: t.control }];
    }),
  );
  return {
    $schema: 'https://github.com/mosaic-home/mosaic-home-design-system/blob/main/docs/tokens.md',
    format: TOKENS_FORMAT,
    units: { size: 'dp', color: '#rrggbb', alpha: '0..1' },
    themes: themes.map((theme) => ({
      ...theme,
      home: homeColors(theme),
      accents: Object.fromEntries(ACCENT_NAMES.map((n) => [n, namedAccent(n, theme)])),
      elevation: resolveTokens(theme, 'phone').elevation,
    })),
    scales,
    density: DENSITY_FACTOR,
    motion: MOTION,
  };
}
