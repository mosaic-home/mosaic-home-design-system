import { mdiBed, mdiCoffeeOutline, mdiDoorOpen, mdiFlowerOutline, mdiGarage, mdiSilverwareForkKnife, mdiSofaOutline, mdiStove, mdiTelevision, mdiWashingMachine } from '@mdi/js';
import { h } from '../../../src/web/dom.ts';
import { createColorPicker } from '../../../src/web/pickers/colorPicker.ts';
import { createDatePicker } from '../../../src/web/pickers/datePicker.ts';
import { createDateRangePicker } from '../../../src/web/pickers/dateRangePicker.ts';
import { addDays, formatDate, formatDateRange, todayIso, weekdayOf } from '../../../src/web/pickers/dates.ts';
import { createDateTimeField } from '../../../src/web/pickers/dateTimeField.ts';
import { createFileDropZone, formatFileSize } from '../../../src/web/pickers/fileDropZone.ts';
import { createGradientEditor } from '../../../src/web/pickers/gradientEditor.ts';
import { createIconPicker, iconLabel } from '../../../src/web/pickers/iconPicker.ts';
import type { Story } from './types.ts';

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack', style: 'max-width: 420px' }, ...children);
const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row', style: 'align-items: flex-start' }, ...children);
const note = (text: string): HTMLParagraphElement => h('p', { class: 'mh-text--caption mh-text--muted', 'aria-live': 'polite' }, text);
const heading = (text: string): HTMLElement => h('p', { class: 'mh-text--eyebrow mh-text--muted' }, text);

/** The coming Saturday and Sunday (just today when it is Sunday). */
function weekend(today: string): { start: string; end: string } {
  const wd = weekdayOf(today);
  if (wd === 0) return { start: today, end: today };
  const sat = addDays(today, 6 - wd);
  return { start: sat, end: addDays(sat, 1) };
}

