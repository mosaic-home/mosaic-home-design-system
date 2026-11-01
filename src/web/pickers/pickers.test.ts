import { afterEach, describe, expect, it } from 'vitest';
import { createCalendar } from './calendar.ts';
import { hsvToRgb, parseHex, rgbToHsv, toHex, defaultSwatches } from './color.ts';
import { createColorPicker } from './colorPicker.ts';
import { createDatePicker } from './datePicker.ts';
import { createDateRangePicker, rangeLength } from './dateRangePicker.ts';
import { addDays, addMonths, firstDayOfWeek, formatDate, isIsoDate, monthGrid, weekdayNames, weekdayOf } from './dates.ts';
import { createDateTimeField, dateTimeIcon } from './dateTimeField.ts';
import { createFileDropZone, fileAccepted, formatFileSize } from './fileDropZone.ts';
import { createGradientEditor, gradientColorAt, gradientCss } from './gradientEditor.ts';
import { builtInIcons, createIconPicker, iconLabel } from './iconPicker.ts';

afterEach(() => document.body.replaceChildren());

const key = (el: Element, k: string, init: KeyboardEventInit = {}): void => {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
};
const day = (root: ParentNode, iso: string): HTMLButtonElement => root.querySelector<HTMLButtonElement>(`.mh-calendar__day[data-date="${iso}"]`)!;

describe('dates', () => {
  it('does plain-date arithmetic without time zones', () => {
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2026-03-15', -14)).toBe('2025-01-15');
    expect(weekdayOf('2026-10-16')).toBe(5);
  });

  it('builds six-week month grids from the week start', () => {
    const mon = monthGrid(2026, 10, 1);
    expect(mon).toHaveLength(42);
    expect(mon[0]).toBe('2026-09-28');
    expect(weekdayOf(mon[0]!)).toBe(1);
    expect(monthGrid(2026, 10, 0)[0]).toBe('2026-09-27');
  });

  it('takes names and the week start from Intl', () => {
    expect(weekdayNames('en-GB', 1, 'long')[0]).toBe('Monday');
    expect(weekdayNames('en-US', 0, 'short')[0]).toBe('Sun');
    expect(weekdayNames('de-DE', 1, 'long')[0]).toBe('Montag');
    expect([0, 1, 6]).toContain(firstDayOfWeek('en-US'));
    expect(firstDayOfWeek('not a locale!')).toBe(1);
    expect(formatDate('2026-10-16', 'en-GB', { day: 'numeric', month: 'long' })).toBe('16 October');
  });
});

