import '../../src/web/style.css';
import '../../src/icons.ts';
import './studio.css';
import { mdiFloorLamp, mdiThermostat, mdiUpload } from '@mdi/js';
import { ACCENT_NAMES, namedAccent } from '../../src/tokens/accents.ts';
import { isHex } from '../../src/tokens/color.ts';
import { customThemeStylesheet } from '../../src/tokens/css.ts';
import { PALETTE_ROLES, THEME_ID, checkContrast, deriveTheme, validateTheme, type ThemeSeed } from '../../src/tokens/custom.ts';
import { exportTokens } from '../../src/tokens/export.ts';
import { homeColorVariables } from '../../src/tokens/home.ts';
import { CORNERS, DENSITIES, DEVICE_CLASSES } from '../../src/tokens/resolve.ts';
import { THEMES, themeById } from '../../src/tokens/themes.ts';
import type { Character, Depth, DeviceClass, Hex, Palette, Series, Theme } from '../../src/tokens/types.ts';
import { buttonClass, createButton } from '../../src/web/actions/button.ts';
import { createTrend } from '../../src/web/charts/trend.ts';
import { createCheckbox } from '../../src/web/choice-inputs/checkbox.ts';
import { createChipGroup } from '../../src/web/choice-inputs/chip.ts';
import { createSegmentedControl, type SegmentedControlHandle } from '../../src/web/choice-inputs/segmentedControl.ts';
import { createSlider } from '../../src/web/choice-inputs/slider.ts';
import { createSwitch, type SwitchHandle } from '../../src/web/choice-inputs/switch.ts';
import { createCard } from '../../src/web/data-display/card.ts';
import { createList } from '../../src/web/data-display/list.ts';
import { createStatTile, createTile, createTileGrid } from '../../src/web/data-display/tiles.ts';
import { h } from '../../src/web/dom.ts';
import { createAlert } from '../../src/web/feedback/alert.ts';
import { createBadge } from '../../src/web/feedback/badge.ts';
import { createProgressBar } from '../../src/web/feedback/progress.ts';
import { createText } from '../../src/web/foundations/text.ts';
import { createControlCard } from '../../src/web/home/controlCard.ts';
import { createLightControl } from '../../src/web/home/lightControl.ts';
import { createThermostat } from '../../src/web/home/thermostat.ts';
import { createTextField } from '../../src/web/text-inputs/textField.ts';
import { applyTheme } from '../../src/web/theme.ts';

// The theme studio: start from a built-in theme, change a few colours and the character, check contrast, and
// export the result. Everything is worked out by `deriveTheme`; the page only keeps the seed.

const DEPTHS: readonly Depth[] = ['shadow', 'glow', 'flat'];
const STORAGE_KEY = 'mh-theme-studio';
const cap = (s: string): string => s[0]!.toUpperCase() + s.slice(1);

// The seed, from the link, the last visit or a default -----------------------------------------------------------

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const unit = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;

function slug(name: string): string {
  const s = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^[^a-z]+/, '')
    .slice(0, 24);
  const id = s || 'custom';
  return themeById(id) ? `${id}-custom` : id;
}

/** A seed from untrusted data (a link or storage): unknown or malformed fields are dropped. */
function cleanSeed(v: unknown): ThemeSeed | null {
  if (!isObject(v)) return null;
  const name = typeof v.name === 'string' && v.name.trim() ? v.name.trim().slice(0, 40) : 'My theme';
  const seed: ThemeSeed = { id: slug(name), name, base: typeof v.base === 'string' && themeById(v.base) ? v.base : 'midnight' };
  if (typeof v.description === 'string') seed.description = v.description.slice(0, 200);
  for (const k of ['canvas', 'ink', 'accent'] as const) if (typeof v[k] === 'string' && isHex(v[k])) seed[k] = v[k];
  if (isObject(v.character)) {
    const c = v.character;
    const ch: Partial<Character> = {};
    if (CORNERS.includes(c.corners as never)) ch.corners = c.corners as Character['corners'];
    if (DENSITIES.includes(c.density as never)) ch.density = c.density as Character['density'];
    if (DEPTHS.includes(c.depth as never)) ch.depth = c.depth as Depth;
    if (unit(c.glow)) ch.glow = c.glow;
    if (c.outline === 1 || c.outline === 2 || c.outline === 3) ch.outline = c.outline;
    if (typeof c.backdrop === 'boolean') ch.backdrop = c.backdrop;
    if (typeof c.outlined === 'boolean') ch.outlined = c.outlined;
    seed.character = ch;
  }
  if (isObject(v.palette)) {
    const p: Record<string, unknown> = {};
    for (const role of PALETTE_ROLES) {
      const x = v.palette[role];
      if (role === 'series') {
        if (Array.isArray(x) && x.length === 6 && x.every((c) => typeof c === 'string' && isHex(c))) p.series = x;
      } else if (role.endsWith('Alpha')) {
        if (unit(x)) p[role] = x;
      } else if (typeof x === 'string' && isHex(x)) p[role] = x;
    }
    seed.palette = p as Partial<Palette>;
  }
  return seed;
}