export const pickersStories: Story[] = [
  {
    id: 'date-time-field',
    render: () => {
      const out = note('Change a value to see it here.');
      const report =
        (what: string) =>
        (value: string): void => {
          out.textContent = `${what}: ${value || '(empty)'}`;
        };
      return stack(
        createDateTimeField({ label: 'Holiday starts', type: 'date', value: '2026-12-21', helper: 'The heating stays in away mode until you are back.', onChange: report('Date') }).el,
        createDateTimeField({ label: 'Wake-up light', type: 'time', value: '06:45', step: 60, onChange: report('Time') }).el,
        createDateTimeField({ label: 'Delivery window', type: 'datetime-local', value: '2026-10-20T14:00', labelStyle: 'eyebrow', onChange: report('Date and time') }).el,
        row(
          createDateTimeField({ label: 'Billing month', type: 'month', value: '2026-10', size: 'small', onChange: report('Month') }).el,
          createDateTimeField({ label: 'Rota week', type: 'week', value: '2026-W43', size: 'small', onChange: report('Week') }).el,
        ),
        createDateTimeField({ label: 'Filter changed', type: 'date', value: '2099-01-01', max: todayIso(), error: 'That date is still to come.', required: true }).el,
        createDateTimeField({ label: 'Installed', type: 'date', value: '2024-03-08', disabled: true }).el,
        createDateTimeField({ ariaLabel: 'Quiet hours start', type: 'time', value: '22:00', icon: false, size: 'large' }).el,
        out,
      );
    },
  },
  {
    id: 'date-picker',
    render: () => {
      const today = todayIso();
      const out = note('Nothing picked yet.');
      const basic = createDatePicker({
        label: 'Visit date',
        value: addDays(today, 3),
        clearable: true,
        helper: 'Arrow keys move by day and week, Page Up and Page Down by month.',
        onChange: (v) => (out.textContent = v ? `Picked ${formatDate(v, undefined, { dateStyle: 'full' })}.` : 'Cleared.'),
      });
      const weekdays = createDatePicker({
        label: 'Cleaning day',
        placeholder: 'Any weekday in the next two months',
        min: today,
        max: addDays(today, 60),
        isDateDisabled: (d) => weekdayOf(d) === 0 || weekdayOf(d) === 6,
        format: { weekday: 'long', day: 'numeric', month: 'long' },
        labelStyle: 'eyebrow',
      });
      return stack(
        basic.el,
        out,
        weekdays.el,
        createDatePicker({ label: 'Liefertermin (de-DE)', locale: 'de-DE', value: today, size: 'small' }).el,
        createDatePicker({ label: 'Bin collection (en-US, weeks from Sunday)', locale: 'en-US', value: today }).el,
        createDatePicker({ label: 'Warranty ends', value: '2027-05-31', error: 'The warranty has to end after the purchase date.' }).el,
        createDatePicker({ label: 'Commissioned', value: '2025-02-14', disabled: true }).el,
      );
    },
  },
  {
    id: 'date-range-picker',
    render: () => {
      const today = todayIso();
      const out = note('Pick a start and an end date.');
      const away = createDateRangePicker({
        label: 'Away from home',
        clearable: true,
        presets: [
          { label: 'This weekend', range: weekend(today) },
          { label: 'Next 7 days', range: { start: today, end: addDays(today, 6) } },
          { label: 'Next 14 days', range: { start: today, end: addDays(today, 13) } },
        ],
        min: today,
        helper: 'The house runs in away mode on these days.',
        onChange: (v) => (out.textContent = v ? `${formatDateRange(v.start, v.end, undefined, { dateStyle: 'long' })}.` : 'Cleared.'),
      });
      const history = createDateRangePicker({ label: 'Energy history', months: 1, max: today, value: { start: addDays(today, -6), end: today }, labelStyle: 'eyebrow', size: 'small' });
      return stack(away.el, out, history.el, createDateRangePicker({ label: 'Guest access', disabled: true, value: { start: '2026-08-01', end: '2026-08-04' } }).el);
    },
  },
  {
    id: 'color-picker',
    render: () => {
      const out = note('');
      const sample = h('span', { style: 'display:inline-block;flex:none;width:2.5em;height:2.5em;border-radius:var(--mh-radius-control);box-shadow:inset 0 0 0 var(--mh-border-width) var(--mh-outline)' });
      const show = (v: string): void => {
        out.textContent = `Lamp colour ${v}`;
        sample.style.background = v;
      };
      const lamp = createColorPicker({ value: '#ff9a3c', label: 'Lamp colour', onInput: show });
      show(lamp.getValue());
      const tint = createColorPicker({
        value: '#3c8cff99',
        alpha: true,
        label: 'Overlay tint',
        swatches: [
          { color: '#ffb35c', label: 'Candle' },
          { color: '#fff1d6', label: 'Warm white' },
          { color: '#e8f0ff', label: 'Daylight' },
          { color: '#5c7cff80', label: 'Dusk, half clear' },
          { color: '#00000000', label: 'Clear' },
        ],
      });
      const col = (title: string, width: number, ...children: Node[]): HTMLElement => h('div', { class: 'ex-stack', style: `width: min(100%, ${width}px)` }, heading(title), ...children);
      return h(
        'div',
        { class: 'ex-stack' },
        row(col('Default swatches', 300, lamp.el, h('div', { class: 'ex-row' }, sample, out)), col('With opacity and own swatches', 300, tint.el)),
        row(col('No swatches', 260, createColorPicker({ value: '#4caf7d', swatches: false, eyedropper: false, label: 'Plant shelf' }).el), col('Disabled', 260, createColorPicker({ value: '#9c6bff', disabled: true, swatches: false }).el)),
      );
    },
  },
  {
    id: 'gradient-editor',
    render: () => {
      const preview = h('div', { style: 'height: 96px; border-radius: var(--mh-radius-lg); box-shadow: inset 0 0 0 var(--mh-border-width) var(--mh-outline)' });
      const out = h('code', { class: 'mh-text--caption mh-text--mono mh-text--muted', style: 'overflow-wrap: anywhere' });
      const sunrise = createGradientEditor({
        label: 'Sunrise light',
        showAngle: true,
        angle: 90,
        stops: [
          { offset: 0, color: '#1a1446' },
          { offset: 35, color: '#c2457a' },
          { offset: 70, color: '#ff9f43' },
          { offset: 100, color: '#fff3c4', opacity: 0.6 },
        ],
        onInput: () => show(),
      });
      function show(): void {
        preview.style.background = sunrise.css();
        out.textContent = sunrise.css();
      }
      show();
      const fade = createGradientEditor({ label: 'Fade', stops: [{ offset: 0, color: '#2fbf9f' }, { offset: 100, color: '#2fbf9f', opacity: 0 }], swatches: false });
      return h('div', { class: 'ex-stack', style: 'max-width: 520px' }, heading('Sunrise wake-up'), preview, sunrise.el, out, heading('Colour to clear, no swatches'), fade.el);
    },
  },
  {
    id: 'icon-picker',
    render: () => {
      const out = note('Choose an icon.');
      const all = createIconPicker({ value: 'lightbulb', label: 'Icon', onChange: (n) => (out.textContent = n ? `Picked “${iconLabel(n)}”.` : 'No icon.') });
      const rooms = createIconPicker({
        label: 'Room icon',
        allowNone: true,
        value: 'sofa',
        search: false,
        icons: [
          { name: 'sofa', path: mdiSofaOutline, label: 'Living room', keywords: ['lounge', 'couch'] },
          { name: 'bed', path: mdiBed, label: 'Bedroom', keywords: ['sleep'] },
          { name: 'kitchen', path: mdiStove, label: 'Kitchen', keywords: ['cook', 'oven'] },
          { name: 'dining', path: mdiSilverwareForkKnife, label: 'Dining room', keywords: ['eat'] },
          { name: 'utility', path: mdiWashingMachine, label: 'Utility room', keywords: ['laundry'] },
          { name: 'hall', path: mdiDoorOpen, label: 'Hallway', keywords: ['entrance', 'door'] },
          { name: 'garage', path: mdiGarage, label: 'Garage', keywords: ['car'] },
          { name: 'garden', path: mdiFlowerOutline, label: 'Garden', keywords: ['outside', 'plants'] },
          { name: 'den', path: mdiTelevision, label: 'Den', keywords: ['tv', 'media'] },
          { name: 'nook', path: mdiCoffeeOutline, label: 'Reading nook', keywords: ['coffee'] },
        ],
      });
      return h(
        'div',
        { class: 'ex-stack', style: 'max-width: 460px' },
        heading('Built-in set, with search'),
        all.el,
        out,
        heading('Your own list, with “No icon”'),
        rooms.el,
        heading('Disabled'),
        createIconPicker({ icons: ['home', 'fan', 'lock', 'wifi'], value: 'fan', disabled: true }).el,
      );
    },
  },
  {
    id: 'file-drop-zone',
    render: () => {
      const out = note('');
      const images = createFileDropZone({
        hint: 'PNG, JPG or WebP, up to 5 MB each, up to 4 files',
        accept: 'image/png,image/jpeg,image/webp',
        maxSize: 5_000_000,
        maxFiles: 4,
        onChange: (files) => (out.textContent = files.length ? `${files.length} file${files.length === 1 ? '' : 's'}, ${formatFileSize(files.reduce((n, f) => n + f.size, 0))} in all.` : ''),
      });
      const demo = h('button', { type: 'button', class: 'mh-button mh-button--text mh-button--sm' }, h('span', { class: 'mh-button__label' }, 'Add sample files'));
      demo.addEventListener('click', () => images.addFiles([new File([new Uint8Array(180_000)], 'hallway-plan.png', { type: 'image/png' }), new File([new Uint8Array(2_400)], 'notes.txt', { type: 'text/plain' })]));
      return stack(
        images.el,
        h('div', { class: 'ex-row' }, demo, out),
        createFileDropZone({ multiple: false, title: 'Drop a backup file', hint: 'A .json or .tar backup', accept: '.json,.tar', icon: 'download' }).el,
        createFileDropZone({ hint: 'Uploads are paused', disabled: true }).el,
      );
    },
  },
];