describe('calendar', () => {
  it('renders a labelled grid with weekday headers and today', () => {
    const c = createCalendar({ value: '2026-10-16', today: '2026-10-14', locale: 'en-GB', weekStartsOn: 1 });
    document.body.append(c.el);
    expect(c.el.className).toBe('mh-calendar');
    const grid = c.el.querySelector('table[role="grid"]')!;
    expect(document.getElementById(grid.getAttribute('aria-labelledby')!)!.textContent).toBe('October 2026');
    expect(c.el.querySelector('th .mh-visually-hidden')!.textContent).toBe('Monday');
    expect(c.el.querySelectorAll('.mh-calendar__day')).toHaveLength(42);
    const sel = day(c.el, '2026-10-16');
    expect(sel.classList.contains('is-selected')).toBe(true);
    expect(sel.tabIndex).toBe(0);
    expect(sel.getAttribute('aria-label')).toMatch(/^Friday,? 16 October 2026$/);
    expect(sel.parentElement!.getAttribute('aria-selected')).toBe('true');
    expect(day(c.el, '2026-10-14').getAttribute('aria-current')).toBe('date');
    expect(day(c.el, '2026-09-28').classList.contains('is-outside')).toBe(true);
  });

  it('moves focus with the keyboard and changes month at the edges', () => {
    const picked: string[] = [];
    const c = createCalendar({ value: '2026-10-31', locale: 'en-GB', weekStartsOn: 1, onSelect: (d) => picked.push(d) });
    document.body.append(c.el);
    c.focus();
    key(document.activeElement!, 'ArrowRight');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-11-01');
    expect(c.el.querySelector('.mh-calendar__title')!.textContent).toBe('November 2026');
    key(document.activeElement!, 'ArrowUp');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-25');
    key(document.activeElement!, 'Home');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-19');
    key(document.activeElement!, 'End');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-25');
    key(document.activeElement!, 'PageDown', { shiftKey: true });
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2027-10-25');
    (document.activeElement as HTMLButtonElement).click();
    expect(picked).toEqual(['2027-10-25']);
    expect(c.getValue()).toBe('2027-10-25');
  });

  it('respects min, max and disabled dates', () => {
    const picked: string[] = [];
    const c = createCalendar({ month: '2026-10-01', min: '2026-10-05', max: '2026-10-20', isDateDisabled: (d) => weekdayOf(d) === 0, onSelect: (d) => picked.push(d) });
    document.body.append(c.el);
    day(c.el, '2026-10-04').click();
    day(c.el, '2026-10-11').click();
    day(c.el, '2026-10-12').click();
    expect(picked).toEqual(['2026-10-12']);
    expect(day(c.el, '2026-10-11').getAttribute('aria-disabled')).toBe('true');
    const [prev, next] = c.el.querySelectorAll<HTMLButtonElement>('.mh-calendar__nav');
    expect(prev!.disabled).toBe(true);
    expect(next!.disabled).toBe(true);
  });

  it('picks a range in either order and previews it', () => {
    const ranges: unknown[] = [];
    const c = createCalendar({ mode: 'range', month: '2026-10-01', months: 2, onRangeChange: (r) => ranges.push(r) });
    document.body.append(c.el);
    expect(c.el.classList.contains('mh-calendar--multi')).toBe(true);
    expect(c.el.querySelectorAll('.mh-calendar__grid')).toHaveLength(2);
    day(c.el, '2026-10-20').click();
    day(c.el, '2026-10-14').dispatchEvent(new Event('pointerover', { bubbles: true }));
    expect(day(c.el, '2026-10-16').classList.contains('is-preview')).toBe(true);
    day(c.el, '2026-10-14').click();
    expect(ranges).toEqual([
      { start: '2026-10-20', end: null },
      { start: '2026-10-14', end: '2026-10-20' },
    ]);
    expect(day(c.el, '2026-10-14').classList.contains('is-range-start')).toBe(true);
    expect(day(c.el, '2026-10-17').classList.contains('is-in-range')).toBe(true);
    expect(day(c.el, '2026-10-20').classList.contains('is-range-end')).toBe(true);
    expect(day(c.el, '2026-11-02')).not.toBeNull();
  });
});

describe('date picker', () => {
  it('opens a calendar popover, picks a date and returns focus', () => {
    const changes: (string | null)[] = [];
    const p = createDatePicker({ label: 'Holiday starts', value: '2026-10-16', locale: 'en-GB', name: 'start', clearable: true, onChange: (v) => changes.push(v) });
    document.body.append(p.el);
    expect(p.el.className).toBe('mh-field');
    expect(p.trigger.className).toBe('mh-input mh-picker-trigger');
    expect(p.trigger.textContent).toContain('16 Oct 2026');
    const [labelId, valueId] = p.trigger.getAttribute('aria-labelledby')!.split(' ');
    expect(document.getElementById(labelId!)!.textContent).toBe('Holiday starts');
    expect(document.getElementById(valueId!)!.textContent).toBe('16 Oct 2026');
    expect(p.trigger.getAttribute('aria-haspopup')).toBe('dialog');

    p.trigger.click();
    expect(p.trigger.getAttribute('aria-expanded')).toBe('true');
    const pop = document.querySelector('.mh-picker-popover[role="dialog"]')!;
    expect(pop).not.toBeNull();
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-16');
    key(document.activeElement!, 'ArrowRight');
    (document.activeElement as HTMLButtonElement).click();
    expect(changes).toEqual(['2026-10-17']);
    expect(document.querySelector('.mh-picker-popover')).toBeNull();
    expect(document.activeElement).toBe(p.trigger);
    expect(p.el.querySelector<HTMLInputElement>('input[type="hidden"]')!.value).toBe('2026-10-17');

    p.open();
    document.querySelector<HTMLButtonElement>('.mh-picker-popover__clear')!.click();
    expect(p.getValue()).toBeNull();
    expect(p.trigger.classList.contains('is-empty')).toBe(true);
    expect(p.trigger.textContent).toContain('Choose a date');
  });

  it('closes on Escape and outside presses', () => {
    const p = createDatePicker({ ariaLabel: 'Date' });
    document.body.append(p.el);
    p.open();
    key(document.activeElement!, 'Escape');
    expect(p.popover.isOpen()).toBe(false);
    expect(document.activeElement).toBe(p.trigger);
    p.open();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(p.popover.isOpen()).toBe(false);
    p.setDisabled(true);
    expect(p.trigger.disabled).toBe(true);
  });
});

