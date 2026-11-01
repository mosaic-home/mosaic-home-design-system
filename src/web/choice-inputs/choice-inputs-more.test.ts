import { beforeEach, describe, expect, it } from 'vitest';
import {
  clampRange,
  clickWheelTurn,
  createClickWheel,
  createRadialDial,
  createRangeSlider,
  createRating,
  createToggleGroup,
  dialValueAt,
  dialLimits,
  nearestThumb,
  ratingFill,
  rotaryArc,
  rotaryClamp,
  rotaryKey,
  snapToStep,
  toggleGroupNext,
} from '../index.ts';

beforeEach(() => document.body.replaceChildren());

const mount = <T extends { el: Element }>(handle: T): T => {
  document.body.append(handle.el);
  return handle;
};
const key = (el: Element, k: string): void => void el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const OPTIONS = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday', disabled: true },
  { value: 'wed', label: 'Wednesday' },
];

describe('toggle group', () => {
  it('is a group of pressed-state buttons with one Tab stop', () => {
    const g = mount(createToggleGroup({ label: 'Days', options: OPTIONS, values: ['wed'] }));
    expect(g.el.getAttribute('role')).toBe('group');
    expect(g.el.getAttribute('aria-label')).toBe('Days');
    expect(g.buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
    expect(g.buttons.map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
    expect(g.buttons[1]!.disabled).toBe(true);
  });

  it('toggles several in multiple mode and reports the values', () => {
    let seen: string[] = [];
    const g = mount(createToggleGroup({ label: 'Days', options: OPTIONS, onChange: (v) => (seen = v) }));
    g.buttons[0]!.click();
    g.buttons[2]!.click();
    expect(seen).toEqual(['mon', 'wed']);
    g.buttons[0]!.click();
    expect(g.getValues()).toEqual(['wed']);
  });

  it('keeps one in single mode, and with required never none', () => {
    const changes: string[][] = [];
    const g = mount(createToggleGroup({ label: 'Align', type: 'single', required: true, options: OPTIONS, values: ['mon'], onChange: (v) => changes.push(v) }));
    g.buttons[2]!.click();
    expect(g.getValues()).toEqual(['wed']);
    g.buttons[2]!.click();
    expect(g.getValues()).toEqual(['wed']);
    expect(changes).toEqual([['wed']]);
    expect(toggleGroupNext(['a'], 'a', 'single')).toEqual([]);
  });

  it('moves focus with arrow keys, skipping disabled toggles', () => {
    const g = mount(createToggleGroup({ label: 'Days', options: OPTIONS }));
    g.buttons[0]!.focus();
    key(g.buttons[0]!, 'ArrowRight');
    expect(document.activeElement).toBe(g.buttons[2]);
    expect(g.buttons.map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
    key(g.buttons[2]!, 'ArrowRight');
    expect(document.activeElement).toBe(g.buttons[0]);
    key(g.buttons[0]!, 'End');
    expect(document.activeElement).toBe(g.buttons[2]);
  });

  it('names icon-only toggles', () => {
    const g = createToggleGroup({ label: 'View', options: [{ value: 'grid', label: 'Grid view', icon: 'home', iconOnly: true }] });
    expect(g.buttons[0]!.getAttribute('aria-label')).toBe('Grid view');
    expect(g.buttons[0]!.querySelector('.mh-toggle-group__label')).toBeNull();
    g.setDisabled(true);
    expect(g.buttons[0]!.disabled).toBe(true);
    expect(g.buttons[0]!.tabIndex).toBe(-1);
  });
});

describe('range slider', () => {
  it('keeps the range ordered and apart', () => {
    expect(clampRange([70, 30], 0, 100)).toEqual([70, 70]);
    expect(clampRange([70, 30], 0, 100, 0, 'low')).toEqual([30, 30]);
    expect(clampRange([50, 52], 0, 100, 5, 'low')).toEqual([47, 52]);
    expect(clampRange([50, 52], 0, 100, 5, 'high')).toEqual([50, 55]);
    expect(clampRange([-5, 120], 0, 100)).toEqual([0, 100]);
    expect(snapToStep(21.26, 0, 30, 0.5)).toBe(21.5);
    expect(nearestThumb(20, [10, 60])).toBe('low');
    expect(nearestThumb(80, [50, 50])).toBe('high');
  });

  it('is a labelled group of two native ranges with the fill position', () => {
    const r = mount(createRangeSlider({ label: 'Comfort', min: 16, max: 26, value: [19, 23], showValue: true, format: (v) => `${v}°` }));
    expect(r.el.getAttribute('role')).toBe('group');
    expect(r.el.getAttribute('aria-labelledby')).toBe(r.el.querySelector('.mh-range-slider__label')!.id);
    expect(r.inputs.map((i) => i.type)).toEqual(['range', 'range']);
    expect(r.inputs.map((i) => i.getAttribute('aria-label'))).toEqual(['Minimum', 'Maximum']);
    expect(r.inputs[0].getAttribute('aria-valuetext')).toBe('19°');
    expect(r.el.querySelector('.mh-range-slider__value')!.textContent).toBe('19° – 23°');
    expect(r.el.style.getPropertyValue('--_lo')).toBe('0.3');
    expect(r.el.style.getPropertyValue('--_hi')).toBe('0.7');
  });

  it('stops a thumb at the other one', () => {
    let seen: number[] = [];
    const r = mount(createRangeSlider({ ariaLabel: 'Hours', value: [20, 60], minGap: 10, onInput: (v) => (seen = v) }));
    r.inputs[0].value = '90';
    r.inputs[0].dispatchEvent(new Event('input'));
    expect(seen).toEqual([50, 60]);
    expect(r.inputs[0].value).toBe('50');
    r.setValue([95, 100]);
    expect(r.getValue()).toEqual([90, 100]);
    expect(r.el.classList.contains('is-low-on-top')).toBe(false);
    r.setValue([100, 100]);
    r.setDisabled(true);
    expect(r.inputs.every((i) => i.disabled)).toBe(true);
    expect(r.el.className).toBe('mh-range-slider is-disabled');
  });
});

describe('rotary helpers', () => {
  it('draws arcs and handles keys', () => {
    expect(rotaryArc(0, 0, 40)).toBe('M 50 10');
    expect(rotaryArc(0, 90, 40)).toBe('M 50 10 A 40 40 0 0 1 90 50');
    expect(rotaryArc(-135, 135, 40)).toContain(' 0 1 1 ');
    const limits = { min: 0, max: 10, step: 1 };
    expect(rotaryKey('ArrowUp', 10, limits)).toBe(10);
    expect(rotaryKey('PageDown', 5, { ...limits, bigStep: 3 })).toBe(2);
    expect(rotaryKey('End', 3, limits)).toBe(10);
    expect(rotaryKey('x', 3, limits)).toBeNull();
    expect(rotaryClamp(370, { min: 0, max: 360, step: 5, wrap: true })).toBe(10);
    expect(rotaryClamp(-5, { min: 0, max: 360, step: 5, wrap: true })).toBe(355);
    expect(rotaryKey('End', 0, { min: 0, max: 360, step: 5, wrap: true })).toBe(355);
  });
});

describe('radial dial', () => {
  it('maps angles to values, snapping the gap to the ends', () => {
    const limits = dialLimits({});
    expect(dialValueAt(0, limits)).toBe(50);
    expect(dialValueAt(135, limits)).toBe(100);
    expect(dialValueAt(170, limits)).toBe(100);
    expect(dialValueAt(190, limits)).toBe(0);
    // A drag from near max does not jump across the gap.
    expect(dialValueAt(225, limits, 98)).toBe(100);
    expect(dialValueAt(90, dialLimits({ mode: 'angle' }))).toBe(90);
  });

  it('is a keyboard slider with value text', () => {
    const changes: number[] = [];
    const d = mount(createRadialDial({ label: 'Volume', value: 40, step: 5, format: (v) => `${v}%`, ticks: 11, onChange: (v) => changes.push(v) }));
    expect(d.control.getAttribute('role')).toBe('slider');
    expect(d.control.getAttribute('aria-labelledby')).toBe(d.el.querySelector('.mh-dial__label')!.id);
    expect(d.control.getAttribute('aria-valuenow')).toBe('40');
    expect(d.control.getAttribute('aria-valuetext')).toBe('40%');
    expect(d.el.querySelectorAll('.mh-dial__tick')).toHaveLength(11);
    key(d.control, 'ArrowRight');
    key(d.control, 'PageUp');
    expect(changes).toEqual([45, 95]);
    expect(d.el.querySelector('.mh-dial__value')!.textContent).toBe('95%');
    d.setDisabled(true);
    expect(d.control.getAttribute('aria-disabled')).toBe('true');
    expect(d.control.tabIndex).toBe(-1);
    key(d.control, 'Home');
    expect(d.getValue()).toBe(95);
  });

  it('wraps in angle mode and draws a needle instead of a fill', () => {
    const d = createRadialDial({ ariaLabel: 'Direction', mode: 'angle', step: 15, value: 345 });
    expect(d.el.classList.contains('mh-dial--angle')).toBe(true);
    expect(d.el.querySelector('.mh-dial__fill')).toBeNull();
    expect(d.el.querySelector('.mh-dial__needle')).not.toBeNull();
    key(d.control, 'ArrowUp');
    expect(d.getValue()).toBe(0);
    expect(d.control.getAttribute('aria-valuemax')).toBe('360');
  });
});

describe('click wheel', () => {
  it('turns one detent per step, and shows the turn', () => {
    expect(clickWheelTurn(3, { min: 0, max: 10, step: 1 }, 24)).toBe(45);
    const w = mount(createClickWheel({ label: 'Volume', value: 3, max: 10 }));
    expect(w.wheel.getAttribute('role')).toBe('slider');
    expect(w.el.style.getPropertyValue('--_turn')).toBe('45deg');
    expect(w.el.querySelectorAll('.mh-click-wheel__tick')).toHaveLength(24);
    key(w.wheel, 'ArrowUp');
    expect(w.getValue()).toBe(4);
    expect(w.el.style.getPropertyValue('--_turn')).toBe('60deg');
  });

  it('steps on scroll and stops at the ends', () => {
    const seen: number[] = [];
    const w = mount(createClickWheel({ ariaLabel: 'Channel', value: 9, max: 10, onChange: (v) => seen.push(v) }));
    w.wheel.dispatchEvent(new WheelEvent('wheel', { deltaY: -40, cancelable: true }));
    expect(w.getValue()).toBe(10);
    const atEnd = new WheelEvent('wheel', { deltaY: -40, cancelable: true });
    w.wheel.dispatchEvent(atEnd);
    expect(atEnd.defaultPrevented).toBe(false);
    expect(seen).toEqual([10]);
  });

  it('has an optional centre button and wraps', () => {
    let pressed = 0;
    const w = mount(createClickWheel({ ariaLabel: 'Hour', min: 0, max: 24, wrap: true, value: 23, center: { label: 'Confirm', icon: 'check', onPress: () => (pressed += 1) } }));
    expect(w.el.querySelector('.mh-click-wheel__value')).toBeNull();
    expect(w.el.querySelector('.mh-click-wheel__progress')).toBeNull();
    w.center!.click();
    expect(pressed).toBe(1);
    key(w.wheel, 'ArrowRight');
    expect(w.getValue()).toBe(0);
    w.setDisabled(true);
    expect(w.center!.disabled).toBe(true);
  });
});

describe('rating', () => {
  it('fills stars to fractions', () => {
    expect([1, 2, 3, 4].map((n) => ratingFill(3.5, n))).toEqual([1, 1, 1, 0.5]);
  });

  it('is a radio group that reports and clears', () => {
    const seen: number[] = [];
    const r = mount(createRating({ label: 'Rating', value: 3, onChange: (v) => seen.push(v) }));
    expect(r.el.getAttribute('role')).toBe('radiogroup');
    expect(r.inputs).toHaveLength(5);
    expect(r.inputs[2]!.checked).toBe(true);
    expect(r.el.querySelectorAll('.mh-visually-hidden')[0]!.textContent).toBe('1 star');
    r.inputs[4]!.click();
    expect(r.getValue()).toBe(5);
    r.inputs[4]!.click();
    expect(r.getValue()).toBe(0);
    expect(r.inputs.some((i) => i.checked)).toBe(false);
    expect(seen).toEqual([5, 0]);
    expect((r.el.children[0] as HTMLElement).style.getPropertyValue('--_fill')).toBe('0');
  });

  it('is one image when read-only', () => {
    const r = createRating({ label: 'Average', value: 4.25, readOnly: true, max: 5, tone: 'warning' });
    expect(r.el.getAttribute('role')).toBe('img');
    expect(r.el.getAttribute('aria-label')).toBe('Average: 4.3 out of 5 stars');
    expect(r.inputs).toHaveLength(0);
    expect(r.el.className).toBe('mh-rating mh-rating--readonly mh-rating--warning');
    expect((r.el.children[4] as HTMLElement).style.getPropertyValue('--_fill')).toBe('0.25');
  });
});
