import { contrastRatio, isHex, luminance, mix } from './color.ts';
import { CORNERS, DENSITIES } from './resolve.ts';
import { THEMES, themeById } from './themes.ts';
import type { Character, Depth, Hex, Palette, Theme } from './types.ts';

// Custom themes: a full theme worked out from a few choices, a check that a theme from a file is well formed, and
// the contrast pairs that keep it readable. Pure data in, pure data out.

const DEPTHS: readonly Depth[] = ['shadow', 'glow', 'flat'];
const WHITE: Hex = '#ffffff';
const BLACK: Hex = '#000000';

/** What a custom theme is made from. Everything but `id`, `name` and `base` is optional. */
export interface ThemeSeed {
  /** Lowercase letters, digits and dashes; not the id of a built-in theme. */
  id: string;
  name: string;
  description?: string;
  /** The built-in theme to start from; it also decides high contrast. */
  base: string;
  /** The screen background (the top of the canvas gradient). */
  canvas?: Hex;
  /** Body text. Whichever of canvas and ink is lighter decides light or dark. */
  ink?: Hex;
  accent?: Hex;
  character?: Partial<Character>;
  /** Individual roles, applied last and as given. */
  palette?: Partial<Palette>;
}

/** The colour that keeps `fg` at least `min`:1 against every one of `grounds`, moving it towards `towards`. */
function readable(fg: Hex, grounds: readonly Hex[], min: number, towards: Hex): Hex {
  const ok = (c: Hex): boolean => grounds.every((g) => contrastRatio(c, g) >= min);
  if (ok(fg)) return fg;
  for (let t = 0.05; t < 1; t += 0.05) {
    const c = mix(fg, towards, t);
    if (ok(c)) return c;
  }
  return towards;
}

/** Ink for text on a fill: white, or a near-black tinted by the fill, whichever reads better. */
function inkOn(fill: Hex, highContrast: boolean): Hex {
  const darkInk = highContrast ? BLACK : mix(fill, BLACK, 0.86);
  return contrastRatio(WHITE, fill) >= contrastRatio(darkInk, fill) ? WHITE : darkInk;
}

/**
 * A complete theme from a seed. Surfaces, dividers and the text steps are mixed from the canvas and the ink; the
 * accent's variants, focus, selection and the first chart series follow the accent. Text, muted text and ink on
 * the accent are nudged until they read (4.5:1, or 7:1 in a high-contrast theme). Roles in `seed.palette` are
 * applied after that, unchanged.
 */
