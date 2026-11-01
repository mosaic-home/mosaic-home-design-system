import { act, useState, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { createCommandBar, createDurationField, createHotkeyField, createMultiSelect, createNumberInput, createSecretField, createTransferList } from '../web/text-inputs/index.ts';
import { CommandBar, DurationField, HotkeyField, MultiSelect, NumberInput, SecretField, TransferList } from './text-inputs.tsx';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => document.body.replaceChildren());

const REF_ATTRS = new Set(['id', 'for', 'aria-describedby', 'aria-labelledby', 'aria-controls', 'aria-activedescendant', 'name']);
const STATE_ATTRS = new Set(['value', 'checked', 'style']);

/**
 * A comparable form of a DOM tree: tags, sorted attributes, text and live input values. Generated ids are replaced
 * by their order of first appearance, so the wiring is compared too. Ids built from a base id (`<base>-3`) keep
 * their suffix.
 */
function shape(root: Element): string {
  const ids = new Map<string, string>();
  const one = (part: string): string => {
    // The generated part: `mh-<name>-<n>` from the web renderer, React's `useId` (plus a word) from the bindings.
    const m = /^(mh-[a-z-]*?-\d+|(?:[«:][rR][0-9a-z]*[»:]|_[rR]_[0-9a-zA-Z]+_)[a-z]*)(.*)$/.exec(part);
    const [base, suffix] = m ? [m[1]!, m[2]!] : [part, ''];
    if (!ids.has(base)) ids.set(base, `#${ids.size + 1}`);
    return `${ids.get(base)}${suffix}`;
  };
  const ref = (v: string): string => v.split(' ').map(one).join(' ');
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').trim();
    if (!(node instanceof Element)) return '';
    const attrs = [...node.attributes]
      .filter((a) => !STATE_ATTRS.has(a.name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => `${a.name}=${REF_ATTRS.has(a.name) ? ref(a.value) : a.value}`);
    if (node instanceof HTMLInputElement) attrs.push(`.value=${node.value}`);
    return `<${node.tagName.toLowerCase()} ${attrs.join(' ')}>${[...node.childNodes].map(walk).filter(Boolean).join('')}</>`;
  };
  return walk(root);
}

function fromReact(element: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(element);
  return div.firstElementChild!;
}

const same = (element: ReactElement, web: Element): void => expect(shape(fromReact(element))).toBe(shape(web));

async function mount(element: ReactElement) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(element));
  return { host, unmount: () => act(async () => root.unmount()) };
}

const press = (el: Element, key: string, init: KeyboardEventInit = {}) => act(async () => void el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })));

/** Types into a React-controlled input (sets the value through the native setter so React sees the change). */
const typeInto = (input: HTMLInputElement, text: string) =>
  act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