/** A seed that reproduces a complete theme: its colours become overrides, so nothing is re-derived. */
function seedOf(theme: Theme): ThemeSeed {
  const base = theme.highContrast ? 'contrast' : theme.dark ? 'midnight' : 'daylight';
  const p = theme.palette;
  return { id: theme.id, name: theme.name, description: theme.description, base, canvas: p.canvasTop, ink: p.text, accent: p.accent, character: { ...theme.character }, palette: { ...p } };
}

const toLink = (seed: ThemeSeed): string => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(seed)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function fromLink(text: string): unknown {
  try {
    const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
  } catch {
    return null;
  }
}

function loadSeed(): ThemeSeed {
  const hash = new URLSearchParams(location.hash.slice(1)).get('theme');
  if (hash) {
    const s = cleanSeed(fromLink(hash));
    if (s) return s;
  }
  try {
    const s = cleanSeed(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'));
    if (s) return s;
  } catch {
    // Storage can be unavailable; start fresh.
  }
  return { id: 'my-theme', name: 'My theme', base: 'midnight' };
}

let seed = loadSeed();
let device: DeviceClass = 'tablet';
let theme = deriveTheme(seed);
const listeners: (() => void)[] = [];

function update(patch: Partial<ThemeSeed>): void {
  seed = { ...seed, ...patch };
  seed.id = slug(seed.name);
  render();
}

function render(): void {
  theme = deriveTheme(seed);
  paint();
  for (const fn of listeners) fn();
  history.replaceState(null, '', `${location.pathname}${location.search}#theme=${toLink(seed)}`);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // Not remembered between visits; the link still holds the theme.
  }
}

// Regions: the studio's own controls in a built-in theme, the preview in the custom one. They never nest.

const chrome: HTMLElement[] = [];
const preview = h('main', { class: 'st-preview mh-canvas', 'aria-label': 'Preview', 'data-device': device });

function paint(): void {
  const own = theme.dark ? 'midnight' : 'daylight';
  for (const el of chrome) applyTheme(own, { deviceClass: 'phone' }, el);
  applyTheme(theme, { deviceClass: device }, preview);
  for (const [name, value] of Object.entries(homeColorVariables(theme))) preview.style.setProperty(name, value);
  const page = themeById(own)!.palette;
  document.body.style.background = page.canvasBottom;
  document.body.style.color = page.text;
}

// Controls -----------------------------------------------------------------------------------------------------

const section = (title: string, ...children: (HTMLElement | null)[]): HTMLElement =>
  h('section', { class: 'st-section' }, createText(title, { variant: 'eyebrow', tone: 'muted', as: 'h2' }), ...children.filter((c): c is HTMLElement => !!c));

function swatch(t: Theme): HTMLElement {
  const p = t.palette;
  return h(
    'span',
    { class: 'st-swatch', 'aria-hidden': 'true', style: `background: linear-gradient(160deg, ${p.canvasTop}, ${p.canvasBottom}); border-color: ${p.textFaint}` },
    h('span', { style: `background: ${p.surfaceRaised}` }),
    h('span', { style: `background: ${p.accent}` }),
  );
}

function baseSection(): HTMLElement {
  const buttons = THEMES.map((t) => {
    const b = h(
      'button',
      {
        type: 'button',
        class: 'st-base',
        'aria-pressed': String(seed.base === t.id),
        // A new start: the colours and overrides go, the name and character stay.
        onclick: () => update({ base: t.id, canvas: undefined, ink: undefined, accent: undefined, palette: undefined }),
      },
      swatch(t),
      h('span', {}, t.name),
    );
    return [t.id, b] as const;
  });
  listeners.push(() => {
    for (const [id, b] of buttons) b.setAttribute('aria-pressed', String(seed.base === id));
  });
  return section(
    'Start from',
    h('div', { class: 'st-bases', role: 'group', 'aria-label': 'Start from' }, ...buttons.map(([, b]) => b)),
    createText('Starting again keeps the name and character and resets every colour.', { variant: 'caption', tone: 'faint' }),
  );
}