export function deriveTheme(seed: ThemeSeed): Theme {
  const base = themeById(seed.base) ?? THEMES[0]!;
  const b = base.palette;
  const hc = base.highContrast;
  const canvas = seed.canvas ?? b.canvasTop;
  const ink0 = seed.ink ?? b.text;
  const dark = luminance(canvas) < luminance(ink0);
  // Status and chart colours are tuned for a light or a dark ground: borrow them from a theme of the right kind.
  const statusFrom = base.dark === dark ? base : (THEMES.find((t) => t.dark === dark && !t.highContrast) ?? base);
  const s = statusFrom.palette;
  const accent = seed.accent ?? (base.dark === dark ? b.accent : s.accent);
  const extreme = dark ? WHITE : BLACK;
  const step = (t: number): Hex => mix(canvas, ink0, t);

  const surface = dark ? step(0.07) : mix(canvas, WHITE, 0.85);
  const surfaceRaised = dark ? step(0.13) : step(0.04);
  const surfacePressed = dark ? step(0.19) : step(0.09);
  const input = dark ? step(0.035) : mix(canvas, WHITE, 0.4);
  const canvasBottom = dark ? mix(canvas, BLACK, 0.55) : mix(canvas, ink0, 0.07);
  const grounds = [surface, surfaceRaised, input, canvas, canvasBottom];
  const min = hc ? 7 : 4.5;
  const text = readable(ink0, grounds, min, extreme);
  const textMuted = readable(mix(text, canvas, hc ? 0.1 : 0.38), hc ? grounds : [surface], min, extreme);
  const textFaint = hc ? readable(mix(text, canvas, 0.22), grounds, 7, extreme) : mix(text, canvas, 0.62);
  const accentLight = mix(accent, WHITE, 0.3);

  const palette: Palette = {
    ...s,
    canvasTop: canvas,
    canvasBottom,
    glow: hc ? canvas : mix(canvas, accent, dark ? 0.35 : 0.45),
    glowAlpha: b.glowAlpha,
    surface,
    surfaceAlpha: b.surfaceAlpha,
    surfaceRaised,
    surfacePressed,
    input,
    outline: hc ? text : dark ? WHITE : BLACK,
    outlineAlpha: b.outlineAlpha,
    divider: hc ? mix(text, canvas, 0.45) : dark ? step(0.12) : step(0.08),
    heading: mix(text, extreme, 0.5),
    text,
    textMuted,
    textFaint,
    accent,
    onAccent: inkOn(accent, hc),
    accentLight,
    accentDark: mix(accent, BLACK, 0.25),
    focus: dark ? accentLight : accent,
    selection: accent,
    onStatus: hc ? BLACK : s.onStatus,
    series: [accent, s.series[1], s.series[2], s.series[3], s.series[4], s.series[5]],
    scrim: dark ? BLACK : mix(ink0, BLACK, 0.3),
    scrimAlpha: b.scrimAlpha,
    ...seed.palette,
  };
  if (hc) Object.assign(palette, { success: b.success, info: b.info, warning: b.warning, danger: b.danger, ...seed.palette });

  return {
    id: seed.id,
    name: seed.name,
    description: seed.description ?? `Custom theme based on ${base.name}.`,
    dark,
    highContrast: hc,
    palette,
    character: { ...base.character, ...seed.character },
  };
}

// Contrast ---------------------------------------------------------------------------------------------------------

export interface ContrastCheck {
  /** What is being read, in words: "Text on surface". */
  label: string;
  fg: keyof Palette;
  bg: keyof Palette;
  ratio: number;
  /** 4.5 (7 in high contrast) for text, 3 for accents and focus rings. */
  min: number;
  ok: boolean;
}

const PAIRS: readonly [keyof Palette, keyof Palette, string, 'text' | 'ui'][] = [
  ['text', 'surface', 'Text on surface', 'text'],
  ['text', 'surfaceRaised', 'Text on raised', 'text'],
  ['text', 'input', 'Text in fields', 'text'],
  ['text', 'canvasTop', 'Text on canvas (top)', 'text'],
  ['text', 'canvasBottom', 'Text on canvas (bottom)', 'text'],
  ['heading', 'surface', 'Headings on surface', 'text'],
  ['textMuted', 'surface', 'Muted text on surface', 'text'],
  ['onAccent', 'accent', 'Ink on accent', 'text'],
  ['accent', 'surface', 'Accent on surface', 'ui'],
  ['focus', 'surface', 'Focus ring on surface', 'ui'],
];

/** The contrast pairs every theme should meet. Built-in themes meet all of them. */
export function checkContrast(theme: Theme): ContrastCheck[] {
  const p = theme.palette;
  const checks = PAIRS.map(([fg, bg, label, kind]) => {
    const ratio = contrastRatio(p[fg] as Hex, p[bg] as Hex);
    // Ink on the accent keeps 4.5:1 in every theme; high contrast raises the rest of the text to 7:1.
    const min = kind === 'ui' ? 3 : theme.highContrast && fg !== 'onAccent' ? 7 : 4.5;
    return { label, fg, bg, ratio, min, ok: ratio >= min };
  });
  if (theme.highContrast) {
    const ratio = contrastRatio(p.textFaint, p.surface);
    checks.push({ label: 'Faint text on surface', fg: 'textFaint', bg: 'surface', ratio, min: 7, ok: ratio >= 7 });
  }
  return checks;
}

// Validation -------------------------------------------------------------------------------------------------------

export type ThemeValidation = { ok: true; theme: Theme } | { ok: false; errors: string[] };

