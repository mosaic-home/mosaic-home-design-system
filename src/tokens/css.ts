import { rgba } from './color.ts';
import { THEME_ID } from './custom.ts';
import { DEVICE_CLASSES, resolveTokens } from './resolve.ts';
import { THEMES } from './themes.ts';
import type { Elevation, Hex, Theme, Tokens } from './types.ts';

/** CSS custom properties are all prefixed with this. */
export const PREFIX = '--mh-';

const kebab = (s: string): string => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function shadow(e: Elevation, level: number, t: Tokens): string {
  const ch = t.theme.character;
  if (e.alpha === 0) return 'none';
  if (ch.depth === 'glow') {
    const k = Math.max(0, Math.min(1, ch.glow));
    if (k === 0) return 'none';
    return `0 0 ${Math.round(e.blur * 0.8)}px ${rgba(t.theme.palette.accent, Number((0.18 * level * k).toFixed(3)))}`;
  }
  return `0 ${e.offsetY}px ${e.blur}px ${rgba('#000000', e.alpha)}`;
}

/** The colour variables of a theme (they don't depend on the device class). */
export function colorVariables(theme: Theme): Record<string, string> {
  const p = theme.palette;
  const ch = theme.character;
  const soft = (c: Hex): string => rgba(c, theme.highContrast ? 0.28 : 0.16);
  const v: Record<string, string> = {
    'canvas-top': p.canvasTop,
    'canvas-bottom': p.canvasBottom,
    glow: rgba(p.glow, p.glowAlpha),
    surface: rgba(p.surface, p.surfaceAlpha),
    'surface-solid': p.surface,
    'surface-raised': p.surfaceRaised,
    'surface-pressed': p.surfacePressed,
    input: p.input,
    outline: rgba(p.outline, p.outlineAlpha),
    // Borders of controls that need to read as controls (fields, switches, chips): visible even where hairlines are faint.
    'outline-strong': theme.highContrast ? p.outline : rgba(p.textMuted, 0.45),
    'panel-outline': ch.outlined ? rgba(p.outline, Math.max(p.outlineAlpha, 0.5)) : rgba(p.outline, p.outlineAlpha),
    divider: p.divider,
    heading: p.heading,
    text: p.text,
    'text-muted': p.textMuted,
    'text-faint': p.textFaint,
    accent: p.accent,
    'on-accent': p.onAccent,
    'accent-light': p.accentLight,
    'accent-dark': p.accentDark,
    'accent-soft': soft(p.accent),
    focus: p.focus,
    selection: rgba(p.selection, 0.28),
    success: p.success,
    'success-soft': soft(p.success),
    info: p.info,
    'info-soft': soft(p.info),
    warning: p.warning,
    'warning-soft': soft(p.warning),
    danger: p.danger,
    'danger-soft': soft(p.danger),
    'on-status': p.onStatus,
    scrim: rgba(p.scrim, p.scrimAlpha),
    hover: rgba(p.text, theme.dark ? 0.06 : 0.05),
    // Raster map tiles are drawn for light backgrounds; dark themes turn them into dim streets on a dark ground.
    'geo-map-tile-filter': theme.dark ? (theme.highContrast ? 'invert(1) hue-rotate(180deg) contrast(1.15)' : 'invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.85) saturate(0.6)') : 'none',
    backdrop: ch.backdrop
      ? `radial-gradient(120% 70% at 50% 0%, ${rgba(p.glow, p.glowAlpha)}, transparent 70%), linear-gradient(${p.canvasTop}, ${p.canvasBottom})`
      : p.canvasBottom,
    'color-scheme': theme.dark ? 'dark' : 'light',
  };
  p.series.forEach((c, i) => (v[`series-${i + 1}`] = c));
  return v;
}