describe('date range picker', () => {
  it('picks a start then an end and offers presets', () => {
    const changes: unknown[] = [];
    const p = createDateRangePicker({
      label: 'Stay',
      locale: 'en-GB',
      months: 1,
      presets: [{ label: 'First week', range: { start: '2026-10-01', end: '2026-10-07' } }],
      value: { start: '2026-10-12', end: '2026-10-14' },
      onChange: (v) => changes.push(v),
    });
    document.body.append(p.el);
    expect(p.trigger.textContent).toMatch(/12.+14 Oct 2026/);
    p.open();
    day(document, '2026-10-20').click();
    expect(p.popover.isOpen()).toBe(true);
    expect(document.querySelector('.mh-picker-popover__status')!.textContent).toContain('Now pick the end date');
    day(document, '2026-10-22').click();
    expect(p.popover.isOpen()).toBe(false);
    expect(changes).toEqual([{ start: '2026-10-20', end: '2026-10-22' }]);
    p.open();
    document.querySelector<HTMLButtonElement>('.mh-picker-popover__preset')!.click();
    expect(p.getValue()).toEqual({ start: '2026-10-01', end: '2026-10-07' });
    expect(rangeLength({ start: '2026-10-01', end: '2026-10-07' })).toBe(7);
  });
});

describe('date & time field', () => {
  it('wraps the platform input in a field with a picker button', () => {
    const values: string[] = [];
    const f = createDateTimeField({ label: 'Wake up', type: 'time', value: '07:30', step: 60, onChange: (v) => values.push(v) });
    expect(f.el.className).toBe('mh-field');
    expect(f.input.type).toBe('time');
    expect(f.input.value).toBe('07:30');
    expect(f.el.querySelector('label')!.htmlFor).toBe(f.input.id);
    const btn = f.el.querySelector<HTMLButtonElement>('.mh-datetime__button')!;
    expect(btn.getAttribute('aria-label')).toBe('Open time picker');
    expect(btn.tabIndex).toBe(-1);
    f.input.value = '08:00';
    f.input.dispatchEvent(new Event('change'));
    expect(values).toEqual(['08:00']);
    f.setDisabled(true);
    expect(btn.disabled).toBe(true);
    expect(createDateTimeField({ ariaLabel: 'When', icon: false }).el.querySelector('button')).toBeNull();
    expect(dateTimeIcon('date')).not.toBe(dateTimeIcon('time'));
  });
});

describe('colour', () => {
  it('converts between hex, RGB and HSV', () => {
    expect(parseHex('#f80')).toEqual({ r: 255, g: 136, b: 0, a: 1 });
    expect(parseHex('11223380')!.a).toBeCloseTo(0.502, 2);
    expect(parseHex('#12345')).toBeNull();
    expect(toHex({ r: 255, g: 136, b: 0, a: 0.5 }, true)).toBe('#ff880080');
    expect(toHex({ r: 255, g: 136, b: 0, a: 0.5 })).toBe('#ff8800');
    for (const hex of ['#ff0000', '#00ff00', '#3366cc', '#808080', '#000000', '#ffffff']) expect(toHex(hsvToRgb(rgbToHsv(parseHex(hex)!)))).toBe(hex);
    expect(rgbToHsv(parseHex('#00ffff')!).h).toBe(180);
    expect(defaultSwatches()).toHaveLength(15);
  });

  it('colour picker edits by keyboard, hex and swatch', () => {
    const changes: string[] = [];
    const p = createColorPicker({ value: '#ff0000', swatches: ['#00ff00', { color: '#0000ff', label: 'Blue' }], onChange: (v) => changes.push(v) });
    document.body.append(p.el);
    const area = p.el.querySelector<HTMLElement>('.mh-color-picker__area')!;
    expect(area.getAttribute('role')).toBe('slider');
    expect(area.getAttribute('aria-valuetext')).toBe('Saturation 100%, brightness 100%');
    key(area, 'ArrowDown', { shiftKey: true });
    expect(p.getValue()).toBe('#e60000');
    const hex = p.el.querySelector<HTMLInputElement>('.mh-color-picker__hex')!;
    expect(hex.value).toBe('e60000');
    hex.value = 'nope';
    hex.dispatchEvent(new Event('change'));
    expect(hex.getAttribute('aria-invalid')).toBe('true');
    hex.value = '336699';
    hex.dispatchEvent(new Event('change'));
    expect(p.getValue()).toBe('#336699');
    const blue = p.el.querySelector<HTMLButtonElement>('[aria-label="Blue"]')!;
    blue.click();
    expect(blue.getAttribute('aria-pressed')).toBe('true');
    expect(changes).toEqual(['#e60000', '#336699', '#0000ff']);
    // Hue survives a trip through black.
    p.setValue('#000000');
    p.setValue('#000000');
    expect(p.el.querySelector<HTMLInputElement>('.mh-color-picker__hue')!.value).toBe('240');
    expect(p.el.querySelector('.mh-color-picker__alpha')).toBeNull();
  });

  it('colour picker carries alpha when asked', () => {
    const p = createColorPicker({ value: '#33669980', alpha: true, swatches: false });
    const alpha = p.el.querySelector<HTMLInputElement>('.mh-color-picker__alpha')!;
    expect(alpha.value).toBe('50');
    alpha.value = '100';
    alpha.dispatchEvent(new Event('input'));
    expect(p.getValue()).toBe('#336699');
    expect(p.el.querySelector('.mh-color-picker__swatches')).toBeNull();
  });
});