function nameSection(): HTMLElement {
  const name = createTextField({ label: 'Name', value: seed.name, maxLength: 40, size: 'small', onInput: (v) => update({ name: v.trim() || 'My theme' }) });
  const description = createTextField({ label: 'Description', value: seed.description ?? '', maxLength: 200, size: 'small', placeholder: 'What it is for', onInput: (v) => update({ description: v.trim() || undefined }) });
  const id = createText('', { variant: 'mono', tone: 'muted' });
  listeners.push(() => {
    id.textContent = `data-mh-theme="${theme.id}"`;
    if (document.activeElement !== name.input && name.getValue().trim() !== seed.name) name.setValue(seed.name);
    if (document.activeElement !== description.input && description.getValue().trim() !== (seed.description ?? '')) description.setValue(seed.description ?? '');
  });
  return section('Name', name.el, description.el, id);
}

/** A colour well and a hex field that stay in step. */
function colorInput(label: string, get: () => Hex, set: (c: Hex) => void, extra?: HTMLElement): HTMLElement {
  const well = h('input', { type: 'color', class: 'st-well', 'aria-label': `${label} colour`, value: get() }) as HTMLInputElement;
  const hex = h('input', { type: 'text', class: 'st-hex', 'aria-label': `${label} hex`, spellcheck: 'false', maxlength: '7', value: get() }) as HTMLInputElement;
  well.addEventListener('input', () => set(well.value as Hex));
  hex.addEventListener('input', () => {
    const v = hex.value.trim().toLowerCase();
    const c = v.startsWith('#') ? v : `#${v}`;
    hex.toggleAttribute('aria-invalid', !isHex(c));
    if (isHex(c)) set(c);
  });
  hex.addEventListener('blur', () => {
    hex.value = get();
    hex.removeAttribute('aria-invalid');
  });
  listeners.push(() => {
    const c = get();
    if (document.activeElement !== well) well.value = c;
    if (document.activeElement !== hex) hex.value = c;
  });
  return h('div', { class: 'st-color' }, h('span', { class: 'st-color__label' }, label), well, hex, extra ?? h('span'));
}

function coloursSection(): HTMLElement {
  const accents = h('div', { class: 'st-accents', role: 'group', 'aria-label': 'Suggested accents' });
  const renderAccents = (): void => {
    accents.replaceChildren(
      ...ACCENT_NAMES.map((n) => {
        const c = namedAccent(n, theme);
        return h('button', { type: 'button', class: 'st-dot', title: cap(n), 'aria-label': `${cap(n)} accent`, 'aria-pressed': String(theme.palette.accent === c), style: `--_c: ${c}`, onclick: () => update({ accent: c }) });
      }),
    );
  };
  listeners.push(renderAccents);
  return section(
    'Colours',
    colorInput('Canvas', () => theme.palette.canvasTop, (c) => update({ canvas: c })),
    colorInput('Text', () => (seed.ink ?? theme.palette.text) as Hex, (c) => update({ ink: c })),
    colorInput('Accent', () => theme.palette.accent, (c) => update({ accent: c })),
    accents,
    createText('Surfaces, borders and the text steps are mixed from canvas and text. Text is nudged lighter or darker until it reads.', { variant: 'caption', tone: 'faint' }),
  );
}