describe('text inputs: parity with the web renderer (more)', () => {
  it('NumberInput', () => {
    same(
      <NumberInput label="Target" defaultValue={21.5} min={7} max={30} step={0.5} unit="°C" helper="Between 7 and 30" required />,
      createNumberInput({ label: 'Target', value: 21.5, min: 7, max: 30, step: 0.5, unit: '°C', helper: 'Between 7 and 30', required: true }).el,
    );
    same(<NumberInput aria-label="Budget" defaultValue={40} prefix="€" scrub={false} size="small" valueText={(v) => `${v} euros`} />, createNumberInput({ ariaLabel: 'Budget', value: 40, prefix: '€', scrub: false, size: 'small', valueText: (v) => `${v} euros` }).el);
    same(<NumberInput label="Offset" defaultValue={-2} min={-10} max={10} disabled error="Too low" />, createNumberInput({ label: 'Offset', value: -2, min: -10, max: 10, disabled: true, error: 'Too low' }).el);
  });

  it('SecretField', () => {
    same(<SecretField label="Password" defaultValue="abc" placeholder="Yours" helper="Hint" />, createSecretField({ label: 'Password', value: 'abc', placeholder: 'Yours', helper: 'Hint' }).el);
    same(<SecretField aria-label="Token" kind="key" defaultValue="tkn" readOnly icon="lock" defaultRevealed />, createSecretField({ ariaLabel: 'Token', kind: 'key', value: 'tkn', readOnly: true, icon: 'lock', revealed: true }).el);
    same(<SecretField label="New" kind="new-password" disabled copyable />, createSecretField({ label: 'New', kind: 'new-password', disabled: true, copyable: true }).el);
  });

  it('HotkeyField', () => {
    same(<HotkeyField label="Open search" defaultValue="Ctrl+K" appleSymbols={false} helper="Anywhere" required />, createHotkeyField({ label: 'Open search', value: 'Ctrl+K', appleSymbols: false, helper: 'Anywhere', required: true }).el);
    same(<HotkeyField aria-label="Mute" appleSymbols name="mute" />, createHotkeyField({ ariaLabel: 'Mute', appleSymbols: true, name: 'mute' }).el);
    same(<HotkeyField label="Locked" defaultValue="Alt+F4" disabled clearable={false} appleSymbols={false} />, createHotkeyField({ label: 'Locked', value: 'Alt+F4', disabled: true, clearable: false, appleSymbols: false }).el);
  });

  it('CommandBar', () => {
    same(<CommandBar placeholder="Type a command" defaultValue="st" prompt="$" size="small" openUp />, createCommandBar({ placeholder: 'Type a command', value: 'st', prompt: '$', size: 'small', openUp: true }).el);
    same(<CommandBar disabled aria-label="Shell" />, createCommandBar({ disabled: true, ariaLabel: 'Shell' }).el);
  });

  it('DurationField', () => {
    same(<DurationField label="Timer" defaultValue={1500} presets={[300, 1500]} helper="Minutes" />, createDurationField({ label: 'Timer', value: 1500, presets: [300, 1500], helper: 'Minutes' }).el);
    same(<DurationField aria-label="Delay" icon={false} disabled size="large" />, createDurationField({ ariaLabel: 'Delay', icon: false, disabled: true, size: 'large' }).el);
  });

  it('MultiSelect', () => {
    const options = [
      { label: 'Downstairs', options: [{ value: 'living', label: 'Living room', icon: 'home', description: '4 lights' }, { value: 'kitchen', label: 'Kitchen' }] },
      { value: 'attic', label: 'Attic', disabled: true },
    ];
    same(<MultiSelect label="Rooms" options={options} defaultValues={['kitchen']} placeholder="Choose" required helper="Any" name="rooms" />, createMultiSelect({ label: 'Rooms', options, values: ['kitchen'], placeholder: 'Choose', required: true, helper: 'Any', name: 'rooms' }).el);
    same(<MultiSelect aria-label="Days" options={[{ value: 'mon', label: 'Mon' }]} placeholder="Pick" size="small" disabled />, createMultiSelect({ ariaLabel: 'Days', options: [{ value: 'mon', label: 'Mon' }], placeholder: 'Pick', size: 'small', disabled: true }).el);
  });

  it('TransferList', () => {
    const items = [
      { value: 'a', label: 'Weather', icon: 'weather', description: 'Today' },
      { value: 'b', label: 'Network', disabled: true },
      { value: 'c', label: 'Music' },
    ];
    same(<TransferList label="Cards" items={items} defaultValues={['c']} helper="Shown" sourceLabel="Hidden" targetLabel="Shown" />, createTransferList({ label: 'Cards', items, values: ['c'], helper: 'Shown', sourceLabel: 'Hidden', targetLabel: 'Shown' }).el);
    same(<TransferList aria-label="Cards" items={items} searchable disabled />, createTransferList({ ariaLabel: 'Cards', items, searchable: true, disabled: true }).el);
  });
});

