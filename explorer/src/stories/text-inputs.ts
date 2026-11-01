import { createStepper } from '../../../src/web/choice-inputs/stepper.ts';
import { h } from '../../../src/web/dom.ts';
import { createField } from '../../../src/web/text-inputs/field.ts';
import { createSearchField } from '../../../src/web/text-inputs/searchField.ts';
import { createSelect } from '../../../src/web/text-inputs/select.ts';
import { createTextArea } from '../../../src/web/text-inputs/textArea.ts';
import { createTextField } from '../../../src/web/text-inputs/textField.ts';
import { createComposer, createComposerAction, type ComposerMode } from '../../../src/web/text-inputs/composer.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createNumberInput } from '../../../src/web/text-inputs/numberInput.ts';
import { createSecretField } from '../../../src/web/text-inputs/secretField.ts';
import { createHotkeyField } from '../../../src/web/text-inputs/hotkeyField.ts';
import { createCommandBar, type CommandSuggestion } from '../../../src/web/text-inputs/commandBar.ts';
import { createDurationField, formatDuration } from '../../../src/web/text-inputs/durationField.ts';
import { createMultiSelect, type MultiSelectItem } from '../../../src/web/text-inputs/multiSelect.ts';
import { createTransferList, type TransferItem } from '../../../src/web/text-inputs/transferList.ts';
import type { Story } from './types.ts';

const note = (text: string): HTMLElement => h('p', { class: 'mh-text--caption mh-text--muted', 'aria-live': 'polite' }, text);

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack', style: 'max-width: 420px' }, ...children);
const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);

