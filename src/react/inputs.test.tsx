import { act, useState, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  createCheckbox,
  createCheckboxGroup,
  createChip,
  createChipGroup,
  createField,
  createRadioGroup,
  createSearchField,
  createSegmentedControl,
  createSelect,
  createSlider,
  createStepper,
  createSwitch,
  createTextArea,
  createTextField,
} from '../web/index.ts';
import { Checkbox, CheckboxGroup, Chip, ChipGroup, Field, RadioGroup, SearchField, SegmentedControl, Select, Slider, Stepper, Switch, TextArea, TextField } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const REF_ATTRS = new Set(['id', 'for', 'aria-describedby', 'aria-labelledby', 'name']);
const STATE_ATTRS = new Set(['value', 'checked', 'selected', 'style']);

/**
 * A comparable form of a DOM tree: tags, sorted attributes, text, and live state (value, checked) read from the
 * properties. Generated ids are replaced by their order of first appearance, so the wiring (label `for`,
 * `aria-describedby`) is compared too, not just the classes.
 */
function shape(root: Element): string {
  const ids = new Map<string, string>();
  const ref = (v: string): string =>
    v
      .split(' ')
      .map((part) => {
        if (!ids.has(part)) ids.set(part, `#${ids.size + 1}`);
        return ids.get(part)!;
      })
      .join(' ');
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').trim();
    if (!(node instanceof Element)) return '';
    const attrs = [...node.attributes]
      .filter((a) => !STATE_ATTRS.has(a.name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => `${a.name}=${REF_ATTRS.has(a.name) ? ref(a.value) : a.value}`);
    const style = node.getAttribute('style');
    if (style) attrs.push(`style=${style.replace(/\s+/g, '').replace(/;$/, '')}`);
    if (node instanceof HTMLInputElement) attrs.push(`.value=${node.value}`, `.checked=${node.checked}`);
    if (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement) attrs.push(`.value=${node.value}`);
    // A textarea's text is its value, compared above.
    const children = node instanceof HTMLTextAreaElement ? '' : [...node.childNodes].map(walk).filter(Boolean).join('');
    return `<${node.tagName.toLowerCase()} ${attrs.join(' ')}>${children}</>`;
  };
  return walk(root);
}

function fromReact(element: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(element);
  return div.firstElementChild!;
}

const same = (element: ReactElement, web: Element): void => expect(shape(fromReact(element))).toBe(shape(web));

describe('text inputs: parity with the web renderer', () => {
  it('Field', () => {
    const input = document.createElement('input');
    input.className = 'mh-input__control';
    same(
      <Field label="Name" helper="Shown on tiles." required>
        {(control) => <input {...control} className="mh-input__control" />}
      </Field>,
      createField({ label: 'Name', control: input, helper: 'Shown on tiles.', required: true }).el,
    );
  });

  it('Field around a group control', () => {
    const box = document.createElement('div');
    same(
      <Field label="Guests" group error="Too many" labelStyle="eyebrow">
        {(control) => <div {...control} />}
      </Field>,
      createField({ label: 'Guests', control: box, error: 'Too many', labelStyle: 'eyebrow' }).el,
    );
  });

  it('TextField', () => {
    same(
      <TextField label="Radius" icon="home" prefix="~" suffix="km" size="large" defaultValue="5" maxLength={10} showCount error="Too far" required placeholder="0" />,
      createTextField({ label: 'Radius', icon: 'home', prefix: '~', suffix: 'km', size: 'large', value: '5', maxLength: 10, showCount: true, error: 'Too far', required: true, placeholder: '0' }).el,
    );
    same(<TextField aria-label="Bare" disabled />, createTextField({ ariaLabel: 'Bare', disabled: true }).el);
  });

  it('TextArea', () => {
    same(<TextArea label="Notes" defaultValue="Hi" maxLength={140} showCount rows={2} helper="Grows" />, createTextArea({ label: 'Notes', value: 'Hi', maxLength: 140, showCount: true, rows: 2, helper: 'Grows' }).el);
  });

  it('SearchField', () => {
    same(<SearchField placeholder="Find" defaultValue="lamp" size="small" />, createSearchField({ placeholder: 'Find', value: 'lamp', size: 'small' }).el);
    same(<SearchField landmark />, createSearchField({ landmark: true }).el);
  });

  it('Select', () => {
    const options = [{ value: 'a', label: 'A' }, { label: 'More', options: [{ value: 'b', label: 'B', disabled: true }] }];
    same(<Select label="Room" options={options} placeholder="Choose" helper="Pick one" />, createSelect({ label: 'Room', options, placeholder: 'Choose', helper: 'Pick one' }).el);
    same(<Select aria-label="Room" options={options} value="a" onChange={() => {}} disabled size="small" />, createSelect({ ariaLabel: 'Room', options, value: 'a', disabled: true, size: 'small' }).el);
  });
});