const COLOR_ROLES: readonly (keyof Palette)[] = [
  'canvasTop', 'canvasBottom', 'glow', 'surface', 'surfaceRaised', 'surfacePressed', 'input', 'outline', 'divider',
  'heading', 'text', 'textMuted', 'textFaint', 'accent', 'onAccent', 'accentLight', 'accentDark', 'focus', 'selection',
  'success', 'info', 'warning', 'danger', 'onStatus', 'scrim',
];
const ALPHA_ROLES: readonly (keyof Palette)[] = ['glowAlpha', 'surfaceAlpha', 'outlineAlpha', 'scrimAlpha'];

/** Every palette role, colours first, then the alphas, then the chart series. */
export const PALETTE_ROLES: readonly (keyof Palette)[] = [...COLOR_ROLES, ...ALPHA_ROLES, 'series'];

/** Lowercase letters, digits and dashes, 1 to 32 characters, starting with a letter. */
export const THEME_ID = /^[a-z][a-z0-9-]{0,31}$/;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isUnit = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;

/**
 * Checks that a value (a parsed theme file) is a complete theme, and returns a clean copy holding only the known
 * fields. Colours must be `#rrggbb`; nothing else reaches CSS, so a checked theme is safe to apply.
 */
export function validateTheme(value: unknown): ThemeValidation {
  const errors: string[] = [];
  if (!isObject(value)) return { ok: false, errors: ['A theme is a JSON object.'] };
  const { id, name, description, dark, highContrast, palette, character } = value;
  if (typeof id !== 'string' || !THEME_ID.test(id)) errors.push('id: lowercase letters, digits and dashes, starting with a letter (at most 32).');
  else if (themeById(id)) errors.push(`id: "${id}" is a built-in theme; choose another.`);
  if (typeof name !== 'string' || !name.trim() || name.length > 40) errors.push('name: 1 to 40 characters.');
  if (description !== undefined && (typeof description !== 'string' || description.length > 200)) errors.push('description: at most 200 characters.');
  if (typeof dark !== 'boolean') errors.push('dark: true or false.');
  if (typeof highContrast !== 'boolean') errors.push('highContrast: true or false.');

  const p: Partial<Record<keyof Palette, unknown>> = {};
  if (!isObject(palette)) errors.push('palette: missing.');
  else {
    for (const role of COLOR_ROLES) {
      const c = palette[role];
      if (typeof c === 'string' && isHex(c)) p[role] = c.toLowerCase();
      else errors.push(`palette.${role}: a #rrggbb colour.`);
    }
    for (const role of ALPHA_ROLES) {
      if (isUnit(palette[role])) p[role] = palette[role];
      else errors.push(`palette.${role}: a number from 0 to 1.`);
    }
    const series = palette.series;
    if (Array.isArray(series) && series.length === 6 && series.every((c) => typeof c === 'string' && isHex(c))) p.series = series.map((c: string) => c.toLowerCase());
    else errors.push('palette.series: six #rrggbb colours.');
  }

  let ch: Character | undefined;
  if (!isObject(character)) errors.push('character: missing.');
  else {
    const { corners, density, depth, glow, outline, backdrop, outlined } = character;
    if (!CORNERS.includes(corners as never)) errors.push(`character.corners: one of ${CORNERS.join(', ')}.`);
    if (!DENSITIES.includes(density as never)) errors.push(`character.density: one of ${DENSITIES.join(', ')}.`);
    if (!DEPTHS.includes(depth as never)) errors.push(`character.depth: one of ${DEPTHS.join(', ')}.`);
    if (!isUnit(glow)) errors.push('character.glow: a number from 0 to 1.');
    if (typeof outline !== 'number' || !(outline >= 1 && outline <= 3)) errors.push('character.outline: a number from 1 to 3.');
    if (typeof backdrop !== 'boolean') errors.push('character.backdrop: true or false.');
    if (typeof outlined !== 'boolean') errors.push('character.outlined: true or false.');
    ch = { corners, density, depth, glow, outline, backdrop, outlined } as Character;
  }

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    theme: {
      id: id as string,
      name: (name as string).trim(),
      description: typeof description === 'string' ? description : '',
      dark: dark as boolean,
      highContrast: highContrast as boolean,
      palette: p as unknown as Palette,
      character: ch!,
    },
  };
}
