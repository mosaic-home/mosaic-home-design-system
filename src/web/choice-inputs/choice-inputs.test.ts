import { beforeEach, describe, expect, it } from 'vitest';
import {
  clampStep,
  createCheckbox,
  createCheckboxGroup,
  createChip,
  createChipGroup,
  createRadioGroup,
  createSegmentedControl,
  createSlider,
  createStepper,
  createSwitch,
  sliderPosition,
} from '../index.ts';

beforeEach(() => document.body.replaceChildren());

/** Native clicks toggle and fire `change` only on connected inputs. */
const mount = <T extends { el: Element }>(handle: T): T => {
  document.body.append(handle.el);
  return handle;
};
const key = (el: Element, k: string): void => void el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('checkbox', () => {
  it('is a labelled native checkbox with a description', () => {
    const c = createCheckbox({ label: 'Notify', description: 'When the door opens', checked: true });
    expect(c.el.tagName).toBe('LABEL');
    expect(c.input.type).toBe('checkbox');
    expect(c.isChecked()).toBe(true);
    const desc = c.el.querySelector('.mh-checkbox__description')!;
    expect(c.input.getAttribute('aria-describedby')).toBe(desc.id);
  });

  it('supports indeterminate and reports changes', () => {
    let seen: boolean | null = null;
    const c = mount(createCheckbox({ label: 'All', indeterminate: true, onChange: (v) => (seen = v) }));
    expect(c.input.indeterminate).toBe(true);
    c.input.click();
    expect(seen).toBe(true);
    c.setIndeterminate(true);
    expect(c.input.indeterminate).toBe(true);
  });

  it('groups in a fieldset', () => {
    let values: string[] = [];
    const g = mount(createCheckboxGroup({ legend: 'Days', values: ['sat'], options: [{ value: 'sat', label: 'Sat' }, { value: 'sun', label: 'Sun' }], onChange: (v) => (values = v) }));
    expect(g.el.tagName).toBe('FIELDSET');
    expect(g.el.querySelector('legend')!.textContent).toBe('Days');
    g.checkboxes[1]!.input.click();
    expect(values).toEqual(['sat', 'sun']);
    g.setDisabled(true);
    expect(g.el.disabled).toBe(true);
  });
});

describe('radio group', () => {
  it('shares a name and reports the value', () => {
    let seen = '';
    const g = mount(createRadioGroup({ legend: 'Mode', value: 'b', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], onChange: (v) => (seen = v) }));
    expect(new Set(g.inputs.map((i) => i.name)).size).toBe(1);
    expect(g.getValue()).toBe('b');
    g.inputs[0]!.click();
    expect(seen).toBe('a');
    g.setValue('b');
    expect(g.inputs[1]!.checked).toBe(true);
  });

  it('hides the legend visually only', () => {
    const g = createRadioGroup({ legend: 'Mode', hideLegend: true, inline: true, options: [] });
    expect(g.el.className).toBe('mh-choice-group mh-choice-group--inline');
    expect(g.el.querySelector('legend')!.className).toBe('mh-choice-group__legend mh-visually-hidden');
  });
});

describe('switch', () => {
  it('is a native checkbox with role switch', () => {
    let seen = false;
    const s = mount(createSwitch({ label: 'Lights', row: true, icon: 'lightbulb', onChange: (v) => (seen = v) }));
    expect(s.el.className).toBe('mh-switch mh-switch--row');
    expect(s.input.type).toBe('checkbox');
    expect(s.input.getAttribute('role')).toBe('switch');
    s.input.click();
    expect(seen).toBe(true);
    expect(s.isChecked()).toBe(true);
  });

  it('needs an aria-label without a visible label', () => {
    const s = createSwitch({ ariaLabel: 'Fan' });
    expect(s.input.getAttribute('aria-label')).toBe('Fan');
    expect(s.el.querySelector('.mh-switch__text')).toBeNull();
  });
});

