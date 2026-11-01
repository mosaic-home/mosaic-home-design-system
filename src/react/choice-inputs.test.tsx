import { act, useState, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createClickWheel, createRadialDial, createRangeSlider, createRating, createToggleGroup } from '../web/index.ts';
import { ClickWheel, RadialDial, RangeSlider, Rating, ToggleGroup } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const REF_ATTRS = new Set(['id', 'for', 'aria-describedby', 'aria-labelledby', 'name']);
const STATE_ATTRS = new Set(['value', 'checked', 'style']);

/** Tags, sorted attributes, inline style, text and live input state; generated ids by order of first appearance. */
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

const DAYS = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday', disabled: true },
  { value: 'wed', label: 'Wednesday', icon: 'calendar' },
];

describe('choice inputs: parity with the web renderer', () => {
  it('ToggleGroup', () => {
    same(<ToggleGroup label="Days" options={DAYS} values={['wed']} />, createToggleGroup({ label: 'Days', options: DAYS, values: ['wed'] }).el);
    const icons = [
      { value: 'list', label: 'List view', icon: 'menu', iconOnly: true },
      { value: 'grid', label: 'Grid view', icon: 'home', iconOnly: true },
    ];
    same(<ToggleGroup label="View" type="single" size="small" fullWidth options={icons} disabled />, createToggleGroup({ label: 'View', type: 'single', size: 'small', fullWidth: true, options: icons, disabled: true }).el);
  });

  it('RangeSlider', () => {
    const format = (v: number): string => `${v}°`;
    const marks = [
      { value: 16, label: 'Cool' },
      { value: 26, label: 'Warm' },
    ];
    same(
      <RangeSlider label="Comfort" min={16} max={26} step={0.5} value={[19, 23]} showValue format={format} marks={marks} names={['low', 'high']} />,
      createRangeSlider({ label: 'Comfort', min: 16, max: 26, step: 0.5, value: [19, 23], showValue: true, format, marks, names: ['low', 'high'] }).el,
    );
    same(<RangeSlider ariaLabel="Hours" value={[100, 100]} disabled />, createRangeSlider({ ariaLabel: 'Hours', value: [100, 100], disabled: true }).el);
  });

  it('RadialDial', () => {
    const format = (v: number): string => `${v}%`;
    same(<RadialDial label="Volume" value={40} format={format} ticks={11} size="large" />, createRadialDial({ label: 'Volume', value: 40, format, ticks: 11, size: 'large' }).el);
    same(<RadialDial ariaLabel="Direction" mode="angle" step={15} value={90} showValue={false} disabled />, createRadialDial({ ariaLabel: 'Direction', mode: 'angle', step: 15, value: 90, showValue: false, disabled: true }).el);
    same(<RadialDial ariaLabel="Empty" />, createRadialDial({ ariaLabel: 'Empty' }).el);
  });

  it('ClickWheel', () => {
    same(<ClickWheel label="Volume" value={3} max={10} detents={12} />, createClickWheel({ label: 'Volume', value: 3, max: 10, detents: 12 }).el);
    const center = { label: 'Confirm', icon: 'check' };
    same(<ClickWheel ariaLabel="Hour" max={24} wrap value={5} center={center} size="small" disabled />, createClickWheel({ ariaLabel: 'Hour', max: 24, wrap: true, value: 5, center, size: 'small', disabled: true }).el);
  });

  it('Rating', () => {
    same(<Rating label="Rating" value={3} name="r" />, createRating({ label: 'Rating', value: 3, name: 'r' }).el);
    same(<Rating label="Average" value={3.5} readOnly tone="warning" size="small" />, createRating({ label: 'Average', value: 3.5, readOnly: true, tone: 'warning', size: 'small' }).el);
    same(<Rating label="Love" value={0} max={3} icon="heart" emptyIcon="heart-outline" size="large" disabled name="x" />, createRating({ label: 'Love', value: 0, max: 3, icon: 'heart', emptyIcon: 'heart-outline', size: 'large', disabled: true, name: 'x' }).el);
  });
});

describe('choice inputs: behaviour', () => {
  let host: HTMLElement;
  let root: Root;
  beforeEach(() => {
    document.body.replaceChildren();
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
  });

  it('ToggleGroup toggles, moves focus and keeps the Tab stop', async () => {
    const seen: string[][] = [];
    await act(async () => root.render(<ToggleGroup label="Days" options={DAYS} defaultValues={['mon']} onChange={(v) => seen.push(v)} />));
    const buttons = [...host.querySelectorAll<HTMLButtonElement>('button')];
    await act(async () => buttons[2]!.click());
    expect(seen).toEqual([['mon', 'wed']]);
    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'true']);
    buttons[2]!.focus();
    await act(async () => {
      buttons[2]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    });
    expect(document.activeElement).toBe(buttons[0]);
    expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
  });

  it('Rating chooses and clears', async () => {
    function App() {
      const [value, setValue] = useState(2);
      return (
        <>
          <Rating label="Rating" value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    await act(async () => root.render(<App />));
    const inputs = [...host.querySelectorAll<HTMLInputElement>('input')];
    await act(async () => inputs[3]!.click());
    expect(host.querySelector('output')!.textContent).toBe('4');
    await act(async () => inputs[3]!.click());
    expect(host.querySelector('output')!.textContent).toBe('0');
    expect(inputs.some((i) => i.checked)).toBe(false);
  });

  it('RadialDial and ClickWheel step by key', async () => {
    const dial: number[] = [];
    const wheel: number[] = [];
    await act(async () =>
      root.render(
        <>
          <RadialDial ariaLabel="Volume" defaultValue={10} onValueCommit={(v) => dial.push(v)} />
          <ClickWheel ariaLabel="Channel" defaultValue={2} max={10} onValueCommit={(v) => wheel.push(v)} />
        </>,
      ),
    );
    const [d, w] = [...host.querySelectorAll<HTMLElement>('[role="slider"]')];
    await act(async () => {
      d!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      w!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    });
    expect(dial).toEqual([11]);
    expect(wheel).toEqual([10]);
    expect(d!.getAttribute('aria-valuenow')).toBe('11');
    expect(host.querySelector<HTMLElement>('.mh-click-wheel')!.style.getPropertyValue('--_turn')).toBe('150deg');
    await act(async () => {
      w!.dispatchEvent(new WheelEvent('wheel', { deltaY: 40, bubbles: true, cancelable: true }));
    });
    expect(wheel).toEqual([10, 9]);
  });

  it('RangeSlider keeps the thumbs apart', async () => {
    const seen: number[][] = [];
    await act(async () => root.render(<RangeSlider ariaLabel="Hours" defaultValue={[20, 60]} minGap={10} onValueChange={(v) => seen.push(v)} />));
    const low = host.querySelector<HTMLInputElement>('.mh-range-slider__input--low')!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(low, '90');
      low.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(seen).toEqual([[50, 60]]);
    expect(low.value).toBe('50');
  });
});