describe('gradient editor', () => {
  it('interpolates and writes CSS', () => {
    const stops = [
      { offset: 0, color: '#000000' },
      { offset: 100, color: '#ffffff', opacity: 0 },
    ];
    expect(gradientColorAt(stops, 50)).toEqual({ color: '#808080', opacity: 0.5 });
    expect(gradientCss(stops, 45)).toBe('linear-gradient(45deg, rgb(0 0 0 / 1) 0%, rgb(255 255 255 / 0) 100%)');
  });

  it('moves, adds and removes stops', () => {
    const changes: number[] = [];
    const g = createGradientEditor({ stops: [{ offset: 0, color: '#ff0000' }, { offset: 100, color: '#0000ff' }], onChange: (s) => changes.push(s.length) });
    document.body.append(g.el);
    const handles = (): HTMLElement[] => [...g.el.querySelectorAll<HTMLElement>('.mh-gradient-editor__stop')];
    expect(handles()).toHaveLength(2);
    expect(handles()[0]!.getAttribute('role')).toBe('slider');
    expect(handles()[0]!.classList.contains('is-selected')).toBe(true);
    const remove = g.el.querySelector<HTMLButtonElement>('.mh-gradient-editor__remove')!;
    expect(remove.disabled).toBe(true);
    key(handles()[0]!, 'ArrowRight', { shiftKey: true });
    expect(g.getStops()[0]!.offset).toBe(10);
    g.el.querySelector<HTMLButtonElement>('.mh-gradient-editor__add')!.click();
    expect(g.getStops()).toHaveLength(3);
    expect(g.getStops()[1]!.offset).toBe(55);
    expect(remove.disabled).toBe(false);
    // The new stop is selected; the picker edits its colour.
    const hex = g.el.querySelector<HTMLInputElement>('.mh-color-picker__hex')!;
    hex.value = '00ff00';
    hex.dispatchEvent(new Event('change'));
    expect(g.getStops()[1]!.color).toBe('#00ff00');
    key(document.activeElement!, 'Delete');
    expect(g.getStops()).toHaveLength(2);
    expect(changes.at(-1)).toBe(2);
    expect(g.css()).toContain('linear-gradient(90deg');
  });
});

