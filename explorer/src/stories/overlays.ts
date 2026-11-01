import { h } from '../../../src/web/dom.ts';
import { createButton, type ButtonVariant } from '../../../src/web/actions/button.ts';
import { createIconButton } from '../../../src/web/actions/iconButton.ts';
import { createBottomSheet } from '../../../src/web/overlays/bottomSheet.ts';
import { confirm, type ConfirmOptions } from '../../../src/web/overlays/confirm.ts';
import { createDialog, type DialogSize } from '../../../src/web/overlays/dialog.ts';
import { createDrawer, type DrawerSide } from '../../../src/web/overlays/drawer.ts';
import { createMenu, type MenuEntry } from '../../../src/web/overlays/menu.ts';
import { createCommandPalette, type Command, type CommandPaletteHandle } from '../../../src/web/overlays/commandPalette.ts';
import { createPopover } from '../../../src/web/overlays/popover.ts';
import { createSplitButton, type SplitButtonVariant } from '../../../src/web/overlays/splitButton.ts';
import { createToaster, type Toaster, type ToasterPlacement, type ToastOptions } from '../../../src/web/overlays/toast.ts';
import { createTooltip } from '../../../src/web/overlays/tooltip.ts';
import type { Story } from './types.ts';

const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);
const meta = (text: string): HTMLElement => h('span', { class: 'ex-meta', 'aria-live': 'polite' }, text);
const btn = (label: string, onClick: () => void, variant: ButtonVariant = 'secondary'): HTMLElement => createButton({ label, variant, onClick }).el;
const para = (text: string): HTMLElement => h('p', { style: 'margin: 0 0 var(--mh-space-md)' }, text);

const LOREM = [
  'Changes apply to every screen that uses this layout.',
  'You can come back and adjust these at any time; nothing is lost when you close this panel.',
  'Swipe down on the handle, press Escape or tap outside to close it.',
];

function settingsList(): HTMLElement {
  return h(
    'div',
    { class: 'ex-stack' },
    ...['Brightness follows the time of day', 'Dim the screen after one minute', 'Show the clock while idle'].map((t) =>
      h('label', { class: 'ex-row', style: 'justify-content: space-between' }, h('span', {}, t), h('input', { type: 'checkbox', checked: true })),
    ),
  );
}

let storyPalette: CommandPaletteHandle | null = null;

let toasters: Partial<Record<ToasterPlacement, Toaster>> = {};
function toaster(placement: ToasterPlacement): Toaster {
  const existing = toasters[placement];
  if (existing?.el.isConnected) return existing;
  const t = createToaster({ placement, max: 3 });
  toasters = { ...toasters, [placement]: t };
  return t;
}