function characterSection(): HTMLElement {
  const ch = (): Character => theme.character;
  const segment = (label: string, values: readonly string[], key: 'corners' | 'density' | 'depth'): SegmentedControlHandle =>
    createSegmentedControl({
      label,
      size: 'small',
      value: ch()[key],
      options: values.map((v) => ({ value: v, label: cap(v) })),
      onChange: (v) => update({ character: { ...seed.character, [key]: v } }),
    });
  const corners = segment('Corners', CORNERS, 'corners');
  const density = segment('Density', DENSITIES, 'density');
  const depth = segment('Depth', DEPTHS, 'depth');
  const outline = createSegmentedControl({
    label: 'Outline width',
    size: 'small',
    value: String(ch().outline),
    options: ['1', '2', '3'].map((v) => ({ value: v, label: `${v} px` })),
    onChange: (v) => update({ character: { ...seed.character, outline: Number(v) } }),
  });
  const glow = createSlider({
    label: 'Glow strength',
    min: 0,
    max: 100,
    step: 5,
    value: Math.round(ch().glow * 100),
    showValue: true,
    format: (v) => `${v}%`,
    onInput: (v) => update({ character: { ...seed.character, glow: v / 100 } }),
  });
  const toggle = (label: string, key: 'backdrop' | 'outlined', description: string): SwitchHandle =>
    createSwitch({ label, description, row: true, checked: ch()[key], onChange: (v) => update({ character: { ...seed.character, [key]: v } }) });
  const backdrop = toggle('Backdrop', 'backdrop', 'Canvas gradient and glow behind everything');
  const outlined = toggle('Outlined panels', 'outlined', 'Panels drawn as solid outlines');
  listeners.push(() => {
    for (const [seg, key] of [[corners, 'corners'], [density, 'density'], [depth, 'depth']] as const) seg.setValue(ch()[key]);
    outline.setValue(String(ch().outline));
    glow.setDisabled(ch().depth !== 'glow');
    if (document.activeElement !== glow.input) glow.setValue(Math.round(ch().glow * 100));
    backdrop.input.checked = ch().backdrop;
    outlined.input.checked = ch().outlined;
  });
  const field = (label: string, el: HTMLElement): HTMLElement => h('div', { class: 'st-field' }, createText(label, { variant: 'label', as: 'span' }), el);
  return section(
    'Character',
    field('Corners', corners.el),
    field('Density', density.el),
    field('Depth', depth.el),
    glow.el,
    field('Outline', outline.el),
    backdrop.el,
    outlined.el,
  );
}

function contrastSection(): HTMLElement {
  const summary = h('div', { class: 'st-summary' });
  const list = h('ul', { class: 'st-checks', role: 'list' });
  listeners.push(() => {
    const checks = checkContrast(theme);
    const failed = checks.filter((c) => !c.ok).length;
    summary.replaceChildren(
      createBadge({ label: failed ? `${failed} to fix` : 'All readable', tone: failed ? 'warning' : 'success' }).el,
      createText(failed ? 'Some pairs are below the minimum. You can still export.' : 'Every pair meets its minimum.', { variant: 'caption', tone: 'muted', as: 'span' }),
    );
    const p = theme.palette;
    list.replaceChildren(
      ...checks.map((c) =>
        h(
          'li',
          { class: `st-check${c.ok ? '' : ' st-check--fail'}` },
          h('span', { class: 'st-check__sample', 'aria-hidden': 'true', style: `background: ${p[c.bg] as Hex}; color: ${p[c.fg] as Hex}` }, 'Aa'),
          h('span', { class: 'st-check__label' }, c.label),
          h('span', { class: 'st-check__ratio' }, `${c.ratio.toFixed(1)}:1`, h('span', { class: 'mh-visually-hidden' }, c.ok ? ', passes' : `, needs ${c.min}:1`)),
          h('span', { class: 'st-check__min', 'aria-hidden': 'true' }, c.ok ? '✓' : `min ${c.min}`),
        ),
      ),
    );
  });
  return section('Contrast', summary, list);
}

const ROLE_LABELS: Partial<Record<keyof Palette, string>> = { canvasTop: 'Canvas top', canvasBottom: 'Canvas bottom', surfaceRaised: 'Surface raised', surfacePressed: 'Surface pressed', textMuted: 'Text muted', textFaint: 'Text faint', onAccent: 'On accent', accentLight: 'Accent light', accentDark: 'Accent dark', onStatus: 'On status' };
const roleLabel = (r: string): string => ROLE_LABELS[r as keyof Palette] ?? cap(r.replace(/([A-Z])/g, ' $1').toLowerCase());

function overrideRole(role: keyof Palette, value: unknown): void {
  update({ palette: { ...seed.palette, [role]: value } });
}
function resetRole(role: keyof Palette): void {
  update({ palette: Object.fromEntries(Object.entries(seed.palette ?? {}).filter(([k]) => k !== role)) as Partial<Palette> });
}