export const textInputsStories: Story[] = [
  {
    id: 'field',
    render: () => {
      const bare = (placeholder: string, value = ''): HTMLElement => createTextField({ ariaLabel: placeholder, placeholder, value }).el;
      const checked = createField({ label: 'Display name', control: bare('Living room', 'Living room'), helper: 'Shown on the dashboard.' });
      const invalid = createField({ label: 'Address', control: bare('192.0.2.10', 'not an address'), error: 'Enter an address like 192.0.2.10.', required: true });
      const ok = createField({ label: 'Update interval', control: bare('Seconds', '30'), success: 'Saved.' });
      const stepper = createStepper({ label: 'Guests', value: 2, max: 12 });
      const group = createField({ label: 'Guests', control: stepper.el, target: stepper.spinbutton, helper: 'Any control can sit in a field.', labelStyle: 'eyebrow' });
      // Validate on change: the message is a live region, so the error is announced.
      const live = createTextField({ label: 'Room', placeholder: 'Type at least three letters', helper: 'Validated as you leave the field.' });
      live.input.addEventListener('change', () => live.setError(live.getValue().length < 3 ? 'At least three letters.' : undefined));
      return stack(checked.el, invalid.el, ok.el, live.el, group.el);
    },
  },
  {
    id: 'text-field',
    render: () =>
      stack(
        createTextField({ label: 'Room name', placeholder: 'e.g. Kitchen', helper: 'Shown on tiles and in voice replies.' }).el,
        createTextField({ label: 'Search radius', type: 'number', value: '25', suffix: 'km', icon: 'home', labelStyle: 'eyebrow' }).el,
        createTextField({ label: 'Price', prefix: '€', value: '12.50', inputMode: 'decimal' }).el,
        createTextField({ label: 'Scene name', value: 'Evening', maxLength: 24, showCount: true }).el,
        createTextField({ label: 'Email', type: 'email', value: 'someone@', error: 'Enter a full email address.', required: true }).el,
        createTextField({ label: 'Location', value: 'Hallway', success: 'Name is available.' }).el,
        row(createTextField({ ariaLabel: 'Small', placeholder: 'Small', size: 'small' }).el, createTextField({ ariaLabel: 'Large', placeholder: 'Large', size: 'large' }).el),
        createTextField({ label: 'Device id', value: 'sensor-04', disabled: true }).el,
      ),
  },
  {
    id: 'text-area',
    render: () =>
      stack(
        createTextArea({ label: 'Notes', placeholder: 'Anything to remember about this room', helper: 'Grows as you type, up to six lines.', maxRows: 6 }).el,
        createTextArea({ label: 'Announcement', value: 'Dinner is ready in ten minutes.', maxLength: 140, showCount: true, rows: 2 }).el,
        createTextArea({ label: 'Message', value: '', error: 'Write a message before sending.', required: true }).el,
        createTextArea({ label: 'Read only', value: 'This text cannot be changed.', readOnly: true, rows: 1 }).el,
      ),
  },
  {
    id: 'search-field',
    render: () => {
      const out = h('p', { class: 'mh-text--caption mh-text--muted', 'aria-live': 'polite' }, 'Type and press Enter; Escape clears.');
      const search = createSearchField({
        placeholder: 'Search rooms and devices',
        onSearch: (v) => (out.textContent = `Searching for “${v}”`),
        onClear: () => (out.textContent = 'Cleared.'),
      });
      return stack(
        search.el,
        out,
        createSearchField({ placeholder: 'Filter', value: 'Lamp', size: 'small' }).el,
        createSearchField({ placeholder: 'Search', size: 'large' }).el,
        createSearchField({ placeholder: 'Unavailable', disabled: true }).el,
      );
    },
  },
  {
    id: 'select',
    render: () =>
      stack(
        createSelect({
          label: 'Room',
          placeholder: 'Choose a room',
          options: [
            { value: 'living', label: 'Living room' },
            { value: 'kitchen', label: 'Kitchen' },
            { value: 'bedroom', label: 'Bedroom' },
            { value: 'garage', label: 'Garage', disabled: true },
          ],
          helper: 'A styled native select: the platform draws the list.',
        }).el,
        createSelect({
          label: 'Scene',
          value: 'relax',
          options: [
            { label: 'Daytime', options: [{ value: 'bright', label: 'Bright' }, { value: 'focus', label: 'Focus' }] },
            { label: 'Evening', options: [{ value: 'relax', label: 'Relax' }, { value: 'night', label: 'Night light' }] },
          ],
          labelStyle: 'eyebrow',
        }).el,
        createSelect({ label: 'Mode', options: [{ value: 'auto', label: 'Auto' }], error: 'This mode is not supported.', value: 'auto' }).el,
        row(createSelect({ ariaLabel: 'Size', size: 'small', options: [{ value: 's', label: 'Small' }] }).el, createSelect({ ariaLabel: 'Size', disabled: true, options: [{ value: 'd', label: 'Disabled' }] }).el),
      ),
  },
  {
    id: 'composer',
    render: () => {
      const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });
      const log = h('ol', { class: 'ex-stack', style: 'margin: 0; padding-left: var(--mh-space-lg)', 'aria-live': 'polite' });
      const composer = createComposer({
        placeholder: 'Ask about your home',
        leading: createComposerAction('attach').el,
        trailing: [createComposerAction('mic').el, createComposerAction('send', { onClick: () => composer.submit() }).el],
        suggestions: ['Turn off all lights', 'Is the back door locked?', 'Warmer in the kitchen'],
        onSuggestion: (text) => {
          composer.setValue(text);
          composer.focus();
        },
        onSubmit: (text) => {
          log.append(h('li', {}, text));
          composer.setValue('');
          composer.focus();
        },
      });
      const mode: ComposerMode = {
        label: 'Automation',
        hint: 'Describe when and what should happen',
        icon: 'lightbulb',
        onClear: () => {
          withMode.setMode(null);
          withMode.setPlaceholder('Message');
        },
      };
      const withMode = createComposer({ placeholder: 'When the sun sets, dim the living room', mode, trailing: createComposerAction('send').el, enterSends: 'always' });
      const offline = createComposer({ placeholder: 'Message', disabled: true, disabledReason: 'Not connected to Home Assistant.', onRetry: () => offline.setDisabled(false), trailing: createComposerAction('send', { disabled: true }).el });
      const voice = createComposer({ placeholder: 'Message', leading: createComposerAction('attach').el, trailing: createComposerAction('voice').el, enterSends: 'never' });
      return stack(
        caption('Enter sends on a mouse or trackpad and is a new line on touch screens; Shift+Enter is always a new line.'),
        log,
        composer.el,
        caption('Mode chip; Enter always sends'),
        withMode.el,
        caption('Disabled with a reason and retry'),
        offline.el,
        caption('Voice instead of send; Enter never sends'),
        voice.el,
      );
    },
  },
  {
    id: 'number-input',
    render: () => {
      const out = note('Arrow keys step, Page Up/Down take big steps, hold a button to repeat, drag the unit sideways to scrub.');
      const target = createNumberInput({
        label: 'Target temperature',
        value: 21.5,
        min: 7,
        max: 30,
        step: 0.5,
        unit: '°C',
        helper: 'Between 7 and 30 °C.',
        onChange: (v) => (out.textContent = `Set to ${v} °C`),
      });
      return stack(
        target.el,
        out,
        createNumberInput({ label: 'Brightness', value: 60, min: 0, max: 100, step: 5, unit: '%', labelStyle: 'eyebrow' }).el,
        createNumberInput({ label: 'Offset', value: -2, min: -10, max: 10, scrub: true, helper: 'No unit: a grip scrubs instead.' }).el,
        createNumberInput({ label: 'Budget', value: 40, min: 0, step: 10, prefix: '€', scrub: false, valueText: (v) => `${v} euros` }).el,
        createNumberInput({ label: 'Guests', value: 12, max: 12, error: 'The table seats 12 at most.' }).el,
        row(createNumberInput({ ariaLabel: 'Small', value: 3, size: 'small', min: 0, max: 9 }).el, createNumberInput({ ariaLabel: 'Large', value: 3, size: 'large', min: 0, max: 9 }).el),
        createNumberInput({ label: 'Locked', value: 5, disabled: true, unit: 'min' }).el,
      );
    },
  },
  {
    id: 'secret-field',
    render: () =>
      stack(
        createSecretField({ label: 'Password', placeholder: 'Your password', helper: 'The eye shows what you typed.' }).el,
        createSecretField({ label: 'New password', kind: 'new-password', value: 'correct-lantern-quay', required: true, success: 'Strong password.' }).el,
        createSecretField({ label: 'Access token', kind: 'key', value: 'tkn_8f2c41d9b7e05a63c1f4', readOnly: true, helper: 'Copy it now: it is shown only once.' }).el,
        createSecretField({ label: 'API key', kind: 'key', placeholder: 'Paste the key', icon: 'lock', error: 'That key was not accepted.', value: 'abc' }).el,
        createSecretField({ label: 'Wi-Fi password', value: 'hidden-meadow-42', disabled: true }).el,
      ),
  },
  {
    id: 'hotkey-field',
    render: () => {
      const out = note('Press a field, then a key combination. Escape cancels, Backspace removes.');
      return stack(
        createHotkeyField({ label: 'Open search', value: 'Ctrl+K', onChange: (v) => (out.textContent = v ? `Open search: ${v}` : 'Open search: none'), helper: 'Pressed anywhere on the dashboard.' }).el,
        out,
        createHotkeyField({ label: 'Toggle all lights', value: 'Ctrl+Shift+L', appleSymbols: true, helper: 'Shown with Apple symbols.' }).el,
        createHotkeyField({ label: 'Next page', requireModifier: false, value: 'ArrowRight', labelStyle: 'eyebrow' }).el,
        createHotkeyField({ label: 'Mute', placeholder: 'Press to set', requireModifier: true, helper: 'Needs Ctrl, Alt or Meta.' }).el,
        createHotkeyField({ label: 'Locked shortcut', value: 'Alt+F4', disabled: true }).el,
      );
    },
  },
  {
    id: 'command-bar',
    render: () => {
      const commands: CommandSuggestion[] = [
        { value: 'lights on', description: 'Turn on the lights in a room' },
        { value: 'lights off', description: 'Turn off the lights in a room' },
        { value: 'scene evening', description: 'Dim everything to warm white' },
        { value: 'scene away', description: 'Lights off, heating down' },
        { value: 'heating set', description: 'Set a room temperature' },
        { value: 'status', description: 'Summary of the home' },
        { value: 'help', description: 'List the commands' },
      ];
      const log = h('pre', { class: 'mh-text--caption', style: 'margin: 0; min-height: 4lh; font-family: var(--mh-font-mono); white-space: pre-wrap', 'aria-live': 'polite' }, '');
      const bar = createCommandBar({
        placeholder: 'Type a command',
        suggestions: commands,
        history: ['status', 'lights on kitchen'],
        onSubmit: (c) => (log.textContent = `${log.textContent}> ${c}\nok\n`.split('\n').slice(-8).join('\n')),
      });
      const up = createCommandBar({ placeholder: 'Opens upward', suggestions: commands, openUp: true, prompt: '$', size: 'small' });
      return stack(
        note('Suggestions as you type: arrows pick, Tab completes, Enter runs. Arrow Up recalls earlier commands.'),
        log,
        bar.el,
        h('div', { style: 'height: 220px' }),
        up.el,
        createCommandBar({ placeholder: 'Offline', disabled: true }).el,
      );
    },
  },
  {
    id: 'duration-field',
    render: () => {
      const out = note('Try 90, 1h 30, 1.5h, 2 hours 5 minutes or 0:45.');
      return stack(
        createDurationField({
          label: 'Timer',
          value: 1500,
          presets: [300, 600, 900, 1800, 3600],
          helper: 'A number alone is minutes.',
          onChange: (s) => (out.textContent = s === null ? 'No timer' : `Timer: ${formatDuration(s, 'long')}`),
        }).el,
        out,
        createDurationField({ label: 'Keep lights on for', min: 60, max: 4 * 3600, placeholder: 'Between 1m and 4h', labelStyle: 'eyebrow' }).el,
        createDurationField({ label: 'Delay', defaultUnit: 's', value: 45, helper: 'A number alone is seconds.', icon: false }).el,
        createDurationField({ label: 'Interval', value: 3600, error: 'Too often for this device.' }).el,
        createDurationField({ label: 'Cycle', value: 5400, disabled: true }).el,
      );
    },
  },
  {
    id: 'multi-select',
    render: () => {
      const rooms: MultiSelectItem[] = [
        {
          label: 'Ground floor',
          options: [
            { value: 'living', label: 'Living room', icon: 'home', description: '4 lights' },
            { value: 'kitchen', label: 'Kitchen', icon: 'lightbulb', description: '3 lights' },
            { value: 'hall', label: 'Hallway', icon: 'lightbulb', description: '1 light' },
          ],
        },
        {
          label: 'Upstairs',
          options: [
            { value: 'bedroom', label: 'Bedroom', icon: 'lightbulb', description: '2 lights' },
            { value: 'study', label: 'Study', icon: 'lightbulb', description: '2 lights' },
            { value: 'attic', label: 'Attic', icon: 'lightbulb', description: 'Unavailable', disabled: true },
          ],
        },
      ];
      const out = note('Type to filter, arrows move, Enter toggles, Backspace removes the last room.');
      return stack(
        createMultiSelect({ label: 'Rooms', options: rooms, values: ['living', 'kitchen'], placeholder: 'Choose rooms', helper: 'The scene runs in every chosen room.', onChange: (v) => (out.textContent = `${v.length} chosen`) }).el,
        out,
        createMultiSelect({
          label: 'Notify',
          labelStyle: 'eyebrow',
          placeholder: 'Choose people',
          options: [
            { value: 'a', label: 'Phone A' },
            { value: 'b', label: 'Phone B' },
            { value: 't', label: 'Wall tablet' },
            { value: 'w', label: 'Watch' },
          ],
        }).el,
        createMultiSelect({ label: 'Days', size: 'small', options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ value: d, label: d })), values: ['Sat', 'Sun'] }).el,
        createMultiSelect({ label: 'Sensors', options: [{ value: 's1', label: 'Door' }], error: 'Choose at least one more sensor.', values: ['s1'] }).el,
        createMultiSelect({ label: 'Locked', options: [{ value: 'x', label: 'Garage' }], values: ['x'], disabled: true }).el,
      );
    },
  },
  {
    id: 'transfer-list',
    render: () => {
      const items: TransferItem[] = [
        { value: 'weather', label: 'Weather', icon: 'weather', description: 'Today and tomorrow' },
        { value: 'lights', label: 'Lights', icon: 'lightbulb', description: 'Every room' },
        { value: 'heating', label: 'Heating', icon: 'thermometer' },
        { value: 'music', label: 'Music', icon: 'music', description: 'Now playing' },
        { value: 'cameras', label: 'Cameras', icon: 'camera' },
        { value: 'network', label: 'Network', icon: 'wifi', description: 'Admin only', disabled: true },
        { value: 'calendar', label: 'Calendar', icon: 'calendar' },
        { value: 'energy', label: 'Energy', icon: 'power' },
      ];
      const out = note('Press items to pick them, then a move button. Keyboard: arrows, Space, Shift+arrows, Ctrl+A, Enter.');
      return h(
        'div',
        { class: 'ex-stack', style: 'max-width: 720px' },
        createTransferList({ label: 'Dashboard cards', items, values: ['weather', 'lights'], sourceLabel: 'Hidden', targetLabel: 'Shown', helper: 'Shown cards appear on the wall tablet.', onChange: (v) => (out.textContent = `Shown: ${v.join(', ') || 'none'}`) }).el,
        out,
        h('div', { style: 'max-width: 420px' }, createTransferList({ label: 'Searchable, narrow', items, values: ['music'], searchable: true }).el),
        createTransferList({ label: 'Locked', items: items.slice(0, 4), values: ['heating'], disabled: true }).el,
      );
    },
  },
];
