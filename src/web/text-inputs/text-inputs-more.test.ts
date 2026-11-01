import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCommandBar,
  createDurationField,
  createHotkeyField,
  createMultiSelect,
  createNumberInput,
  createSecretField,
  createTransferList,
  filterCommandSuggestions,
  filterMultiSelect,
  formatDuration,
  formatNumber,
  hotkeyCaps,
  hotkeyFromEvent,
  hotkeyKeyAction,
  hotkeyToString,
  matchesQuery,
  nextEnabled,
  parseDuration,
  parseHotkey,
  parseNumber,
  pushHistory,
  stepPrecision,
  transferKey,
  transferMove,
} from '../index.ts';

beforeEach(() => document.body.replaceChildren());

const mount = <T extends { el: Element }>(handle: T): T => {
  document.body.append(handle.el);
  return handle;
};
const key = (el: Element, k: string, init: KeyboardEventInit = {}): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(event);
  return event;
};
const type = (input: HTMLInputElement, text: string): void => {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('list helpers', () => {
  it('matches words, ignoring case and accents', () => {
    expect(matchesQuery('Café lights', 'cafe')).toBe(true);
    expect(matchesQuery('Living room', 'room liv')).toBe(true);
    expect(matchesQuery('Kitchen', 'den')).toBe(false);
    expect(matchesQuery('Anything', '  ')).toBe(true);
  });

  it('skips disabled items and wraps on request', () => {
    const items = [{}, { disabled: true }, {}];
    expect(nextEnabled(items, 0, 1)).toBe(2);
    expect(nextEnabled(items, 2, 1)).toBe(2);
    expect(nextEnabled(items, 2, 1, true)).toBe(0);
    expect(nextEnabled(items, items.length, -1)).toBe(2);
    expect(nextEnabled([], -1, 1)).toBe(-1);
  });
});

describe('number input', () => {
  it('parses and formats numbers', () => {
    expect(parseNumber(' 1,5 ')).toBe(1.5);
    expect(parseNumber('−3')).toBe(-3);
    expect(parseNumber('+.5')).toBe(0.5);
    expect(parseNumber('12a')).toBeNull();
    expect(parseNumber('')).toBeNull();
    expect(stepPrecision(0.25)).toBe(2);
    expect(stepPrecision(1e-7)).toBe(7);
    expect(formatNumber(-2, 0)).toBe('−2');
    expect(formatNumber(-0.001, 1)).toBe('0.0');
  });

  it('is a labelled spinbutton with a spoken unit', () => {
    const n = createNumberInput({ label: 'Target', value: 21.5, min: 7, max: 30, step: 0.5, unit: '°C' });
    expect(n.el.className).toBe('mh-field');
    expect(n.input.getAttribute('role')).toBe('spinbutton');
    expect(n.input.value).toBe('21.5');
    expect(n.input.getAttribute('aria-valuenow')).toBe('21.5');
    expect(n.input.getAttribute('aria-valuetext')).toBe('21.5 °C');
    expect(n.input.getAttribute('aria-valuemin')).toBe('7');
    expect(n.input.getAttribute('inputmode')).toBe('decimal');
    expect(n.el.querySelector('label')!.htmlFor).toBe(n.input.id);
    const steps = n.el.querySelectorAll<HTMLButtonElement>('.mh-number-input__step');
    expect(steps[0]!.tabIndex).toBe(-1);
    expect(steps[0]!.getAttribute('aria-label')).toBe('Decrease');
  });

  it('steps with keys and buttons, clamps and disables at the limits', () => {
    const seen: number[] = [];
    const n = mount(createNumberInput({ ariaLabel: 'Guests', value: 9, min: 0, max: 10, onChange: (v) => seen.push(v) }));
    key(n.input, 'ArrowUp');
    expect(n.getValue()).toBe(10);
    const [dec, inc] = n.el.querySelectorAll<HTMLButtonElement>('.mh-number-input__step');
    expect(inc!.disabled).toBe(true);
    key(n.input, 'PageDown');
    expect(n.getValue()).toBe(0);
    expect(dec!.disabled).toBe(true);
    inc!.click();
    expect(seen).toEqual([10, 0, 1]);
  });

  it('commits typed text on Enter, snapping to the step; Escape reverts', () => {
    const n = mount(createNumberInput({ ariaLabel: 'Level', value: 2, min: 0, max: 10, step: 0.5 }));
    n.input.value = '3,3';
    key(n.input, 'Enter');
    expect(n.getValue()).toBe(3.5);
    expect(n.input.value).toBe('3.5');
    n.input.value = 'abc';
    n.input.dispatchEvent(new Event('change'));
    expect(n.input.value).toBe('3.5');
    n.input.value = '7';
    const esc = key(n.input, 'Escape');
    expect(esc.defaultPrevented).toBe(true);
    expect(n.input.value).toBe('3.5');
  });

  it('steps from the typed value', () => {
    const n = mount(createNumberInput({ ariaLabel: 'Level', value: 2 }));
    n.input.value = '6';
    key(n.input, 'ArrowUp');
    expect(n.getValue()).toBe(7);
  });

  it('scrubs by dragging the unit', () => {
    const seen: number[] = [];
    const n = mount(createNumberInput({ ariaLabel: 'Level', value: 5, unit: '%', scrubDistance: 10, onChange: (v) => seen.push(v) }));
    const unit = n.el.querySelector('.mh-number-input__scrub')!;
    const pointer = (t: string, x: number): void => void unit.dispatchEvent(new PointerEvent(t, { clientX: x, pointerId: 1, button: 0, bubbles: true, cancelable: true }));
    pointer('pointerdown', 100);
    expect(unit.classList.contains('is-scrubbing')).toBe(true);
    pointer('pointermove', 125);
    pointer('pointermove', 80);
    pointer('pointerup', 80);
    expect(seen).toEqual([7, 3]);
    expect(unit.classList.contains('is-scrubbing')).toBe(false);
  });

  it('repeats while a button is held', () => {
    vi.useFakeTimers();
    try {
      const n = mount(createNumberInput({ ariaLabel: 'Level', value: 0, max: 100 }));
      const inc = n.el.querySelectorAll<HTMLButtonElement>('.mh-number-input__step')[1]!;
      inc.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
      expect(n.getValue()).toBe(1);
      vi.advanceTimersByTime(400 + 70 * 3);
      inc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      inc.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      vi.advanceTimersByTime(1000);
      expect(n.getValue()).toBe(5);
    } finally {
      vi.useRealTimers();
    }
  });

  it('disables everything', () => {
    const n = createNumberInput({ label: 'Level', value: 3, disabled: true });
    expect(n.input.disabled).toBe(true);
    expect(n.el.classList.contains('is-disabled')).toBe(true);
    expect([...n.el.querySelectorAll<HTMLButtonElement>('button')].every((b) => b.disabled)).toBe(true);
  });
});

describe('secret field', () => {
  it('reveals with a pressed toggle', () => {
    const revealed: boolean[] = [];
    const s = createSecretField({ label: 'Password', value: 'lantern-7', onReveal: (r) => revealed.push(r) });
    expect(s.input.type).toBe('password');
    expect(s.input.getAttribute('autocomplete')).toBe('current-password');
    expect(s.copyButton).toBeNull();
    s.revealButton.click();
    expect(s.input.type).toBe('text');
    expect(s.revealButton.getAttribute('aria-pressed')).toBe('true');
    expect(s.revealButton.getAttribute('aria-label')).toBe('Show password');
    expect(revealed).toEqual([true]);
  });

  it('copies a key and announces it', async () => {
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    try {
      const s = createSecretField({ label: 'Token', kind: 'key', value: 'tkn_example' });
      expect(s.el.querySelector('.mh-secret--key')).not.toBeNull();
      expect(s.input.getAttribute('autocomplete')).toBe('off');
      expect(s.input.getAttribute('spellcheck')).toBe('false');
      expect(await s.copy()).toBe(true);
      expect(writeText).toHaveBeenCalledWith('tkn_example');
      expect(s.el.querySelector('[role=status]')!.textContent).toBe('Copied');
      expect(s.copyButton!.classList.contains('is-copied')).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('disables copy while empty', () => {
    const s = createSecretField({ ariaLabel: 'Key', kind: 'key' });
    expect(s.copyButton!.disabled).toBe(true);
    type(s.input, 'x');
    expect(s.copyButton!.disabled).toBe(false);
  });
});

describe('hotkey field', () => {
  it('reads key events and text', () => {
    expect(hotkeyFromEvent({ key: 'Shift' })).toBeNull();
    const k = hotkeyFromEvent({ key: 'Ω', code: 'KeyZ', altKey: true })!;
    expect(hotkeyToString(k)).toBe('Alt+Z');
    expect(hotkeyToString(parseHotkey('cmd+shift+k')!)).toBe('Shift+Meta+K');
    expect(hotkeyToString(parseHotkey('Ctrl++')!)).toBe('Ctrl++');
    expect(parseHotkey('Hyper+K')).toBeNull();
    expect(hotkeyCaps(parseHotkey('Ctrl+Shift+ArrowUp')!)).toEqual(['Ctrl', 'Shift', '↑']);
    expect(hotkeyCaps(parseHotkey('Ctrl+Meta+K')!, true)).toEqual(['⌃', '⌘', 'K']);
  });

  it('decides what keys do', () => {
    expect(hotkeyKeyAction({ key: 'Backspace' }, false).type).toBe('clear');
    expect(hotkeyKeyAction({ key: 'k' }, false).type).toBe('ignore');
    expect(hotkeyKeyAction({ key: 'Escape' }, true)).toEqual({ type: 'cancel', leave: false });
    expect(hotkeyKeyAction({ key: 'Tab' }, true)).toEqual({ type: 'cancel', leave: true });
    expect(hotkeyKeyAction({ key: 'Control', ctrlKey: true }, true).type).toBe('pending');
    expect(hotkeyKeyAction({ key: 'k' }, true, true).type).toBe('needs-modifier');
    expect(hotkeyKeyAction({ key: 'F5' }, true, true).type).toBe('set');
  });

  it('records a shortcut', () => {
    const seen: string[] = [];
    const f = mount(createHotkeyField({ label: 'Open search', value: 'ctrl+k', appleSymbols: false, onChange: (v) => seen.push(v) }));
    expect(f.getValue()).toBe('Ctrl+K');
    expect([...f.el.querySelectorAll('kbd')].map((k) => k.textContent)).toEqual(['Ctrl', 'K']);
    const labelledBy = f.control.getAttribute('aria-labelledby')!.split(' ');
    expect(labelledBy[0]).toBe(f.field!.label.id);
    expect(f.el.querySelector(`[id="${labelledBy[1]}"] .mh-visually-hidden`)!.textContent).toBe('Control K');
    f.control.click();
    expect(f.isRecording()).toBe(true);
    expect(f.el.querySelector('.mh-hotkey')!.classList.contains('is-recording')).toBe(true);
    key(f.control, 'Shift', { shiftKey: true });
    expect([...f.el.querySelectorAll('kbd')].map((k) => k.textContent)).toEqual(['Shift']);
    key(f.control, 'P', { code: 'KeyP', shiftKey: true, ctrlKey: true });
    expect(f.isRecording()).toBe(false);
    expect(seen).toEqual(['Ctrl+Shift+P']);
    expect(f.el.querySelector('[role=status]')!.textContent).toBe('Control Shift P');
  });

  it('cancels with Escape and clears with Backspace or the button', () => {
    const seen: string[] = [];
    const f = mount(createHotkeyField({ ariaLabel: 'Mute', value: 'Alt+M', onChange: (v) => seen.push(v) }));
    f.control.click();
    key(f.control, 'Escape');
    expect(f.isRecording()).toBe(false);
    expect(f.getValue()).toBe('Alt+M');
    key(f.control, 'Backspace');
    expect(f.getValue()).toBe('');
    f.setValue('Alt+M');
    f.el.querySelector<HTMLButtonElement>('.mh-hotkey__clear')!.click();
    expect(seen).toEqual(['', '']);
    expect(f.el.querySelector<HTMLButtonElement>('.mh-hotkey__clear')!.hidden).toBe(true);
    expect(f.el.querySelector('.mh-hotkey__text--empty')!.textContent).toBe('Not set');
  });
});

describe('command bar', () => {
  const commands = [{ value: 'lights on' }, { value: 'lights off' }, { value: 'status', description: 'Summary of the lights' }];

  it('filters suggestions, prefix matches first', () => {
    expect(filterCommandSuggestions(commands, 'li').map((c) => c.value)).toEqual(['lights on', 'lights off', 'status']);
    expect(filterCommandSuggestions(commands, 'status')).toEqual([]);
    expect(filterCommandSuggestions(commands, '')).toEqual([]);
    expect(pushHistory(['a'], 'a')).toEqual(['a']);
    expect(pushHistory(['a', 'b'], 'c', 2)).toEqual(['b', 'c']);
  });

  it('is a combobox that completes with Tab and runs with Enter', () => {
    const run: string[] = [];
    const bar = mount(createCommandBar({ suggestions: commands, onSubmit: (c) => run.push(c) }));
    type(bar.input, 'lig');
    expect(bar.list.hidden).toBe(false);
    expect(bar.input.getAttribute('aria-expanded')).toBe('true');
    expect(bar.list.querySelectorAll('[role=option]').length).toBe(3);
    key(bar.input, 'ArrowDown');
    key(bar.input, 'ArrowDown');
    expect(bar.input.getAttribute('aria-activedescendant')).toBe(bar.list.children[1]!.id);
    expect(bar.list.children[1]!.getAttribute('aria-selected')).toBe('true');
    key(bar.input, 'Tab');
    expect(bar.getValue()).toBe('lights off');
    expect(bar.list.hidden).toBe(true);
    key(bar.input, 'Enter');
    expect(run).toEqual(['lights off']);
    expect(bar.getValue()).toBe('');
    expect(bar.getHistory()).toEqual(['lights off']);
  });

  it('walks the history with the arrows and keeps the draft', () => {
    const bar = mount(createCommandBar({ history: ['first', 'second'] }));
    type(bar.input, 'dra');
    key(bar.input, 'ArrowUp');
    expect(bar.getValue()).toBe('second');
    key(bar.input, 'ArrowUp');
    key(bar.input, 'ArrowUp');
    expect(bar.getValue()).toBe('first');
    key(bar.input, 'ArrowDown');
    key(bar.input, 'ArrowDown');
    expect(bar.getValue()).toBe('dra');
  });

  it('closes, then clears with Escape', () => {
    const bar = mount(createCommandBar({ suggestions: commands }));
    type(bar.input, 'st');
    key(bar.input, 'Escape');
    expect(bar.list.hidden).toBe(true);
    expect(bar.getValue()).toBe('st');
    key(bar.input, 'Escape');
    expect(bar.getValue()).toBe('');
  });
});

describe('duration field', () => {
  it('parses many forms', () => {
    expect(parseDuration('1h 30m')).toBe(5400);
    expect(parseDuration('1 hour and 30 minutes')).toBe(5400);
    expect(parseDuration('1h, 30m')).toBe(5400);
    expect(parseDuration('1h30')).toBe(5400);
    expect(parseDuration('90')).toBe(5400);
    expect(parseDuration('90', 's')).toBe(90);
    expect(parseDuration('1.5h')).toBe(5400);
    expect(parseDuration('1,5 h')).toBe(5400);
    expect(parseDuration('1:30')).toBe(5400);
    expect(parseDuration('0:45:10')).toBe(2710);
    expect(parseDuration('2d 4h')).toBe(187200);
    expect(parseDuration('45 secs')).toBe(45);
    expect(parseDuration('30m 1h')).toBeNull();
    expect(parseDuration('1h 2h')).toBeNull();
    expect(parseDuration('soon')).toBeNull();
    expect(parseDuration('1:75')).toBeNull();
    expect(parseDuration('')).toBeNull();
  });

  it('formats short and long', () => {
    expect(formatDuration(5400)).toBe('1h 30m');
    expect(formatDuration(3661, 'long')).toBe('1 hour 1 minute 1 second');
    expect(formatDuration(0)).toBe('0m');
  });

  it('previews, commits and normalises', () => {
    const seen: (number | null)[] = [];
    const d = mount(createDurationField({ label: 'Timer', onChange: (s) => seen.push(s) }));
    type(d.input, '90');
    expect(d.el.querySelector('.mh-duration__preview')!.textContent).toBe('1 hour 30 minutes');
    key(d.input, 'Enter');
    expect(d.input.value).toBe('1h 30m');
    expect(d.getValue()).toBe(5400);
    expect(d.el.querySelector('.mh-duration__preview')!.textContent).toBe('');
    d.input.value = '';
    d.input.dispatchEvent(new Event('change'));
    expect(seen).toEqual([5400, null]);
  });

  it('explains what is wrong', () => {
    const d = mount(createDurationField({ label: 'Delay', min: 60, max: 3600 }));
    d.input.value = 'later';
    d.input.dispatchEvent(new Event('change'));
    expect(d.input.getAttribute('aria-invalid')).toBe('true');
    expect(d.el.querySelector('.mh-field__message')!.textContent).toBe('Enter a duration like 1h 30m.');
    d.input.value = '2h';
    d.input.dispatchEvent(new Event('change'));
    expect(d.el.querySelector('.mh-field__message')!.textContent).toBe('At most 1 hour.');
    d.input.value = '5m';
    d.input.dispatchEvent(new Event('change'));
    expect(d.input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('sets a preset in one press', () => {
    const d = mount(createDurationField({ label: 'Timer', presets: [300, 600], value: 300 }));
    const [five, ten] = d.el.querySelectorAll<HTMLButtonElement>('.mh-duration__preset');
    expect(five!.getAttribute('aria-pressed')).toBe('true');
    expect(ten!.textContent).toBe('10m');
    ten!.click();
    expect(d.getValue()).toBe(600);
    expect(ten!.getAttribute('aria-pressed')).toBe('true');
    expect(d.input.value).toBe('10m');
  });
});

describe('multi-select', () => {
  const options = [
    { label: 'Downstairs', options: [{ value: 'living', label: 'Living room' }, { value: 'kitchen', label: 'Kitchen' }] },
    { value: 'attic', label: 'Attic', disabled: true },
    { value: 'study', label: 'Study' },
  ];

  it('filters groups', () => {
    expect(filterMultiSelect(options, 'kit')).toEqual([{ label: 'Downstairs', options: [{ value: 'kitchen', label: 'Kitchen' }] }]);
    expect(filterMultiSelect(options, 'stu')).toEqual([{ value: 'study', label: 'Study' }]);
  });

  it('shows chips and a multiselectable listbox', () => {
    const m = mount(createMultiSelect({ label: 'Rooms', options, values: ['kitchen'], placeholder: 'Choose', required: true }));
    expect(m.el.querySelectorAll('.mh-chip').length).toBe(1);
    expect(m.input.hasAttribute('placeholder')).toBe(false);
    expect(m.input.required).toBe(false);
    expect(m.input.getAttribute('aria-required')).toBe('true');
    expect(m.list.getAttribute('aria-multiselectable')).toBe('true');
    expect(m.list.querySelector('[role=group]')!.getAttribute('aria-labelledby')).toBe(m.list.querySelector('.mh-multi-select__group-label')!.id);
    expect(m.list.querySelector('[aria-disabled=true]')!.textContent).toBe('Attic');
  });

  it('opens, moves past disabled options and toggles with Enter', () => {
    const seen: string[][] = [];
    const m = mount(createMultiSelect({ label: 'Rooms', options, onChange: (v) => seen.push(v) }));
    const popup = m.el.querySelector<HTMLElement>('.mh-multi-select__popup')!;
    expect(popup.hidden).toBe(true);
    key(m.input, 'ArrowDown');
    expect(popup.hidden).toBe(false);
    expect(m.input.getAttribute('aria-expanded')).toBe('true');
    key(m.input, 'ArrowDown');
    key(m.input, 'ArrowDown');
    const active = m.input.getAttribute('aria-activedescendant')!;
    expect(m.list.querySelector(`[id="${active}"]`)!.textContent).toBe('Study');
    key(m.input, 'Enter');
    expect(seen).toEqual([['study']]);
    expect(popup.hidden).toBe(false);
    expect(m.el.querySelector('[role=status]')!.textContent).toBe('Study added');
    key(m.input, 'Escape');
    expect(popup.hidden).toBe(true);
  });

  it('filters by typing, removes chips with Backspace and the remove button', () => {
    const seen: string[][] = [];
    const m = mount(createMultiSelect({ label: 'Rooms', options, values: ['living', 'study'], onChange: (v) => seen.push(v) }));
    type(m.input, 'kit');
    expect(m.list.querySelectorAll('[role=option]').length).toBe(1);
    key(m.input, 'Enter');
    expect(m.input.value).toBe('');
    expect(m.getValues()).toEqual(['living', 'study', 'kitchen']);
    key(m.input, 'Backspace');
    expect(m.getValues()).toEqual(['living', 'study']);
    m.el.querySelector<HTMLButtonElement>('.mh-chip__remove')!.click();
    expect(seen.at(-1)).toEqual(['study']);
  });

  it('shows the empty text when nothing matches', () => {
    const m = mount(createMultiSelect({ label: 'Rooms', options }));
    type(m.input, 'zzz');
    expect(m.el.querySelector<HTMLElement>('.mh-multi-select__empty')!.hidden).toBe(false);
  });
});

describe('transfer list', () => {
  const items = [
    { value: 'a', label: 'Weather' },
    { value: 'b', label: 'Lights' },
    { value: 'c', label: 'Network', disabled: true },
    { value: 'd', label: 'Music' },
  ];

  it('moves values keeping item order; disabled ones stay', () => {
    expect(transferMove(items, ['d'], ['a', 'c'], 'target')).toEqual(['a', 'd']);
    expect(transferMove(items, ['a', 'c'], ['a', 'c'], 'source')).toEqual(['c']);
    expect(transferKey({ key: 'a', ctrlKey: true }, items, 0).type).toBe('select-all');
    expect(transferKey({ key: 'ArrowDown' }, items, 1)).toEqual({ type: 'move-active', index: 3, extend: false });
  });

  it('renders two labelled listboxes and moves the selection', () => {
    const seen: string[][] = [];
    const t = mount(createTransferList({ label: 'Cards', items, values: ['c'], onChange: (v) => seen.push(v) }));
    const { source, target } = t.lists;
    expect(source.getAttribute('aria-multiselectable')).toBe('true');
    expect(document.getElementById(source.getAttribute('aria-labelledby')!)!.textContent).toBe('Available');
    expect(source.querySelectorAll('[role=option]').length).toBe(3);
    expect(target.querySelectorAll('[role=option]').length).toBe(1);
    const moveOne = t.el.querySelector<HTMLButtonElement>('[aria-label="Move selected to Selected"]')!;
    expect(moveOne.disabled).toBe(true);
    source.querySelectorAll<HTMLElement>('[role=option]')[1]!.click();
    expect(source.querySelectorAll('[role=option]')[1]!.getAttribute('aria-selected')).toBe('true');
    expect(t.el.querySelector('.mh-transfer__count')!.textContent).toBe('1/3');
    expect(moveOne.disabled).toBe(false);
    moveOne.click();
    expect(seen).toEqual([['b', 'c']]);
    expect(t.el.querySelector('[role=status]')!.textContent).toBe('1 moved to Selected');
    t.el.querySelector<HTMLButtonElement>('[aria-label="Move all to Available"]')!.click();
    expect(t.getValues()).toEqual(['c']);
  });

  it('works from the keyboard', () => {
    const t = mount(createTransferList({ ariaLabel: 'Cards', items }));
    const { source } = t.lists;
    source.dispatchEvent(new FocusEvent('focus'));
    expect(source.getAttribute('aria-activedescendant')).toBe(source.querySelector('[role=option]')!.id);
    key(source, 'ArrowDown', { shiftKey: true });
    expect([...source.querySelectorAll('[aria-selected=true]')].map((o) => o.textContent)).toEqual(['Weather', 'Lights']);
    key(source, 'Enter');
    expect(t.getValues()).toEqual(['a', 'b']);
    key(source, 'a', { ctrlKey: true });
    expect([...source.querySelectorAll('[aria-selected=true]')].map((o) => o.textContent)).toEqual(['Music']);
  });

  it('shows the empty text and filters', () => {
    const t = mount(createTransferList({ label: 'Cards', items, searchable: true }));
    const target = t.lists.target;
    expect(t.el.querySelector<HTMLElement>('.mh-transfer__panel--target .mh-transfer__empty')!.hidden).toBe(false);
    expect(target.getAttribute('aria-describedby')).toBe(t.el.querySelector('.mh-transfer__panel--target .mh-transfer__empty')!.id);
    expect(t.el.querySelector('label')).toBeNull();
    const filter = t.el.querySelector<HTMLInputElement>('.mh-transfer__panel--source input')!;
    type(filter, 'mus');
    expect(t.lists.source.querySelectorAll('[role=option]').length).toBe(1);
  });
});