function rolesSection(): HTMLElement {
  const resetButton = (role: keyof Palette): HTMLElement => {
    const b = createButton({ label: 'Reset', variant: 'text', size: 'small', onClick: () => resetRole(role) });
    listeners.push(() => (b.el.hidden = !seed.palette || !(role in seed.palette)));
    return b.el;
  };
  const rows: HTMLElement[] = [];
  for (const role of PALETTE_ROLES) {
    if (role === 'series') {
      for (let i = 0; i < 6; i++)
        rows.push(
          colorInput(
            `Chart ${i + 1}`,
            () => theme.palette.series[i]!,
            (c) => {
              const s = [...theme.palette.series] as Hex[];
              s[i] = c;
              overrideRole('series', s as unknown as Series);
            },
            i === 0 ? resetButton('series') : undefined,
          ),
        );
    } else if (role.endsWith('Alpha')) {
      const slider = createSlider({
        label: roleLabel(role),
        min: 0,
        max: 100,
        value: Math.round((theme.palette[role] as number) * 100),
        showValue: true,
        format: (v) => `${v}%`,
        onInput: (v) => overrideRole(role, v / 100),
      });
      listeners.push(() => {
        if (document.activeElement !== slider.input) slider.setValue(Math.round((theme.palette[role] as number) * 100));
      });
      rows.push(h('div', { class: 'st-alpha' }, slider.el, resetButton(role)));
    } else {
      rows.push(colorInput(roleLabel(role), () => theme.palette[role] as Hex, (c) => overrideRole(role, c), resetButton(role)));
    }
  }
  const resetAll = createButton({ label: 'Reset every role', variant: 'secondary', size: 'small', onClick: () => update({ palette: undefined }) });
  const details = h(
    'details',
    { class: 'st-roles' },
    h('summary', {}, createText('Every colour role', { variant: 'label', as: 'span' }), h('span', { class: 'st-roles__count' })),
    createText('Each role starts from the derived value. A changed role is kept as you set it, even when the colours above change.', { variant: 'caption', tone: 'faint' }),
    ...rows,
    resetAll.el,
  );
  const count = details.querySelector<HTMLElement>('.st-roles__count')!;
  listeners.push(() => {
    const n = Object.keys(seed.palette ?? {}).length;
    count.textContent = n ? `${n} changed` : '';
  });
  return section('Advanced', details);
}

// Export --------------------------------------------------------------------------------------------------------

function download(name: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importFile(file: File, note: HTMLElement): void {
  void file.text().then((text) => {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      note.textContent = 'That file is not JSON.';
      return;
    }
    // A theme file, or a tokens file with custom themes after the built-in ones.
    const candidates = isObject(data) && Array.isArray(data.themes) ? data.themes.filter((t) => !(isObject(t) && typeof t.id === 'string' && themeById(t.id))) : [data];
    const results = candidates.map((c) => validateTheme(c));
    const good = results.find((r) => r.ok);
    if (good?.ok) {
      seed = seedOf(good.theme);
      render();
      note.textContent = `Loaded ${good.theme.name}.`;
    } else {
      const first = results.find((r) => !r.ok);
      note.textContent = first && !first.ok ? `Not a theme: ${first.errors.slice(0, 3).join(' ')}` : 'No custom theme in that file.';
    }
  });
}

