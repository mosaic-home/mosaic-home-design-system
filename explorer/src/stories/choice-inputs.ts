import { createCheckbox } from '../../../src/web/choice-inputs/checkbox.ts';
import { createChip, createChipGroup } from '../../../src/web/choice-inputs/chip.ts';
import { createCheckboxGroup, createRadioGroup } from '../../../src/web/choice-inputs/choiceGroup.ts';
import { createSegmentedControl } from '../../../src/web/choice-inputs/segmentedControl.ts';
import { createSlider } from '../../../src/web/choice-inputs/slider.ts';
import { createStepper } from '../../../src/web/choice-inputs/stepper.ts';
import { createSwitch } from '../../../src/web/choice-inputs/switch.ts';
import { createClickWheel } from '../../../src/web/choice-inputs/clickWheel.ts';
import { createRadialDial } from '../../../src/web/choice-inputs/radialDial.ts';
import { createRangeSlider } from '../../../src/web/choice-inputs/rangeSlider.ts';
import { createRating } from '../../../src/web/choice-inputs/rating.ts';
import { createToggleGroup } from '../../../src/web/choice-inputs/toggleGroup.ts';
import { mdiFormatAlignCenter, mdiFormatAlignLeft, mdiFormatAlignRight, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
import { h } from '../../../src/web/dom.ts';
import type { Story } from './types.ts';

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack', style: 'max-width: 420px' }, ...children);
const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);
const ROOMS = ['Living room', 'Kitchen', 'Bedroom'];
const meta = (text: string): HTMLElement => h('span', { class: 'ex-meta', 'aria-live': 'polite' }, text);
const caption = (text: string): HTMLElement => h('p', { class: 'ex-meta' }, text);
const hhmm = (minutes: number): string => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const compass = (deg: number): string => `${deg}° ${COMPASS[Math.round(deg / 45) % 8]}`;
const STATIONS = ['Harbour Radio', 'Night Owl', 'Copper Hill', 'Lantern 101', 'Quiet Fields', 'Velvet Static'];