describe('icon picker', () => {
  it('defaults to the built-in icons and picks with the keyboard', () => {
    const picked: (string | null)[] = [];
    const p = createIconPicker({ value: 'home', onChange: (n) => picked.push(n) });
    document.body.append(p.el);
    expect(builtInIcons().length).toBeGreaterThan(20);
    const listbox = p.listbox;
    expect(listbox.getAttribute('role')).toBe('listbox');
    expect(listbox.querySelectorAll('[role="option"]')).toHaveLength(builtInIcons().length);
    const home = listbox.querySelector<HTMLElement>('[data-name="home"]')!;
    expect(home.getAttribute('aria-selected')).toBe('true');
    expect(home.tabIndex).toBe(0);
    expect(home.textContent).toBe('Home');
    home.focus();
    key(home, 'ArrowRight');
    const next = document.activeElement as HTMLElement;
    expect(next).not.toBe(home);
    key(next, 'Enter');
    expect(picked).toEqual([next.dataset.name]);
    expect(iconLabel('arrow-left')).toBe('Arrow left');
  });

  it('filters by search and accepts its own icons', () => {
    const p = createIconPicker({ icons: ['lightbulb', { name: 'sofa', path: 'M0 0h24v24H0z', label: 'Sofa', keywords: ['couch'] }], search: true, allowNone: true });
    document.body.append(p.el);
    const opts = (): HTMLElement[] => [...p.listbox.querySelectorAll<HTMLElement>('[role="option"]')].filter((o) => !o.hidden);
    expect(opts().map((o) => o.dataset.name)).toEqual(['', 'lightbulb', 'sofa']);
    expect(opts()[0]!.getAttribute('aria-selected')).toBe('true');
    p.filter('couch');
    expect(opts().map((o) => o.dataset.name)).toEqual(['sofa']);
    p.filter('zzz');
    expect(p.el.querySelector<HTMLElement>('.mh-icon-picker__empty')!.hidden).toBe(false);
  });
});

describe('file drop zone', () => {
  const file = (name: string, size: number, type: string): File => new File([new Uint8Array(size)], name, { type });

  it('checks type, size and count', () => {
    expect(fileAccepted({ name: 'a.PNG', type: 'image/png' }, 'image/*')).toBe(true);
    expect(fileAccepted({ name: 'a.json', type: '' }, '.json,.yaml')).toBe(true);
    expect(fileAccepted({ name: 'a.txt', type: 'text/plain' }, 'image/*,.json')).toBe(false);
    expect(formatFileSize(4_200_000, 'en-GB')).toBe('4.2 MB');
    expect(formatFileSize(12, 'en-GB')).toBe('12 bytes');

    const seen: [number, number][] = [];
    const z = createFileDropZone({ accept: 'image/*', maxSize: 1000, maxFiles: 2, hint: 'Images up to 1 kB', onFiles: (a, r) => seen.push([a.length, r.length]) });
    document.body.append(z.el);
    expect(z.el.className).toBe('mh-drop-zone');
    z.addFiles([file('floor-plan.png', 500, 'image/png'), file('notes.txt', 10, 'text/plain'), file('huge.png', 5000, 'image/png')]);
    expect(seen).toEqual([[1, 2]]);
    expect(z.el.classList.contains('is-invalid')).toBe(true);
    expect(z.el.querySelector('.mh-drop-zone__message')!.textContent).toBe("notes.txt isn't a file type this accepts (and 1 more).");
    z.addFiles([file('b.png', 10, 'image/png'), file('c.png', 10, 'image/png')]);
    expect(z.getFiles().map((f) => f.name)).toEqual(['floor-plan.png', 'b.png']);
    expect(z.el.querySelector('.mh-drop-zone__message')!.textContent).toBe('Up to 2 files can be added.');
    const rows = z.el.querySelectorAll('.mh-drop-zone__file');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.querySelector('.mh-drop-zone__file-size')!.textContent).toBe('500 bytes');
    rows[0]!.querySelector<HTMLButtonElement>('.mh-drop-zone__remove')!.click();
    expect(z.getFiles().map((f) => f.name)).toEqual(['b.png']);
  });

  it('opens the chooser from the button and shows drag-over', () => {
    const z = createFileDropZone({ multiple: false });
    document.body.append(z.el);
    let opened = 0;
    z.input.click = () => {
      opened += 1;
    };
    z.button.click();
    expect(opened).toBe(1);
    expect(z.button.textContent).toBe('Choose a file');
    const drag = new Event('dragenter', { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(drag, 'dataTransfer', { value: { types: ['Files'], files: [] } });
    z.el.dispatchEvent(drag);
    expect(z.el.classList.contains('is-dragover')).toBe(true);
    z.el.dispatchEvent(new Event('dragleave', { bubbles: true }));
    expect(z.el.classList.contains('is-dragover')).toBe(false);
    z.setDisabled(true);
    z.button.click();
    expect(opened).toBe(1);
  });
});
