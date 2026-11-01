import { act, useState, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCalendar } from '../web/pickers/calendar.ts';
import { createColorPicker } from '../web/pickers/colorPicker.ts';
import { createDatePicker } from '../web/pickers/datePicker.ts';
import { createDateRangePicker } from '../web/pickers/dateRangePicker.ts';
import { createDateTimeField } from '../web/pickers/dateTimeField.ts';
import { createFileDropZone } from '../web/pickers/fileDropZone.ts';
import { createGradientEditor } from '../web/pickers/gradientEditor.ts';
import { createIconPicker } from '../web/pickers/iconPicker.ts';
import { Calendar, ColorPicker, DatePicker, DateRangePicker, DateTimeField, FileDropZone, GradientEditor, IconPicker } from './pickers.tsx';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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

const IDREFS = new Set(['aria-labelledby', 'aria-describedby', 'aria-controls']);

/** Tag, classes, role, ARIA (id references reduced to a count), `hidden`, tabindex and own text, in document order. */
function shape(el: Element): string[] {
  const out: string[] = [];
  const walk = (node: Element): void => {
    const attrs = Array.from(node.attributes)
      .filter((a) => a.name === 'class' || a.name === 'role' || a.name === 'hidden' || a.name === 'tabindex' || a.name === 'type' || a.name.startsWith('aria-'))
      .map((a) => `${a.name}=${IDREFS.has(a.name) ? `ref×${a.value.split(' ').length}` : a.value}`)
      .sort();
    const text = Array.from(node.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('');
    out.push(`${node.tagName.toLowerCase()} ${attrs.join(' ')} ${text}`.trim());
    Array.from(node.children).forEach(walk);
  };
  walk(el);
  return out;
}

function ssr(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  return div.firstElementChild!;
}

/** The widget a React binding mounted in its host. */
const mounted = (): Element => host.querySelector('.mh-picker-host')!.firstElementChild!;

describe('pickers parity', () => {
  it('DateTimeField renders the web DOM', () => {
    expect(shape(ssr(<DateTimeField label="Wake up" type="time" value="07:30" onChange={() => {}} helper="Weekdays only." />))).toEqual(
      shape(createDateTimeField({ label: 'Wake up', type: 'time', value: '07:30', helper: 'Weekdays only.' }).el),
    );
    expect(shape(ssr(<DateTimeField aria-label="Day" type="date" icon={false} disabled />))).toEqual(shape(createDateTimeField({ ariaLabel: 'Day', type: 'date', icon: false, disabled: true }).el));
    expect(shape(ssr(<DateTimeField label="Starts" type="datetime-local" error="Pick a time in the future." required />))).toEqual(
      shape(createDateTimeField({ label: 'Starts', type: 'datetime-local', error: 'Pick a time in the future.', required: true }).el),
    );
  });

  it('imperative pickers mount the web DOM', async () => {
    const cases: [ReactElement, () => Element][] = [
      [<Calendar value="2026-10-16" today="2026-10-14" locale="en-GB" weekStartsOn={1} />, () => createCalendar({ value: '2026-10-16', today: '2026-10-14', locale: 'en-GB', weekStartsOn: 1 }).el],
      [<DatePicker label="Holiday" value="2026-10-16" locale="en-GB" clearable />, () => createDatePicker({ label: 'Holiday', value: '2026-10-16', locale: 'en-GB', clearable: true }).el],
      [<DateRangePicker ariaLabel="Stay" locale="en-GB" value={{ start: '2026-10-01', end: '2026-10-03' }} />, () => createDateRangePicker({ ariaLabel: 'Stay', locale: 'en-GB', value: { start: '2026-10-01', end: '2026-10-03' } }).el],
      [<ColorPicker value="#3366cc" alpha swatches={['#ff0000', '#00ff00']} />, () => createColorPicker({ value: '#3366cc', alpha: true, swatches: ['#ff0000', '#00ff00'] }).el],
      [<GradientEditor stops={[{ offset: 0, color: '#000000' }, { offset: 100, color: '#ffffff' }]} showAngle />, () => createGradientEditor({ stops: [{ offset: 0, color: '#000000' }, { offset: 100, color: '#ffffff' }], showAngle: true }).el],
      [<IconPicker icons={['home', 'lightbulb', 'fan']} value="fan" allowNone />, () => createIconPicker({ icons: ['home', 'lightbulb', 'fan'], value: 'fan', allowNone: true }).el],
      [<FileDropZone hint="Images up to 5 MB" accept="image/*" />, () => createFileDropZone({ hint: 'Images up to 5 MB', accept: 'image/*' }).el],
    ];
    for (const [node, web] of cases) {
      await act(async () => root.render(node));
      expect(shape(mounted())).toEqual(shape(web()));
      await act(async () => root.render(<></>));
    }
  });
});

describe('pickers behaviour', () => {
  it('DatePicker follows value and reports picks', async () => {
    const picks: (string | null)[] = [];
    function App() {
      const [value, setValue] = useState<string | null>('2026-10-16');
      return (
        <>
          <DatePicker
            label="Day"
            locale="en-GB"
            value={value}
            onChange={(v) => {
              picks.push(v);
              setValue(v);
            }}
          />
          <button className="probe-reset" onClick={() => setValue('2026-01-02')}>
            Reset
          </button>
        </>
      );
    }
    await act(async () => root.render(<App />));
    const trigger = host.querySelector<HTMLButtonElement>('.mh-picker-trigger')!;
    expect(trigger.textContent).toContain('16 Oct 2026');
    await act(async () => trigger.click());
    await act(async () => document.querySelector<HTMLButtonElement>('.mh-calendar__day[data-date="2026-10-20"]')!.click());
    expect(picks).toEqual(['2026-10-20']);
    expect(trigger.textContent).toContain('20 Oct 2026');
    await act(async () => host.querySelector<HTMLButtonElement>('.probe-reset')!.click());
    expect(trigger.textContent).toContain('2 Jan 2026');
  });

  it('ColorPicker and IconPicker follow value', async () => {
    const colours: string[] = [];
    function App({ colour, icon }: { colour: string; icon: string }) {
      return (
        <>
          <ColorPicker value={colour} swatches={false} onChange={(v) => colours.push(v)} />
          <IconPicker icons={['home', 'fan']} value={icon} />
        </>
      );
    }
    await act(async () => root.render(<App colour="#ff0000" icon="home" />));
    const hex = host.querySelector<HTMLInputElement>('.mh-color-picker__hex')!;
    expect(hex.value).toBe('ff0000');
    await act(async () => root.render(<App colour="#00ff00" icon="fan" />));
    expect(hex.value).toBe('00ff00');
    expect(host.querySelector('[data-name="fan"]')!.getAttribute('aria-selected')).toBe('true');
    hex.value = '123456';
    await act(async () => hex.dispatchEvent(new Event('change')));
    expect(colours).toEqual(['#123456']);
  });

  it('DateTimeField is a controlled input', async () => {
    const seen: string[] = [];
    function App() {
      const [v, setV] = useState('07:30');
      return (
        <DateTimeField
          label="Alarm"
          type="time"
          value={v}
          onChange={(e) => {
            seen.push(e.target.value);
            setV(e.target.value);
          }}
        />
      );
    }
    await act(async () => root.render(<App />));
    const input = host.querySelector<HTMLInputElement>('input[type="time"]')!;
    expect(input.value).toBe('07:30');
    expect(host.querySelector('label')!.htmlFor).toBe(input.id);
  });
});
