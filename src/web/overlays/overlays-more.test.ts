import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCommandPalette, filterCommands, highlightParts, matchCommand, type Command } from './commandPalette.ts';
import { createPopover } from './popover.ts';
import { createSplitButton } from './splitButton.ts';

const key = (target: Element, k: string, init: KeyboardEventInit = {}): void => {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
};

beforeEach(() => {
  vi.useFakeTimers();
  document.body.replaceChildren();
  document.documentElement.style.overflow = '';
});
afterEach(() => {
  vi.useRealTimers();
});

describe('split button', () => {
  it('joins a main action to a menu of alternatives', () => {
    const clicks: string[] = [];
    const s = createSplitButton({
      label: 'Run scene',
      icon: 'play',
      items: [
        { value: 'later', label: 'Run in 10 minutes' },
        { value: 'edit', label: 'Edit scene' },
      ],
      onClick: () => clicks.push('main'),
      onSelect: (v) => clicks.push(v),
    });
    document.body.append(s.el);
    expect(s.el.className).toBe('mh-split-button mh-split-button--primary');
    expect(s.el.getAttribute('role')).toBe('group');
    expect(s.button.className).toBe('mh-button mh-button--primary mh-split-button__main');
    expect(s.toggle.getAttribute('aria-label')).toBe('More options');
    expect(s.toggle.getAttribute('aria-haspopup')).toBe('menu');
    s.button.click();
    s.toggle.click();
    expect(s.menu.isOpen()).toBe(true);
    expect(s.toggle.getAttribute('aria-expanded')).toBe('true');
    s.menu.el.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[1]!.click();
    expect(clicks).toEqual(['main', 'edit']);
    expect(s.menu.isOpen()).toBe(false);
  });

  it('disables both halves and closes the menu', () => {
    const s = createSplitButton({ label: 'Save', variant: 'secondary', size: 'small', items: [{ value: 'copy', label: 'Save a copy' }] });
    document.body.append(s.el);
    s.toggle.click();
    s.setDisabled(true);
    expect(s.menu.isOpen()).toBe(false);
    expect(s.button.disabled && s.toggle.disabled).toBe(true);
    expect(s.el.className).toBe('mh-split-button mh-split-button--secondary mh-split-button--sm');
    s.setLabel('Save all');
    expect(s.el.getAttribute('aria-label')).toBe('Save all');
  });
});

describe('popover', () => {
  const setup = (extra: Partial<Parameters<typeof createPopover>[0]> = {}) => {
    const anchor = document.createElement('button');
    anchor.textContent = 'Brightness';
    document.body.append(anchor);
    const range = document.createElement('input');
    range.type = 'range';
    const reasons: string[] = [];
    const p = createPopover({ anchor, title: 'Brightness', content: range, onClose: (r) => reasons.push(r), ...extra });
    return { anchor, range, p, reasons };
  };

  it('opens from its anchor as a labelled dialog and focuses the first control', () => {
    const { anchor, range, p } = setup();
    expect(anchor.getAttribute('aria-haspopup')).toBe('dialog');
    expect(anchor.getAttribute('aria-expanded')).toBe('false');
    anchor.click();
    expect(p.isOpen()).toBe(true);
    expect(p.el.getAttribute('role')).toBe('dialog');
    expect(document.getElementById(p.el.getAttribute('aria-labelledby')!)!.textContent).toBe('Brightness');
    expect(anchor.getAttribute('aria-expanded')).toBe('true');
    expect(anchor.getAttribute('aria-controls')).toBe(p.el.id);
    expect(document.activeElement).toBe(range);
    anchor.click();
    expect(p.isOpen()).toBe(false);
  });

  it('closes on Escape back to the anchor, and on a press outside', () => {
    const { anchor, range, p, reasons } = setup();
    p.open();
    key(range, 'Escape');
    expect(p.isOpen()).toBe(false);
    expect(document.activeElement).toBe(anchor);
    p.open();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(p.isOpen()).toBe(false);
    expect(reasons).toEqual(['escape', 'outside']);
    expect(p.el.isConnected).toBe(false);
  });

  it('has an optional close button, and a label without a title', () => {
    const { p, reasons } = setup({ title: undefined, label: 'Quick settings', closeButton: true });
    p.open();
    expect(p.el.getAttribute('aria-label')).toBe('Quick settings');
    expect(p.el.querySelector<HTMLElement>('.mh-popover__title')!.hidden).toBe(true);
    p.el.querySelector<HTMLButtonElement>('.mh-popover__close')!.click();
    expect(reasons).toEqual(['close-button']);
    p.destroy();
    expect(document.querySelector('button')!.hasAttribute('aria-haspopup')).toBe(false);
  });
});

const COMMANDS: Command[] = [
  { value: 'lights-off', label: 'Turn off all lights', group: 'Lights', keywords: ['dark', 'night'], icon: 'lightbulb' },
  { value: 'lights-on', label: 'Turn on all lights', group: 'Lights' },
  { value: 'lock', label: 'Lock the front door', group: 'Security', shortcut: 'Ctrl+L' },
  { value: 'away', label: 'Away mode', group: 'Security', disabled: true },
  { value: 'settings', label: 'Open settings' },
];