/** The size, shape, motion and type variables for a theme on one device class. */
export function sizeVariables(t: Tokens): Record<string, string> {
  const v: Record<string, string> = {};
  for (const [k, n] of Object.entries(t.type)) v[`text-${k}`] = `${n}px`;
  for (const [k, n] of Object.entries(t.space)) v[`space-${k}`] = `${n}px`;
  for (const k of ['sm', 'md', 'lg', 'xl'] as const) v[`radius-${k}`] = `${t.radius[k]}px`;
  v['radius-full'] = '9999px';
  v['radius-control'] = t.radius.pillControls ? '9999px' : `${t.radius.md}px`;
  for (const [k, n] of Object.entries(t.control)) v[`control-${k}`] = `${n}px`;
  v['border-width'] = `${t.theme.character.outline}px`;
  t.elevation.forEach((e, i) => i > 0 && (v[`shadow-${i}`] = shadow(e, i, t)));
  for (const [k, n] of Object.entries(t.motion)) v[`duration-${kebab(k)}`] = `${n}ms`;
  v.ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
  v['ease-out'] = 'cubic-bezier(0.16, 1, 0.3, 1)';
  v['font-sans'] = t.typeface.sans;
  v['font-mono'] = t.typeface.mono;
  v['font-serif'] = t.typeface.serif;
  v['focus-width'] = t.theme.highContrast ? '3px' : '2px';
  return v;
}

/** Every variable for these tokens, with the `--mh-` prefix. */
export function themeVariables(t: Tokens): Record<string, string> {
  const all = { ...colorVariables(t.theme), ...sizeVariables(t) };
  return Object.fromEntries(Object.entries(all).map(([k, v]) => [`${PREFIX}${k}`, v]));
}

function block(selector: string, vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .map(([k, v]) => (k === 'color-scheme' ? `  color-scheme: ${v};` : `  ${PREFIX}${k}: ${v};`))
    .join('\n');
  return `${selector} {\n${body}\n}`;
}

/**
 * The static stylesheet for the built-in themes: `[data-mh-theme]` blocks (phone sizes), `[data-mh-device]` blocks
 * for the other device classes, and `data-mh-theme="auto"` following the system's light or dark setting.
 */
export function themesStylesheet(themes: readonly Theme[] = THEMES, auto: { dark: string; light: string } = { dark: 'midnight', light: 'daylight' }): string {
  const out: string[] = ['/* Generated by tools/build-tokens.ts. Do not edit. */'];
  const all = (theme: Theme): Record<string, string> => ({ ...colorVariables(theme), ...sizeVariables(resolveTokens(theme, 'phone')) });
  for (const theme of themes) {
    const sel = theme.id === auto.dark ? `:root, [data-mh-theme='${theme.id}']` : `[data-mh-theme='${theme.id}']`;
    out.push(block(sel, all(theme)));
  }
  const dark = themes.find((t) => t.id === auto.dark);
  const light = themes.find((t) => t.id === auto.light);
  if (dark && light) {
    out.push(block(`[data-mh-theme='auto']`, all(dark)));
    out.push(`@media (prefers-color-scheme: light) {\n${block(`  [data-mh-theme='auto']`, all(light)).replace(/\n/g, '\n  ')}\n}`);
  }
  // Device classes change sizes only; the built-in themes share their character, so one block per class does.
  const base = themes[0];
  if (base) {
    for (const dc of DEVICE_CLASSES) {
      if (dc === 'phone') continue;
      const v = sizeVariables(resolveTokens(base, dc));
      const sizes = Object.fromEntries(Object.entries(v).filter(([k]) => /^(text|space|radius|control)-/.test(k)));
      out.push(block(`[data-mh-device='${dc}']`, sizes));
    }
  }
  return `${out.join('\n\n')}\n`;
}

/**
 * A stylesheet for one more theme, to load after themes.css: `[data-mh-theme='<id>']` with every variable at phone
 * sizes, and a block per other device class. Those blocks are keyed on the theme as well, because a custom
 * character (density, corners) changes the sizes that the shared device blocks in themes.css assume.
 */
export function customThemeStylesheet(theme: Theme): string {
  if (!THEME_ID.test(theme.id)) throw new Error(`Theme id "${theme.id}": lowercase letters, digits and dashes only.`);
  const out: string[] = [`/* Mosaic Home theme: ${theme.name.replace(/\*\//g, '')} */`];
  out.push(block(`[data-mh-theme='${theme.id}']`, { ...colorVariables(theme), ...sizeVariables(resolveTokens(theme, 'phone')) }));
  for (const dc of DEVICE_CLASSES) {
    if (dc === 'phone') continue;
    out.push(block(`[data-mh-theme='${theme.id}'][data-mh-device='${dc}']`, sizeVariables(resolveTokens(theme, dc))));
  }
  return `${out.join('\n\n')}\n`;
}