export const overlaysStories: Story[] = [
  {
    id: 'bottom-sheet',
    render: () => {
      const root = h('div', { class: 'ex-stack' });
      const status = meta('closed');
      const sheet = createBottomSheet({
        title: 'Display',
        description: 'How the screen behaves when nobody is using it.',
        container: root,
        content: settingsList(),
        footer: [btn('Cancel', () => sheet.close()), btn('Apply', () => sheet.close(), 'primary')],
        onOpen: () => (status.textContent = 'open'),
        onClose: (reason) => (status.textContent = `closed (${reason})`),
      });
      const long = createBottomSheet({
        title: 'About this panel',
        container: root,
        content: Array.from({ length: 12 }, (_, i) => para(LOREM[i % LOREM.length]!)),
      });
      const bare = createBottomSheet({ label: 'Quick actions', closeButton: false, container: root, content: row(btn('Scene one', () => bare.close()), btn('Scene two', () => bare.close()), btn('All off', () => bare.close(), 'tonal')) });
      root.append(row(btn('Open sheet', () => sheet.open(), 'primary'), btn('Long content', () => long.open()), btn('No header', () => bare.open()), status));
      root.append(h('p', { class: 'ex-meta' }, 'A sheet from the bottom on phones, a centred panel on wide screens.'));
      return root;
    },
  },
  {
    id: 'drawer',
    render: () => {
      const root = h('div', { class: 'ex-stack' });
      const make = (side: DrawerSide): ReturnType<typeof createDrawer> => {
        const d = createDrawer({
          side,
          title: side === 'left' ? 'Navigate' : 'Filters',
          container: root,
          content:
            side === 'left'
              ? h('nav', { class: 'ex-stack' }, ...['Overview', 'Rooms', 'Schedules', 'Settings'].map((t) => h('a', { href: '#drawer' }, t)))
              : settingsList(),
          footer: side === 'right' ? [btn('Reset', () => d.close()), btn('Show results', () => d.close(), 'primary')] : undefined,
        });
        return d;
      };
      const right = make('right');
      const left = make('left');
      root.append(row(btn('Open right', () => right.open(), 'primary'), btn('Open left', () => left.open())));
      return root;
    },
  },
  {
    id: 'dialog',
    render: () => {
      const root = h('div', { class: 'ex-stack' });
      const make = (size: DialogSize, title: string): ReturnType<typeof createDialog> => {
        const d = createDialog({
          size,
          title,
          description: 'Give it a short name you will recognise later.',
          container: root,
          content: h('input', { type: 'text', value: 'Evening', 'aria-label': 'Name', style: 'width: 100%; font: inherit; padding: var(--mh-space-sm); border-radius: var(--mh-radius-sm); border: var(--mh-border-width) solid var(--mh-outline); background: var(--mh-input); color: var(--mh-text)' }),
          footer: [btn('Cancel', () => d.close()), btn('Save', () => d.close(), 'primary')],
        });
        return d;
      };
      const medium = make('medium', 'Rename scene');
      const large = make('large', 'A wider dialog');
      const small = make('small', 'A narrow dialog');
      root.append(row(btn('Open dialog', () => medium.open(), 'primary'), btn('Small', () => small.open()), btn('Large', () => large.open())));
      return root;
    },
  },
  {
    id: 'confirm',
    render: () => {
      const root = h('div', { class: 'ex-stack' });
      const result = meta('—');
      const ask = (o: Omit<ConfirmOptions, 'container'>) => async (): Promise<void> => {
        result.textContent = (await confirm({ ...o, container: root })) ? 'confirmed' : 'cancelled';
      };
      root.append(
        row(
          btn('Confirm', ask({ title: 'Restart now?', message: 'The screen goes dark for a few seconds.', confirmLabel: 'Restart' }), 'primary'),
          btn('Destructive', ask({ title: 'Delete this scene?', message: 'This cannot be undone.', confirmLabel: 'Delete', destructive: true }), 'danger'),
          btn('Type to confirm', ask({ title: 'Reset everything?', message: 'Every setting goes back to its default.', confirmLabel: 'Reset', destructive: true, requireText: 'reset' })),
          result,
        ),
      );
      return root;
    },
  },
  {
    id: 'toast',
    render: () => {
      const show = (o: ToastOptions, placement: ToasterPlacement = 'bottom') => (): void => void toaster(placement).show(o);
      return h(
        'div',
        { class: 'ex-stack' },
        row(
          btn('Neutral', show({ message: 'Settings saved' })),
          btn('Info', show({ tone: 'info', message: 'An update is ready' })),
          btn('Success', show({ tone: 'success', title: 'Connected', message: 'The device is online again.' })),
          btn('Warning', show({ tone: 'warning', message: 'Battery is getting low' })),
          btn('Danger', show({ tone: 'danger', message: 'Could not reach the server' })),
        ),
        row(
          btn('With action', show({ message: 'Scene deleted', action: { label: 'Undo', onClick: () => undefined } }), 'primary'),
          btn('Stays until closed', show({ tone: 'info', message: 'This one waits for you.', duration: 0 })),
          btn('Top end', show({ tone: 'success', message: 'Shown at the top end' }, 'top-end')),
        ),
        h('p', { class: 'ex-meta' }, 'Up to three at a time; the rest queue. Hover or focus pauses the timer.'),
      );
    },
  },
  {
    id: 'menu',
    render: () => {
      const picked = meta('—');
      const items: MenuEntry[] = [
        { value: 'edit', label: 'Edit', icon: 'edit', shortcut: 'E' },
        { value: 'duplicate', label: 'Duplicate', icon: 'copy', shortcut: 'Ctrl+D' },
        { value: 'share', label: 'Share', icon: 'share' },
        { value: 'archive', label: 'Archive', disabled: true },
        { separator: true },
        { value: 'delete', label: 'Delete', icon: 'delete', danger: true },
      ];
      const more = createIconButton({ icon: 'more', label: 'More actions' }).el;
      createMenu({ anchor: more, items, onSelect: (v) => (picked.textContent = v) });
      const sort = createButton({ label: 'Sort by', variant: 'secondary', trailingIcon: 'chevron-down' }).el;
      createMenu({
        anchor: sort,
        placement: 'bottom-end',
        items: [
          { value: 'name', label: 'Name' },
          { value: 'recent', label: 'Recently used' },
          { value: 'room', label: 'Room' },
        ],
        onSelect: (v) => (picked.textContent = `sort: ${v}`),
      });
      return h('div', { class: 'ex-stack' }, row(more, sort, picked), h('p', { class: 'ex-meta' }, 'Arrow keys, Home, End and a letter move; Escape closes.'));
    },
  },
  {
    id: 'tooltip',
    render: () => {
      const tip = (el: HTMLElement, text: string, placement: 'top' | 'bottom' = 'top'): HTMLElement => {
        createTooltip(el, { text, placement });
        return el;
      };
      return h(
        'div',
        { class: 'ex-stack' },
        row(
          tip(createIconButton({ icon: 'refresh', label: 'Refresh' }).el, 'Refresh'),
          tip(createIconButton({ icon: 'settings', label: 'Settings' }).el, 'Settings'),
          tip(createIconButton({ icon: 'info', label: 'About' }).el, 'Shows version and licence details', 'bottom'),
          tip(createButton({ label: 'Hover or focus me', variant: 'secondary' }).el, 'A short hint, never essential information'),
        ),
      );
    },
  },
  {
    id: 'split-button',
    render: () => {
      const picked = meta('—');
      const items: MenuEntry[] = [
        { value: 'in-10', label: 'Run in 10 minutes', icon: 'refresh' },
        { value: 'at-sunset', label: 'Run at sunset', icon: 'weather' },
        { separator: true },
        { value: 'edit', label: 'Edit scene', icon: 'edit' },
      ];
      const make = (variant: SplitButtonVariant, size?: 'small' | 'large', disabled = false): HTMLElement =>
        createSplitButton({
          label: 'Run scene',
          icon: 'play',
          variant,
          size,
          disabled,
          items,
          onClick: () => (picked.textContent = `run (${variant})`),
          onSelect: (v) => (picked.textContent = v),
        }).el;
      return h(
        'div',
        { class: 'ex-stack' },
        row(make('primary'), make('secondary'), make('tonal'), picked),
        row(make('primary', 'small'), make('secondary', 'large'), make('primary', undefined, true)),
        h('p', { class: 'ex-meta' }, 'The main half runs the default; the chevron opens the alternatives (Arrow Down opens it too).'),
      );
    },
  },
  {
    id: 'popover',
    render: () => {
      const root = h('div', { class: 'ex-stack' });
      const level = meta('brightness: 70%');
      const brightness = h('input', { type: 'range', min: 0, max: 100, value: 70, 'aria-label': 'Brightness', style: 'width: 100%' });
      brightness.addEventListener('input', () => (level.textContent = `brightness: ${brightness.value}%`));
      const lightBtn = createButton({ label: 'Desk lamp', icon: 'lightbulb-on', variant: 'secondary', trailingIcon: 'chevron-down' }).el;
      createPopover({ anchor: lightBtn, title: 'Desk lamp', container: root, content: h('div', { class: 'ex-stack' }, brightness, h('label', { class: 'ex-row' }, h('input', { type: 'checkbox', checked: true }), 'Follow the sun')) });
      const filterBtn = createIconButton({ icon: 'filter', label: 'Filter rooms' }).el;
      createPopover({
        anchor: filterBtn,
        label: 'Filter rooms',
        placement: 'bottom-start',
        size: 'wide',
        closeButton: true,
        container: root,
        content: h('div', { class: 'ex-stack' }, ...['Living room', 'Kitchen', 'Bedroom', 'Garden'].map((r) => h('label', { class: 'ex-row' }, h('input', { type: 'checkbox', checked: r !== 'Garden' }), r))),
      });
      const infoBtn = createIconButton({ icon: 'info', label: 'About this sensor' }).el;
      createPopover({ anchor: infoBtn, title: 'Air quality', placement: 'top', container: root, content: h('p', { style: 'margin: 0; max-width: 32ch' }, 'Measured every five minutes in the hallway. Readings under 50 are good.') });
      root.append(row(lightBtn, filterBtn, infoBtn, level), h('p', { class: 'ex-meta' }, 'Not modal: Escape, a press outside or Tab leaving it closes it.'));
      return root;
    },
  },
  {
    id: 'command-palette',
    render: () => {
      const root = h('div', { class: 'ex-stack' });
      const ran = meta('—');
      const commands: Command[] = [
        { value: 'search', label: 'Search devices', icon: 'search', shortcut: '/' },
        { value: 'lights-off', label: 'Turn off all lights', icon: 'lightbulb', group: 'Lights', keywords: ['dark', 'night'], description: 'Every room' },
        { value: 'lights-on', label: 'Turn on all lights', icon: 'lightbulb-on', group: 'Lights' },
        { value: 'evening', label: 'Evening scene', icon: 'play', group: 'Scenes', description: 'Living room and kitchen at 40%' },
        { value: 'movie', label: 'Film night', icon: 'film', group: 'Scenes', keywords: ['cinema'] },
        { value: 'lock', label: 'Lock the front door', icon: 'lock', group: 'Security', shortcut: 'Ctrl+L' },
        { value: 'away', label: 'Away mode', icon: 'home', group: 'Security', description: 'Needs a connected alarm', disabled: true },
        { value: 'heating', label: 'Set heating to 20°', icon: 'thermometer', group: 'Climate', keywords: ['temperature', 'warm'] },
        { value: 'fan', label: 'Bedroom fan off', icon: 'fan', group: 'Climate' },
        { value: 'settings', label: 'Open settings', icon: 'settings', group: 'App', shortcut: 'Ctrl+,' },
        { value: 'theme', label: 'Switch theme', icon: 'eye', group: 'App' },
      ];
      // One palette listens for the hotkey: drop the one from an earlier render.
      storyPalette?.destroy();
      const palette = createCommandPalette({ commands, hotkey: true, container: root, onSelect: (v) => (ran.textContent = `ran: ${v}`) });
      storyPalette = palette;
      root.append(
        row(createButton({ label: 'Open palette', icon: 'search', variant: 'primary', onClick: () => palette.open() }).el, h('span', { class: 'ex-meta' }, 'or press Ctrl+K'), ran),
        h('p', { class: 'ex-meta' }, 'Type to filter ("lights", "night", "tfd"); arrow keys move, Enter runs, Escape closes.'),
      );
      return root;
    },
  },
];