export const choiceInputsStories: Story[] = [
  {
    id: 'checkbox',
    render: () => {
      // A "select all" parent that goes indeterminate while only some rooms are chosen.
      const children = ROOMS.map((label, i) => createCheckbox({ label, checked: i === 0 }));
      const all = createCheckbox({ label: 'All rooms', indeterminate: true });
      const sync = (): void => {
        const on = children.filter((c) => c.isChecked()).length;
        all.setChecked(on === children.length);
        all.setIndeterminate(on > 0 && on < children.length);
      };
      all.input.addEventListener('change', () => children.forEach((c) => c.setChecked(all.isChecked())));
      children.forEach((c) => c.input.addEventListener('change', sync));
      return stack(
        h('div', {}, all.el, h('div', { style: 'display: grid; padding-left: var(--mh-space-xl)' }, ...children.map((c) => c.el))),
        createCheckbox({ label: 'Notify me', description: 'Send a notification when the door opens.', checked: true }).el,
        createCheckboxGroup({
          legend: 'Days',
          inline: true,
          values: ['sat', 'sun'],
          options: [
            { value: 'sat', label: 'Saturday' },
            { value: 'sun', label: 'Sunday' },
            { value: 'hol', label: 'Holidays', disabled: true },
          ],
        }).el,
        row(createCheckbox({ ariaLabel: 'Unlabelled' }).el, createCheckbox({ label: 'Disabled', disabled: true }).el, createCheckbox({ label: 'Disabled on', checked: true, disabled: true }).el),
      );
    },
  },
  {
    id: 'radio-group',
    render: () =>
      stack(
        createRadioGroup({
          legend: 'Heating mode',
          value: 'auto',
          options: [
            { value: 'auto', label: 'Auto', description: 'Follows the schedule.' },
            { value: 'manual', label: 'Manual', description: 'Holds the set temperature.' },
            { value: 'off', label: 'Off' },
          ],
        }).el,
        createRadioGroup({
          legend: 'Units',
          inline: true,
          value: 'c',
          options: [
            { value: 'c', label: 'Celsius' },
            { value: 'f', label: 'Fahrenheit' },
            { value: 'k', label: 'Kelvin', disabled: true },
          ],
        }).el,
      ),
  },
  {
    id: 'switch',
    render: () =>
      stack(
        row(createSwitch({ label: 'Lights', checked: true }).el, createSwitch({ label: 'Fan' }).el, createSwitch({ ariaLabel: 'Unlabelled' }).el),
        h(
          'div',
          {},
          createSwitch({ row: true, icon: 'lightbulb', label: 'Motion lighting', description: 'Turn lights on when someone walks in.', checked: true }).el,
          createSwitch({ row: true, icon: 'bell', label: 'Door chime' }).el,
          createSwitch({ row: true, icon: 'lock', label: 'Auto-lock', description: 'Needs a connected lock.', disabled: true }).el,
        ),
        row(createSwitch({ label: 'Disabled on', checked: true, disabled: true }).el),
      ),
  },
  {
    id: 'segmented-control',
    render: () =>
      stack(
        createSegmentedControl({
          label: 'Range',
          value: 'day',
          options: [
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ],
        }).el,
        createSegmentedControl({
          label: 'Fan speed',
          value: 'mid',
          fullWidth: true,
          options: [
            { value: 'low', label: 'Low', icon: 'fan' },
            { value: 'mid', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'boost', label: 'Boost', disabled: true },
          ],
        }).el,
        row(
          createSegmentedControl({
            label: 'View',
            value: 'list',
            size: 'small',
            options: [
              { value: 'list', label: 'List view', icon: 'menu', iconOnly: true },
              { value: 'grid', label: 'Grid view', icon: 'home', iconOnly: true },
            ],
          }).el,
          createSegmentedControl({ label: 'Disabled', value: 'a', disabled: true, size: 'small', options: [{ value: 'a', label: 'On' }, { value: 'b', label: 'Off' }] }).el,
        ),
      ),
  },
  {
    id: 'chip',
    render: () => {
      const removable = createChipGroup({ label: 'Chosen rooms', selection: 'none', removable: true, chips: ROOMS.map((r) => ({ value: r, label: r, icon: 'home' })) });
      return stack(
        createChipGroup({ label: 'Filter', values: ['lights'], chips: [{ value: 'lights', label: 'Lights', icon: 'lightbulb' }, { value: 'climate', label: 'Climate', icon: 'thermometer' }, { value: 'media', label: 'Media', icon: 'music' }, { value: 'offline', label: 'Offline', disabled: true }] }).el,
        createChipGroup({
          label: 'Repeat on',
          values: ['mon', 'wed', 'fri'],
          chips: [
            ['mon', 'M', 'Monday'],
            ['tue', 'T', 'Tuesday'],
            ['wed', 'W', 'Wednesday'],
            ['thu', 'T', 'Thursday'],
            ['fri', 'F', 'Friday'],
            ['sat', 'S', 'Saturday'],
            ['sun', 'S', 'Sunday'],
          ].map(([value, label, ariaLabel]) => ({ value: value!, label: label!, ariaLabel })),
        }).el,
        createChipGroup({ label: 'Scene', selection: 'single', values: ['relax'], chips: [{ value: 'bright', label: 'Bright' }, { value: 'relax', label: 'Relax' }, { value: 'night', label: 'Night' }] }).el,
        removable.el,
        row(createChip({ label: 'Static' }).el, createChip({ label: 'With icon', icon: 'wifi' }).el, createChip({ label: 'Disabled', removable: true, disabled: true }).el),
      );
    },
  },
  {
    id: 'slider',
    render: () =>
      stack(
        createSlider({ label: 'Brightness', value: 60, showValue: true, format: (v) => `${v}%` }).el,
        createSlider({
          label: 'Colour temperature',
          min: 2000,
          max: 6500,
          step: 100,
          value: 3000,
          showValue: true,
          format: (v) => `${v} K`,
          marks: [
            { value: 2000, label: 'Warm' },
            { value: 4250, label: 'Neutral' },
            { value: 6500, label: 'Cool' },
          ],
        }).el,
        createSlider({ ariaLabel: 'Volume', value: 30 }).el,
        createSlider({ label: 'Disabled', value: 40, disabled: true }).el,
      ),
  },
  {
    id: 'stepper',
    render: () =>
      stack(
        row(createStepper({ label: 'Guests', value: 2, min: 1, max: 8 }).el, createStepper({ label: 'Target temperature', value: 21, min: 16, max: 28, step: 0.5, format: (v) => `${v.toFixed(1)}°` }).el),
        row(createStepper({ label: 'Delay', value: 5, step: 5, max: 60, size: 'small', format: (v) => `${v} min` }).el, createStepper({ label: 'Disabled', value: 3, disabled: true }).el),
      ),
  },
  {
    id: 'toggle-group',
    render: () => {
      const zones = meta('zones: kitchen');
      return stack(
        row(
          createToggleGroup({
            label: 'Zones',
            values: ['kitchen'],
            options: [
              { value: 'kitchen', label: 'Kitchen', icon: 'lightbulb' },
              { value: 'hall', label: 'Hall', icon: 'lightbulb' },
              { value: 'garden', label: 'Garden', icon: 'lightbulb' },
            ],
            onChange: (v) => (zones.textContent = `zones: ${v.join(', ') || 'none'}`),
          }).el,
          zones,
        ),
        createToggleGroup({
          label: 'Alignment',
          type: 'single',
          required: true,
          values: ['left'],
          options: [
            { value: 'left', label: 'Align left', icon: mdiFormatAlignLeft, iconOnly: true },
            { value: 'center', label: 'Align centre', icon: mdiFormatAlignCenter, iconOnly: true },
            { value: 'right', label: 'Align right', icon: mdiFormatAlignRight, iconOnly: true },
          ],
        }).el,
        createToggleGroup({
          label: 'Theme',
          type: 'single',
          fullWidth: true,
          values: ['night'],
          options: [
            { value: 'day', label: 'Day', icon: mdiWhiteBalanceSunny },
            { value: 'night', label: 'Night', icon: mdiWeatherNight },
            { value: 'auto', label: 'Auto' },
          ],
        }).el,
        row(
          createToggleGroup({
            label: 'Weekdays',
            size: 'small',
            values: ['mon', 'fri'],
            options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => ({ value: d.toLowerCase(), label: d, disabled: d === 'Wed' })),
          }).el,
          createToggleGroup({ label: 'Disabled', size: 'small', disabled: true, values: ['a'], options: [{ value: 'a', label: 'On' }, { value: 'b', label: 'Off' }] }).el,
        ),
        caption('Arrow keys move between toggles; Space or Enter presses. Single mode keeps at most one pressed.'),
      );
    },
  },
  {
    id: 'range-slider',
    render: () =>
      stack(
        createRangeSlider({
          label: 'Comfort band',
          min: 16,
          max: 28,
          step: 0.5,
          minGap: 1,
          value: [19.5, 23],
          showValue: true,
          format: (v) => `${v.toFixed(1)}°`,
          labels: { low: 'Heat to', high: 'Cool to' },
          marks: [
            { value: 16, label: '16°' },
            { value: 22, label: '22°' },
            { value: 28, label: '28°' },
          ],
        }).el,
        createRangeSlider({ label: 'Quiet hours', min: 0, max: 1440, step: 15, value: [1320, 1440], showValue: true, format: hhmm, labels: { low: 'Starts', high: 'Ends' } }).el,
        createRangeSlider({ ariaLabel: 'Brightness limits', value: [10, 80] }).el,
        createRangeSlider({ label: 'Disabled', value: [30, 70], showValue: true, disabled: true }).el,
        caption('Each thumb is its own native range: Tab to it, then use the arrow keys. Press the track to move the nearer thumb.'),
      ),
  },
  {
    id: 'radial-dial',
    render: () => {
      const vol = meta('volume: 35%');
      return stack(
        row(
          createRadialDial({ label: 'Volume', value: 35, format: (v) => `${v}%`, ticks: 11, onInput: (v) => (vol.textContent = `volume: ${v}%`) }).el,
          createRadialDial({ label: 'Wind direction', mode: 'angle', step: 5, value: 225, ticks: 8, format: compass }).el,
          vol,
        ),
        row(
          createRadialDial({ label: 'Fan', size: 'small', min: 0, max: 5, value: 3 }).el,
          createRadialDial({ label: 'Slat tilt', size: 'small', min: -90, max: 90, step: 5, value: 30, format: (v) => `${v}°` }).el,
          createRadialDial({ label: 'Disabled', size: 'small', value: 60, disabled: true }).el,
        ),
        h('div', {}, createRadialDial({ label: 'Oven', size: 'large', min: 50, max: 250, step: 5, value: 180, ticks: 21, format: (v) => `${v}°` }).el),
        caption('Drag around the dial, or focus it and use the arrow keys, Page Up/Down, Home and End.'),
      );
    },
  },
  {
    id: 'click-wheel',
    render: () => {
      let current = 0;
      const station = meta(`tuned: ${STATIONS[0]}`);
      return stack(
        row(
          createClickWheel({ label: 'Volume', value: 12, max: 40 }).el,
          createClickWheel({
            label: 'Station',
            wrap: true,
            max: STATIONS.length,
            detents: 12,
            haptics: true,
            center: { label: 'Play', icon: 'play', onPress: () => (station.textContent = `playing: ${STATIONS[current]}`) },
            onInput: (v) => {
              current = v;
              station.textContent = `tuned: ${STATIONS[v]}`;
            },
          }).el,
          station,
        ),
        row(
          createClickWheel({ label: 'Timer', size: 'small', max: 120, step: 5, value: 25, detents: 36, format: (v) => `${v} min` }).el,
          createClickWheel({ label: 'Disabled', size: 'small', value: 40, disabled: true }).el,
        ),
        caption('Turn it like a knob: it moves one step per tick from where you start and never jumps to the finger. Scroll and keys work too.'),
      );
    },
  },
  {
    id: 'rating',
    render: () => {
      const seen = meta('rating: 4');
      return stack(
        row(createRating({ label: 'How was the film?', value: 4, onChange: (v) => (seen.textContent = `rating: ${v}`) }).el, seen),
        row(createRating({ label: 'Average rating', value: 3.6, readOnly: true }).el, h('span', { class: 'ex-meta' }, '3.6 from 128 ratings')),
        row(createRating({ label: 'Warm tone', value: 3, tone: 'warning', size: 'large' }).el, createRating({ label: 'Small, read-only', value: 4.5, readOnly: true, size: 'small', tone: 'warning' }).el),
        row(
          createRating({ label: 'Favourite', max: 3, value: 2, icon: 'heart', emptyIcon: 'heart-outline', itemLabel: (n) => `${n} of 3 hearts` }).el,
          createRating({ label: 'Disabled', value: 2, disabled: true }).el,
        ),
        caption('Arrow keys change the rating; choose the current star again to clear it.'),
      );
    },
  },
];