describe('text inputs: behaviour (more)', () => {
  it('NumberInput steps, commits typed text and reports changes', async () => {
    const seen: number[] = [];
    const { host, unmount } = await mount(<NumberInput aria-label="Level" defaultValue={2} min={0} max={4} onChange={(v) => seen.push(v)} />);
    const input = host.querySelector('input')!;
    await press(input, 'ArrowUp');
    expect(input.value).toBe('3');
    await act(async () => host.querySelectorAll('button')[1]!.click());
    expect(input.value).toBe('4');
    expect(host.querySelectorAll('button')[1]!.disabled).toBe(true);
    await typeInto(input, '1,2');
    await press(input, 'Enter');
    expect(input.value).toBe('1');
    expect(seen).toEqual([3, 4, 1]);
    await unmount();
  });

  it('SecretField reveals', async () => {
    const { host, unmount } = await mount(<SecretField label="Password" defaultValue="x" />);
    const toggle = host.querySelector<HTMLButtonElement>('.mh-secret__reveal')!;
    await act(async () => toggle.click());
    expect(host.querySelector('input')!.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    await unmount();
  });

  it('HotkeyField records', async () => {
    const seen: string[] = [];
    const { host, unmount } = await mount(<HotkeyField label="Search" appleSymbols={false} onChange={(v) => seen.push(v)} />);
    const control = host.querySelector<HTMLButtonElement>('.mh-hotkey__control')!;
    await act(async () => control.click());
    expect(host.querySelector('.mh-hotkey')!.classList.contains('is-recording')).toBe(true);
    await press(control, 'k', { code: 'KeyK', ctrlKey: true });
    expect(seen).toEqual(['Ctrl+K']);
    expect([...host.querySelectorAll('kbd')].map((k) => k.textContent)).toEqual(['Ctrl', 'K']);
    await unmount();
  });

  it('CommandBar suggests, completes and keeps history', async () => {
    const run: string[] = [];
    const { host, unmount } = await mount(<CommandBar suggestions={[{ value: 'lights on' }, { value: 'lights off' }]} onSubmit={(c) => run.push(c)} />);
    const input = host.querySelector('input')!;
    await typeInto(input, 'li');
    expect(host.querySelectorAll('[role=option]').length).toBe(2);
    await press(input, 'ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(host.querySelector('[role=option]')!.id);
    await press(input, 'Enter');
    expect(input.value).toBe('lights on');
    await press(input, 'Enter');
    expect(run).toEqual(['lights on']);
    expect(input.value).toBe('');
    await press(input, 'ArrowUp');
    expect(input.value).toBe('lights on');
    await unmount();
  });

  it('DurationField reads and normalises', async () => {
    const seen: (number | null)[] = [];
    const { host, unmount } = await mount(<DurationField label="Timer" onChange={(s) => seen.push(s)} />);
    const input = host.querySelector('input')!;
    await typeInto(input, '1h 30');
    expect(host.querySelector('.mh-duration__preview')!.textContent).toBe('1 hour 30 minutes');
    await press(input, 'Enter');
    expect(input.value).toBe('1h 30m');
    await typeInto(input, 'nope');
    await press(input, 'Enter');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(seen).toEqual([5400]);
    await unmount();
  });

  it('MultiSelect toggles from the keyboard and removes chips', async () => {
    function Demo() {
      const [values, setValues] = useState<string[]>(['a']);
      return <MultiSelect label="Rooms" options={[{ value: 'a', label: 'Attic' }, { value: 'b', label: 'Bedroom' }]} values={values} onChange={setValues} />;
    }
    const { host, unmount } = await mount(<Demo />);
    const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
    await press(input, 'ArrowDown');
    expect(host.querySelector<HTMLElement>('.mh-multi-select__popup')!.hidden).toBe(false);
    await press(input, 'ArrowDown');
    await press(input, 'Enter');
    expect([...host.querySelectorAll('.mh-chip__label')].map((c) => c.textContent)).toEqual(['Attic', 'Bedroom']);
    await press(input, 'Backspace');
    await act(async () => host.querySelector<HTMLButtonElement>('.mh-chip__remove')!.click());
    expect(host.querySelectorAll('.mh-chip').length).toBe(0);
    await unmount();
  });

  it('TransferList moves the selection', async () => {
    const seen: string[][] = [];
    const items = [
      { value: 'a', label: 'Weather' },
      { value: 'b', label: 'Lights' },
    ];
    const { host, unmount } = await mount(<TransferList label="Cards" items={items} onChange={(v) => seen.push(v)} />);
    await act(async () => host.querySelector<HTMLElement>('.mh-transfer__panel--source [role=option]')!.click());
    expect(host.querySelector('.mh-transfer__count')!.textContent).toBe('1/2');
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Move selected to Selected"]')!.click());
    expect(seen).toEqual([['a']]);
    expect(host.querySelectorAll('.mh-transfer__panel--target [role=option]').length).toBe(1);
    const source = host.querySelector<HTMLElement>('.mh-transfer__panel--source [role=listbox]')!;
    await act(async () => source.focus());
    await press(source, 'Enter');
    expect(seen.at(-1)).toEqual(['a', 'b']);
    await unmount();
  });
});