function exportSection(): HTMLElement {
  const note = h('p', { class: 'st-note', 'aria-live': 'polite' });
  const say = (text: string): void => {
    note.textContent = text;
  };
  const json = createButton({ label: 'Theme file', icon: 'download', variant: 'primary', size: 'small', onClick: () => download(`${theme.id}.theme.json`, `${JSON.stringify(theme, null, 2)}\n`, 'application/json') });
  const css = createButton({ label: 'CSS', icon: 'download', variant: 'secondary', size: 'small', onClick: () => download(`${theme.id}.css`, customThemeStylesheet(theme), 'text/css') });
  const tokens = createButton({
    label: 'Tokens file',
    icon: 'download',
    variant: 'secondary',
    size: 'small',
    onClick: () => download('mosaic-home.tokens.json', `${JSON.stringify(exportTokens([...THEMES, theme]), null, 2)}\n`, 'application/json'),
  });
  const link = createButton({
    label: 'Copy link',
    icon: 'copy',
    variant: 'tonal',
    size: 'small',
    onClick: () => void navigator.clipboard?.writeText(location.href).then(() => say('Link copied. It holds the whole theme.')),
  });
  const file = h('input', { type: 'file', accept: '.json,application/json', class: 'mh-visually-hidden', tabindex: '-1', 'aria-hidden': 'true' }) as HTMLInputElement;
  file.addEventListener('change', () => {
    if (file.files?.[0]) importFile(file.files[0], note);
    file.value = '';
  });
  const open = createButton({ label: 'Open a theme file', icon: mdiUpload, variant: 'text', size: 'small', onClick: () => file.click() });
  const code = h('pre', { class: 'st-code' });
  listeners.push(() => {
    code.textContent = `import { validateTheme } from '@mosaic-home/design-system/tokens';
import { applyTheme } from '@mosaic-home/design-system/web';

const result = validateTheme(await (await fetch('${theme.id}.theme.json')).json());
if (result.ok) applyTheme(result.theme, { deviceClass: 'tablet' });

<!-- or, with the CSS file after style.css -->
<html data-mh-theme="${theme.id}" data-mh-device="tablet">`;
  });
  return section(
    'Export',
    h('div', { class: 'st-actions' }, json.el, css.el, tokens.el, link.el),
    createText('The theme file loads with applyTheme. The CSS file goes after style.css. The tokens file is the built-in themes plus yours, in the format the LVGL kit imports.', { variant: 'caption', tone: 'faint' }),
    code,
    h('div', { class: 'st-actions' }, open.el, file),
    note,
  );
}

// Preview -------------------------------------------------------------------------------------------------------

const TEMPERATURE = [19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.6, 21.4, 21.9, 22.3, 22.1, 21.7, 21.5];

function thermostatCard(compact: boolean): HTMLElement {
  const card = createControlCard({ title: 'Living room', icon: mdiThermostat, state: 'Heating to 21°C', active: true, tone: 'heat' });
  const t = createThermostat({
    label: 'Living room thermostat',
    compact,
    current: 19.5,
    target: 21,
    mode: 'heat',
    action: 'heating',
    modes: compact ? undefined : [{ value: 'off', label: 'Off' }, { value: 'heat', label: 'Heat' }, { value: 'cool', label: 'Cool' }],
    onTarget: (value) => typeof value === 'number' && (t.update({ target: value }), card.update({ state: `Heating to ${value}°C` })),
    onMode: (mode) => t.update({ mode, action: mode === 'off' ? 'off' : 'idle' }),
  });
  card.update({ body: t.el });
  return card.el;
}

function lampCard(): HTMLElement {
  const card = createControlCard({ title: 'Reading lamp', icon: mdiFloorLamp, state: 'On · 70%', active: true, tone: 'warm' });
  const light = createLightControl({
    label: 'Reading lamp',
    on: true,
    brightness: 70,
    onToggle: (on) => (light.update({ on, brightness: on ? 70 : null }), card.update({ active: on, state: on ? 'On · 70%' : 'Off' })),
    onBrightness: (b) => (light.update({ brightness: b }), card.update({ state: `On · ${b}%` })),
  });
  card.update({ body: light.el });
  return card.el;
}

const tiles = (): HTMLElement =>
  createTileGrid(
    [
      createTile({ icon: 'lightbulb', iconOn: 'lightbulb-on', label: 'Kitchen', state: 'On', on: true }).el,
      createTile({ icon: 'lightbulb', iconOn: 'lightbulb-on', label: 'Hallway', state: 'Off', on: false }).el,
      createStatTile({ label: 'Inside', icon: 'thermometer', value: '21.5', unit: '°C', trend: 'up' }).el,
      createTile({ icon: 'fan', label: 'Bedroom fan', state: 'Speed 2', on: true }).el,
    ],
    { label: 'Quick toggles' },
  ).el;

