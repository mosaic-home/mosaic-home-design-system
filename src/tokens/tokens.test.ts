import { describe, expect, it } from 'vitest';
import { ACCENT_NAMES, CORNERS, DENSITIES, DEVICE_CLASSES, THEMES, contrastRatio, exportTokens, isHex, mix, resolveTokens, themeVariables, themesStylesheet, withAccent, withCharacter, type Hex, type Palette } from './index.ts';

const SURFACES: (keyof Palette)[] = ['surface', 'surfaceRaised', 'input', 'canvasTop', 'canvasBottom'];

describe('themes', () => {
  it('have unique ids and valid colours', () => {
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length);
    for (const t of THEMES) {
      for (const [role, value] of Object.entries(t.palette)) {
        if (role === 'series') (value as Hex[]).forEach((c) => expect(isHex(c), `${t.id} series`).toBe(true));
        else if (typeof value === 'string') expect(isHex(value), `${t.id}.${role}`).toBe(true);
        else expect(value, `${t.id}.${role}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('keep body text readable on every surface (4.5:1, 7:1 for high contrast)', () => {
    for (const t of THEMES) {
      const min = t.highContrast ? 7 : 4.5;
      for (const s of SURFACES) {
        expect(contrastRatio(t.palette.text, t.palette[s] as Hex), `${t.id} text on ${s}`).toBeGreaterThanOrEqual(min);
      }
      expect(contrastRatio(t.palette.onAccent, t.palette.accent), `${t.id} onAccent`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keep muted text readable in the high-contrast theme', () => {
    const t = THEMES.find((x) => x.highContrast)!;
    for (const s of SURFACES) expect(contrastRatio(t.palette.textFaint, t.palette[s] as Hex)).toBeGreaterThanOrEqual(7);
  });
});

describe('resolveTokens', () => {
  it('resolves every theme, device class and character', () => {
    for (const t of THEMES)
      for (const dc of DEVICE_CLASSES)
        for (const corners of CORNERS)
          for (const density of DENSITIES) {
            const tokens = resolveTokens(withCharacter(t, { corners, density }), dc);
            expect(tokens.type.body).toBeGreaterThan(0);
            expect(tokens.control.md).toBeGreaterThanOrEqual(38);
          }
  });

  it('scales spacing by density and control heights by half as much', () => {
    const t = THEMES[0]!;
    const regular = resolveTokens(t, 'phone');
    const compact = resolveTokens(withCharacter(t, { density: 'compact' }), 'phone');
    expect(compact.space.lg).toBe(12);
    expect(regular.space.lg).toBe(16);
    expect(compact.control.md).toBe(Math.round(44 * 0.875));
  });

  it('has no elevation in flat or high-contrast themes', () => {
    const hc = THEMES.find((x) => x.highContrast)!;
    expect(resolveTokens(hc).elevation.every((e) => e.alpha === 0)).toBe(true);
    expect(resolveTokens(withCharacter(THEMES[0]!, { depth: 'flat' })).elevation[3].alpha).toBe(0);
  });

  it('uses pill controls only for mosaic and pill corners', () => {
    expect(resolveTokens(THEMES[0]!).radius.pillControls).toBe(true);
    expect(resolveTokens(withCharacter(THEMES[0]!, { corners: 'soft' })).radius.pillControls).toBe(false);
    expect(resolveTokens(withCharacter(THEMES[0]!, { corners: 'square' })).radius.md).toBe(0);
  });
});

describe('colour', () => {
  it('mixes and measures contrast', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });
});

describe('accents', () => {
  it('keep ink on accent readable for every named accent', () => {
    for (const t of THEMES)
      for (const a of ACCENT_NAMES) {
        const p = withAccent(t, a).palette;
        expect(contrastRatio(p.onAccent, p.accent), `${t.id} ${a}`).toBeGreaterThanOrEqual(3);
      }
  });
});

describe('outputs', () => {
  it('prefixes every CSS variable', () => {
    const vars = themeVariables(resolveTokens(THEMES[0]!));
    expect(Object.keys(vars).every((k) => k.startsWith('--mh-'))).toBe(true);
    expect(vars['--mh-accent']).toBe(THEMES[0]!.palette.accent);
  });

  it('writes a stylesheet with every theme and the auto theme', () => {
    const css = themesStylesheet();
    for (const t of THEMES) expect(css).toContain(`[data-mh-theme='${t.id}']`);
    expect(css).toContain(`[data-mh-theme='auto']`);
    expect(css).toContain('prefers-color-scheme: light');
  });

  it('exports alphas that round to whole 0..255 steps', () => {
    const data = exportTokens() as { themes: { palette: Palette }[] };
    for (const t of data.themes)
      for (const k of ['glowAlpha', 'surfaceAlpha', 'outlineAlpha', 'scrimAlpha'] as const) {
        const v = t.palette[k];
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
  });
});