describe('command matching', () => {
  it('ranks label starts first, then word starts, then keywords, then letters in order', () => {
    expect(filterCommands('lock', COMMANDS)[0]!.command.value).toBe('lock');
    expect(filterCommands('lights', COMMANDS).map((m) => m.command.value)).toEqual(['lights-off', 'lights-on']);
    expect(filterCommands('night', COMMANDS).map((m) => m.command.value)).toEqual(['lights-off']);
    expect(filterCommands('toal', COMMANDS).map((m) => m.command.value)).toEqual(['lights-off', 'lights-on']);
    expect(filterCommands('tfd', COMMANDS).map((m) => m.command.value)).toEqual(['lock']);
    expect(filterCommands('setngs', COMMANDS).map((m) => m.command.value)).toEqual(['settings']);
    expect(filterCommands('zzz', COMMANDS)).toEqual([]);
    expect(filterCommands('', COMMANDS)).toHaveLength(5);
  });

  it('marks what matched', () => {
    const m = matchCommand('off lig', COMMANDS[0]!)!;
    expect(highlightParts(COMMANDS[0]!.label, m.ranges)).toEqual([
      { text: 'Turn ', mark: false },
      { text: 'off', mark: true },
      { text: ' all ', mark: false },
      { text: 'lig', mark: true },
      { text: 'hts', mark: false },
    ]);
  });
});

describe('command palette', () => {
  it('lists commands under group headings and filters as you type', () => {
    const p = createCommandPalette({ commands: COMMANDS });
    p.open();
    expect(p.el.className).toBe('mh-overlay mh-palette');
    expect(p.el.getAttribute('aria-label')).toBe('Command palette');
    expect(document.activeElement).toBe(p.input);
    expect(p.input.getAttribute('role')).toBe('combobox');
    const list = document.getElementById(p.input.getAttribute('aria-controls')!)!;
    expect(list.getAttribute('role')).toBe('listbox');
    // Ungrouped first, then each group under its heading.
    expect([...list.querySelectorAll('.mh-palette__heading')].map((n) => n.textContent)).toEqual(['Lights', 'Security']);
    expect(list.querySelectorAll('[role="option"]')).toHaveLength(5);
    const first = list.querySelector('[role="option"]')!;
    expect(first.getAttribute('data-value')).toBe('settings');
    expect(p.input.getAttribute('aria-activedescendant')).toBe(first.id);
    p.input.value = 'lights';
    p.input.dispatchEvent(new Event('input'));
    expect(list.querySelectorAll('.mh-palette__heading')).toHaveLength(0);
    expect([...list.querySelectorAll('[role="option"]')].map((o) => o.getAttribute('data-value'))).toEqual(['lights-off', 'lights-on']);
    expect(list.querySelector('mark')!.textContent).toBe('lights');
    expect(p.el.querySelector('[role="status"]')!.textContent).toBe('2 commands');
    p.input.value = 'zzz';
    p.input.dispatchEvent(new Event('input'));
    expect(p.el.querySelector<HTMLElement>('.mh-palette__empty')!.hidden).toBe(false);
    expect(list.hidden).toBe(true);
    expect(p.input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('moves with the arrow keys, skips disabled commands and runs on Enter', () => {
    const picked: string[] = [];
    const reasons: string[] = [];
    const p = createCommandPalette({ commands: COMMANDS, onSelect: (v) => picked.push(v), onClose: (r) => reasons.push(r) });
    p.open();
    p.input.value = 'o';
    p.input.dispatchEvent(new Event('input'));
    const options = () => [...p.el.querySelectorAll<HTMLElement>('[role="option"]')];
    const active = () => options().find((o) => o.getAttribute('aria-selected') === 'true')!.getAttribute('data-value');
    const order = options().map((o) => o.getAttribute('data-value'));
    expect(order).toContain('away');
    key(p.input, 'ArrowUp');
    // From the first, Up wraps to the last enabled one.
    expect(active()).toBe(order.filter((v) => v !== 'away').at(-1));
    for (let i = 0; i < order.length; i += 1) {
      key(p.input, 'ArrowDown');
      expect(active()).not.toBe('away');
    }
    key(p.input, 'Enter');
    expect(picked).toHaveLength(1);
    expect(p.isOpen()).toBe(false);
    expect(reasons).toEqual(['api']);
  });

  it('runs a command on click, and opens from the hotkey', () => {
    const picked: string[] = [];
    const p = createCommandPalette({ commands: COMMANDS, hotkey: true, onSelect: (v) => picked.push(v) });
    key(document.body, 'k', { ctrlKey: true });
    expect(p.isOpen()).toBe(true);
    p.el.querySelector<HTMLElement>('[data-value="lock"]')!.click();
    expect(picked).toEqual(['lock']);
    p.el.querySelector<HTMLElement>('[data-value="away"]')!.click();
    expect(picked).toEqual(['lock']);
    vi.runAllTimers();
    p.destroy();
    key(document.body, 'k', { ctrlKey: true });
    expect(p.isOpen()).toBe(false);
  });

  it('closes on Escape and starts empty next time', () => {
    const p = createCommandPalette({ commands: COMMANDS });
    p.open();
    p.input.value = 'lock';
    p.input.dispatchEvent(new Event('input'));
    key(p.input, 'Escape');
    expect(p.isOpen()).toBe(false);
    vi.runAllTimers();
    p.open();
    expect(p.input.value).toBe('');
    expect(p.el.querySelectorAll('[role="option"]')).toHaveLength(5);
    p.setCommands(COMMANDS.slice(0, 2));
    expect(p.el.querySelectorAll('[role="option"]')).toHaveLength(2);
  });
});