describe('segmented control', () => {
  it('is a radiogroup of native radios', () => {
    let seen = '';
    const s = mount(createSegmentedControl({
      label: 'Range',
      value: 'day',
      options: [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week', icon: 'calendar', iconOnly: true },
      ],
      onChange: (v) => (seen = v),
    }));
    expect(s.el.getAttribute('role')).toBe('radiogroup');
    expect(s.el.getAttribute('aria-label')).toBe('Range');
    expect(s.inputs.every((i) => i.type === 'radio' && i.name === s.inputs[0]!.name)).toBe(true);
    expect(s.inputs[1]!.getAttribute('aria-label')).toBe('Week');
    s.inputs[1]!.click();
    expect(seen).toBe('week');
    expect(s.getValue()).toBe('week');
  });

  it('keeps disabled options disabled when re-enabled', () => {
    const s = createSegmentedControl({ label: 'x', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', disabled: true }], disabled: true });
    expect(s.inputs.every((i) => i.disabled)).toBe(true);
    s.setDisabled(false);
    expect(s.inputs.map((i) => i.disabled)).toEqual([false, true]);
  });
});

describe('chip', () => {
  it('toggles aria-pressed when selectable', () => {
    let seen = false;
    const c = createChip({ label: 'Lights', selectable: true, onToggle: (v) => (seen = v) });
    expect(c.el.tagName).toBe('BUTTON');
    expect(c.el.getAttribute('aria-pressed')).toBe('false');
    (c.el as HTMLButtonElement).click();
    expect(c.el.getAttribute('aria-pressed')).toBe('true');
    expect(seen).toBe(true);
  });

  it('has a named remove button', () => {
    let removed = 0;
    const c = createChip({ label: 'Kitchen', removable: true, onRemove: () => removed++ });
    expect(c.el.className).toBe('mh-chip mh-chip--removable');
    expect(c.button!.getAttribute('aria-label')).toBe('Remove Kitchen');
    c.button!.click();
    expect(removed).toBe(1);
  });

  it('keeps one chip pressed in a single-selection group', () => {
    let values: string[] = [];
    const g = createChipGroup({ label: 'Scene', selection: 'single', values: ['a'], chips: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], onChange: (v) => (values = v) });
    const [a, b] = [...g.el.querySelectorAll<HTMLButtonElement>('.mh-chip')];
    b!.click();
    expect(values).toEqual(['b']);
    expect(a!.getAttribute('aria-pressed')).toBe('false');
    expect(b!.getAttribute('aria-pressed')).toBe('true');
  });

  it('removes a chip and moves focus to its neighbour', () => {
    const removed: string[] = [];
    const g = createChipGroup({ label: 'Rooms', selection: 'none', removable: true, chips: ['a', 'b', 'c'].map((v) => ({ value: v, label: v })), onRemove: (v) => removed.push(v) });
    document.body.append(g.el);
    g.el.querySelectorAll<HTMLButtonElement>('.mh-chip__remove')[1]!.click();
    expect(removed).toEqual(['b']);
    expect(g.el.querySelectorAll('.mh-chip').length).toBe(2);
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove c');
    g.el.querySelectorAll<HTMLButtonElement>('.mh-chip__remove')[1]!.click();
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove a');
    g.el.querySelector<HTMLButtonElement>('.mh-chip__remove')!.click();
    expect(document.activeElement).toBe(g.el);
  });
});

describe('slider', () => {
  it('positions the fill and formats the value', () => {
    const s = createSlider({ label: 'Brightness', value: 25, showValue: true, format: (v) => `${v}%` });
    expect(s.input.type).toBe('range');
    expect(s.input.style.getPropertyValue('--_at')).toBe('0.25');
    expect(s.input.getAttribute('aria-valuetext')).toBe('25%');
    expect(s.el.querySelector('output')!.textContent).toBe('25%');
    expect(s.el.querySelector('label')!.htmlFor).toBe(s.input.id);
    s.setValue(80);
    expect(s.input.style.getPropertyValue('--_at')).toBe('0.8');
  });

  it('clamps positions', () => {
    expect(sliderPosition(150, 0, 100)).toBe(1);
    expect(sliderPosition(2000, 2000, 6500)).toBe(0);
    expect(sliderPosition(5, 5, 5)).toBe(0);
  });

  it('renders marks', () => {
    const s = createSlider({ ariaLabel: 'x', marks: [{ value: 0, label: 'Low' }, { value: 100, label: 'High' }] });
    const marks = s.el.querySelectorAll<HTMLElement>('.mh-slider__mark');
    expect(marks.length).toBe(2);
    expect(marks[1]!.style.getPropertyValue('--_at')).toBe('1');
  });
});

describe('stepper', () => {
  it('is a spinbutton with pointer-only buttons', () => {
    const s = createStepper({ label: 'Guests', value: 2, min: 1, max: 3 });
    expect(s.spinbutton.getAttribute('role')).toBe('spinbutton');
    expect(s.spinbutton.getAttribute('aria-valuenow')).toBe('2');
    expect(s.spinbutton.getAttribute('aria-valuemin')).toBe('1');
    expect(s.spinbutton.tabIndex).toBe(0);
    const [dec, inc] = [...s.el.querySelectorAll('button')];
    expect(dec!.tabIndex).toBe(-1);
    inc!.click();
    expect(s.getValue()).toBe(3);
    expect(inc!.disabled).toBe(true);
    dec!.click();
    dec!.click();
    expect(s.getValue()).toBe(1);
    expect(dec!.disabled).toBe(true);
  });

  it('follows arrow keys, Home and End', () => {
    const values: number[] = [];
    const s = createStepper({ label: 'Temp', value: 20, min: 16, max: 28, step: 0.5, format: (v) => `${v}°`, onChange: (v) => values.push(v) });
    key(s.spinbutton, 'ArrowUp');
    key(s.spinbutton, 'ArrowRight');
    key(s.spinbutton, 'ArrowDown');
    key(s.spinbutton, 'End');
    key(s.spinbutton, 'Home');
    expect(values).toEqual([20.5, 21, 20.5, 28, 16]);
    expect(s.spinbutton.getAttribute('aria-valuetext')).toBe('16°');
    s.setDisabled(true);
    key(s.spinbutton, 'ArrowUp');
    expect(s.getValue()).toBe(16);
    expect(s.spinbutton.getAttribute('aria-disabled')).toBe('true');
  });

  it('clamps and snaps', () => {
    expect(clampStep(7, 0, 10, 5)).toBe(5);
    expect(clampStep(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
    expect(clampStep(99, 0, 10)).toBe(10);
  });
});
