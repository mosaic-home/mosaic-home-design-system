import { describe, expect, it } from 'vitest';
import { THEMES, checkContrast, customThemeStylesheet, deriveTheme, exportTokens, isHex, resolveTokens, validateTheme, type Hex, type Theme } from './index.ts';

const roundTrip = (t: Theme): unknown => JSON.parse(JSON.stringify(t));

describe('deriveTheme', () => {
  it('starts from the base theme and keeps its character', () => {
    const t = deriveTheme({ id: 'harbour', name: 'Harbour', base: 'midnight' });
    expect(t.dark).toBe(true);
    expect(t.highContrast).toBe(false);
    expect(t.character).toEqual(THEMES[0]!.character);
    expect(t.palette.accent).toBe(THEMES[0]!.palette.accent);
  });

  it('takes light or dark from whichever of canvas and ink is lighter', () => {
    expect(deriveTheme({ id: 'a', name: 'A', base: 'midnight', canvas: '#f4efe6', ink: '#1d1a16' }).dark).toBe(false);
    expect(deriveTheme({ id: 'b', name: 'B', base: 'daylight', canvas: '#101418', ink: '#e8eef2' }).dark).toBe(true);
  });

  it('keeps text, muted text and ink on the accent readable for awkward choices', () => {
    const seeds: [Hex, Hex, Hex][] = [
      ['#202833', '#5a6270', '#ffee00'],
      ['#dfe4ea', '#9aa4b0', '#88ccff'],
      ['#3a2a1a', '#c09070', '#ff6a00'],
      ['#ffffff', '#cccccc', '#0040ff'],
    ];
    for (const base of THEMES)
      for (const [canvas, ink, accent] of seeds) {
        const t = deriveTheme({ id: 'x', name: 'X', base: base.id, canvas, ink, accent });
        const failed = checkContrast(t).filter((c) => !c.ok && c.fg !== 'accent' && c.fg !== 'focus');
        expect(failed.map((c) => `${base.id} ${canvas}: ${c.label} ${c.ratio.toFixed(2)}`)).toEqual([]);
      }
  });

  it('applies palette overrides as given, after deriving', () => {
    const t = deriveTheme({ id: 'x', name: 'X', base: 'daylight', palette: { danger: '#aa0000', textMuted: '#eeeeee' } });
    expect(t.palette.danger).toBe('#aa0000');
    expect(t.palette.textMuted).toBe('#eeeeee');
    expect(checkContrast(t).find((c) => c.fg === 'textMuted')!.ok).toBe(false);
  });

  it('produces themes that resolve and pass validation', () => {
    const t = deriveTheme({ id: 'reef', name: 'Reef', base: 'nightstand', accent: '#4fd1c5', character: { corners: 'square', density: 'compact' } });
    expect(resolveTokens(t, 'tv').space.md).toBe(Math.round(14 * 0.75));
    const v = validateTheme(roundTrip(t));
    expect(v.ok && v.theme).toEqual({ ...t, description: t.description });
  });
});

describe('checkContrast', () => {
  it('passes every built-in theme', () => {
    for (const t of THEMES) expect(checkContrast(t).filter((c) => !c.ok).map((c) => `${t.id}: ${c.label}`)).toEqual([]);
  });
});

describe('validateTheme', () => {
  const good = (): Record<string, unknown> => roundTrip({ ...deriveTheme({ id: 'pine', name: 'Pine', base: 'midnight' }) }) as Record<string, unknown>;

  it('rejects built-in ids, bad ids and anything that is not a theme', () => {
    expect(validateTheme(null).ok).toBe(false);
    expect(validateTheme([]).ok).toBe(false);
    expect(validateTheme({ ...good(), id: 'midnight' }).ok).toBe(false);
    expect(validateTheme({ ...good(), id: "x'] { } body" }).ok).toBe(false);
  });

  it('rejects colours that are not #rrggbb, so nothing else reaches CSS', () => {
    const t = good();
    (t.palette as Record<string, unknown>).accent = 'red; background: url(x)';
    const v = validateTheme(t);
    expect(v.ok).toBe(false);
    expect(!v.ok && v.errors).toContain('palette.accent: a #rrggbb colour.');
  });

  it('checks the character and drops unknown fields', () => {
    const t = { ...good(), extra: 1 } as Record<string, unknown>;
    (t.character as Record<string, unknown>).corners = 'wobbly';
    expect(validateTheme(t).ok).toBe(false);
    const v = validateTheme({ ...good(), extra: 1 });
    expect(v.ok && 'extra' in v.theme).toBe(false);
    expect(v.ok && Object.values(v.theme.palette).flat().filter((c) => typeof c === 'string').every((c) => isHex(c as string))).toBe(true);
  });
});

describe('customThemeStylesheet', () => {
  it('scopes every block to the theme, including the device classes', () => {
    const css = customThemeStylesheet(deriveTheme({ id: 'pine', name: 'Pine */ x', base: 'midnight', character: { density: 'comfortable' } }));
    expect(css).toContain("[data-mh-theme='pine'] {");
    expect(css).toContain("[data-mh-theme='pine'][data-mh-device='tv'] {");
    expect(css).not.toContain("\n[data-mh-device='tv']");
    expect(css).toContain('--mh-space-md: 15px;');
    expect(css.indexOf('*/')).toBe(css.lastIndexOf('*/'));
  });

  it('refuses an id that would break out of the selector', () => {
    expect(() => customThemeStylesheet({ ...deriveTheme({ id: 'ok', name: 'Ok', base: 'midnight' }), id: "a'],b" })).toThrow();
  });

  it('exports alongside the built-in themes in the tokens format', () => {
    const data = exportTokens([...THEMES, deriveTheme({ id: 'pine', name: 'Pine', base: 'daylight' })]) as { themes: { id: string; home: object }[] };
    expect(data.themes.map((t) => t.id)).toEqual([...THEMES.map((t) => t.id), 'pine']);
    expect(data.themes.at(-1)!.home).toBeTruthy();
  });
});