function controlsCard(): HTMLElement {
  return createCard({
    title: 'Controls',
    icon: 'settings',
    headerAction: createBadge({ label: 'New', tone: 'accent' }).el,
    body: [
      h(
        'div',
        { class: 'st-row' },
        createButton({ label: 'Primary', icon: 'power' }).el,
        createButton({ label: 'Secondary', variant: 'secondary' }).el,
        createButton({ label: 'Tonal', variant: 'tonal' }).el,
        createButton({ label: 'Text', variant: 'text' }).el,
        createButton({ label: 'Delete', variant: 'danger' }).el,
      ),
      createSegmentedControl({ label: 'Mode', value: 'auto', options: [{ value: 'off', label: 'Off' }, { value: 'auto', label: 'Auto' }, { value: 'on', label: 'On' }] }).el,
      createTextField({ label: 'Room name', value: 'Living room', helper: 'Shown on every screen' }).el,
      createSlider({ label: 'Volume', value: 40, showValue: true, format: (v) => `${v}%` }).el,
      h('div', { class: 'st-row' }, createSwitch({ label: 'Night mode', checked: true }).el, createCheckbox({ label: 'Remind me', checked: true }).el),
      createChipGroup({
        label: 'Rooms',
        selection: 'multiple',
        values: ['kitchen'],
        chips: [
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'office', label: 'Office' },
          { value: 'garden', label: 'Garden' },
        ],
      }).el,
    ],
  }).el;
}

function statusCard(): HTMLElement {
  return createCard({
    title: 'Status',
    icon: 'info',
    body: [
      createAlert({ tone: 'info', message: 'Software update ready tonight.' }).el,
      createAlert({ tone: 'success', message: 'All doors locked.' }).el,
      createAlert({ tone: 'warning', message: 'Garden sensor battery at 15%.' }).el,
      createAlert({ tone: 'danger', message: 'Leak detected under the sink.' }).el,
      createProgressBar({ label: 'Washing machine', value: 64, showLabel: true, showValue: true }).el,
    ],
  }).el;
}

function listCard(): HTMLElement {
  return createCard({
    title: 'Living room',
    icon: 'thermometer',
    body: [
      createTrend({ name: 'Temperature', value: 21.5, unit: '°C', values: TEMPERATURE, format: (v) => v.toFixed(1) }).el,
      createList({
        dividers: true,
        items: [
          { title: 'Morning scene', subtitle: 'Weekdays at 07:00', icon: 'weather', chevron: true },
          { title: 'Away mode', subtitle: 'Off', icon: 'home', chevron: true },
          { title: 'Remove device', icon: 'delete', tone: 'danger' },
        ],
      }).el,
    ],
  }).el;
}

function previewContent(): HTMLElement {
  const hello = h('div', { class: 'st-hello' }, createText('Good evening', { variant: 'headline', as: 'h2' }), createText('3 lights on · doors locked · 21.5° inside', { tone: 'muted' }));
  if (device === 'wearable') return h('div', { class: 'st-board st-board--wearable' }, thermostatCard(true), tiles());
  return h('div', { class: `st-board st-board--${device}` }, hello, thermostatCard(device === 'phone'), lampCard(), h('div', { class: 'st-board__tiles' }, tiles()), controlsCard(), statusCard(), listCard());
}

function previewBar(): HTMLElement {
  const seg = createSegmentedControl({
    label: 'Preview device',
    size: 'small',
    value: device,
    options: DEVICE_CLASSES.map((d) => ({ value: d, label: d === 'tv' ? 'TV' : cap(d) })),
    onChange: (v) => {
      device = v as DeviceClass;
      preview.dataset.device = device;
      preview.replaceChildren(previewContent());
      paint();
    },
  });
  return h('div', { class: 'st-preview-bar' }, createText('Preview', { variant: 'label', as: 'span' }), seg.el);
}

// The page --------------------------------------------------------------------------------------------------------

const link = (href: string, label: string): HTMLAnchorElement => h('a', { href, class: buttonClass('text', 'small') }, h('span', { class: 'mh-button__label' }, label));

const panel = h(
  'aside',
  { class: 'st-panel', 'aria-label': 'Theme settings' },
  h(
    'header',
    { class: 'st-head' },
    h('div', {}, createText('Theme studio', { variant: 'title', as: 'h1' }), createText('Make a theme of your own', { variant: 'caption', tone: 'muted' })),
    h('nav', { class: 'st-links', 'aria-label': 'Site' }, link('index.html', 'Showcase'), link('components.html', 'Components')),
  ),
  baseSection(),
  nameSection(),
  coloursSection(),
  characterSection(),
  contrastSection(),
  rolesSection(),
  exportSection(),
);
const bar = previewBar();
preview.append(previewContent());
chrome.push(panel, bar);

document.body.append(h('div', { class: 'st-app' }, panel, h('div', { class: 'st-stage' }, bar, preview)));
render();
if (!THEME_ID.test(theme.id)) update({ name: 'My theme' });