describe('choice inputs: parity with the web renderer', () => {
  it('Checkbox', () => {
    same(<Checkbox label="Notify" description="When the door opens" defaultChecked />, createCheckbox({ label: 'Notify', description: 'When the door opens', checked: true }).el);
    same(<Checkbox aria-label="Bare" disabled />, createCheckbox({ ariaLabel: 'Bare', disabled: true }).el);
  });

  it('CheckboxGroup and RadioGroup', () => {
    const options = [{ value: 'a', label: 'A', description: 'First' }, { value: 'b', label: 'B', disabled: true }];
    same(<CheckboxGroup legend="Days" options={options} defaultValues={['a']} inline />, createCheckboxGroup({ legend: 'Days', options, values: ['a'], inline: true }).el);
    same(<RadioGroup legend="Mode" options={options} defaultValue="a" hideLegend disabled />, createRadioGroup({ legend: 'Mode', options, value: 'a', hideLegend: true, disabled: true }).el);
  });

  it('Switch', () => {
    same(<Switch label="Motion" description="Turns lights on" row icon="lightbulb" defaultChecked />, createSwitch({ label: 'Motion', description: 'Turns lights on', row: true, icon: 'lightbulb', checked: true }).el);
    same(<Switch aria-label="Fan" />, createSwitch({ ariaLabel: 'Fan' }).el);
  });

  it('SegmentedControl', () => {
    const options = [
      { value: 'day', label: 'Day', icon: 'calendar' },
      { value: 'week', label: 'Week', icon: 'menu', iconOnly: true },
      { value: 'month', label: 'Month', disabled: true },
    ];
    same(<SegmentedControl label="Range" options={options} defaultValue="week" size="small" fullWidth />, createSegmentedControl({ label: 'Range', options, value: 'week', size: 'small', fullWidth: true }).el);
  });

  it('Chip and ChipGroup', () => {
    same(<Chip label="Lights" icon="lightbulb" selectable selected />, createChip({ label: 'Lights', icon: 'lightbulb', selectable: true, selected: true }).el);
    same(<Chip label="Kitchen" removable disabled />, createChip({ label: 'Kitchen', removable: true, disabled: true }).el);
    const chips = [{ value: 'mon', label: 'M', ariaLabel: 'Monday' }, { value: 'tue', label: 'T', ariaLabel: 'Tuesday' }];
    same(<ChipGroup label="Repeat" chips={chips} defaultValues={['mon']} />, createChipGroup({ label: 'Repeat', chips, values: ['mon'] }).el);
    same(<ChipGroup label="Rooms" chips={chips} selection="none" removable />, createChipGroup({ label: 'Rooms', chips, selection: 'none', removable: true }).el);
  });

  it('Slider', () => {
    const marks = [{ value: 0, label: 'Low' }, { value: 100, label: 'High' }];
    const format = (v: number) => `${v}%`;
    same(<Slider label="Brightness" defaultValue={40} showValue format={format} marks={marks} />, createSlider({ label: 'Brightness', value: 40, showValue: true, format, marks }).el);
    same(<Slider aria-label="Volume" min={10} max={20} step={2} defaultValue={12} disabled />, createSlider({ ariaLabel: 'Volume', min: 10, max: 20, step: 2, value: 12, disabled: true }).el);
  });

  it('Stepper', () => {
    const format = (v: number) => `${v}°`;
    same(<Stepper label="Temp" defaultValue={16} min={16} max={28} step={0.5} format={format} size="small" />, createStepper({ label: 'Temp', value: 16, min: 16, max: 28, step: 0.5, format, size: 'small' }).el);
    same(<Stepper label="Guests" defaultValue={2} disabled />, createStepper({ label: 'Guests', value: 2, disabled: true }).el);
  });
});

describe('controlled inputs', () => {
  async function mount(element: ReactElement) {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(element));
    return { host, unmount: () => act(async () => root.unmount()) };
  }

  it('Switch follows checked / onChange', async () => {
    function Demo() {
      const [on, setOn] = useState(false);
      return <Switch label="Lights" checked={on} onChange={(e) => setOn(e.target.checked)} />;
    }
    const { host, unmount } = await mount(<Demo />);
    const input = host.querySelector('input')!;
    await act(async () => input.click());
    expect(input.checked).toBe(true);
    await unmount();
  });

  it('Checkbox sets indeterminate', async () => {
    const { host, unmount } = await mount(<Checkbox label="All" indeterminate />);
    expect(host.querySelector('input')!.indeterminate).toBe(true);
    await unmount();
  });

  it('SearchField clears with the button', async () => {
    const seen: string[] = [];
    const { host, unmount } = await mount(<SearchField defaultValue="lamp" onValueChange={(v) => seen.push(v)} />);
    const button = host.querySelector('button')!;
    expect(button.hidden).toBe(false);
    await act(async () => button.click());
    expect(host.querySelector('input')!.value).toBe('');
    expect(button.hidden).toBe(true);
    expect(seen).toEqual(['']);
    await unmount();
  });

  it('Stepper steps with keys and buttons', async () => {
    const seen: number[] = [];
    const { host, unmount } = await mount(<Stepper label="Guests" defaultValue={1} max={3} onChange={(v) => seen.push(v)} />);
    const spin = host.querySelector<HTMLElement>('[role=spinbutton]')!;
    await act(async () => void spin.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })));
    await act(async () => host.querySelectorAll('button')[1]!.click());
    expect(seen).toEqual([2, 3]);
    expect(spin.getAttribute('aria-valuenow')).toBe('3');
    expect(host.querySelectorAll('button')[1]!.disabled).toBe(true);
    await unmount();
  });

  it('ChipGroup moves focus after a removal', async () => {
    function Demo() {
      const [chips, setChips] = useState(['a', 'b', 'c'].map((v) => ({ value: v, label: v })));
      return <ChipGroup label="Rooms" selection="none" removable chips={chips} onRemove={(v) => setChips((c) => c.filter((x) => x.value !== v))} />;
    }
    const { host, unmount } = await mount(<Demo />);
    await act(async () => host.querySelectorAll('button')[1]!.click());
    expect(host.querySelectorAll('.mh-chip').length).toBe(2);
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove c');
    await unmount();
  });
});
