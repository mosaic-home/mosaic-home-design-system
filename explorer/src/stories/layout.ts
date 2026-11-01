import { h } from '../../../src/web/dom.ts';
import { createButton } from '../../../src/web/actions/button.ts';
import { createIconButton } from '../../../src/web/actions/iconButton.ts';
import { createSwitch } from '../../../src/web/choice-inputs/switch.ts';
import { createList } from '../../../src/web/data-display/list.ts';
import { createCard } from '../../../src/web/data-display/card.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createAppShell } from '../../../src/web/layout/appShell.ts';
import { createOnboarding } from '../../../src/web/layout/onboarding.ts';
import { createPanel } from '../../../src/web/layout/panel.ts';
import { createPanelGroup } from '../../../src/web/layout/panelGroup.ts';
import { createReorderableList } from '../../../src/web/layout/reorderableList.ts';
import { createScreen, type ScreenWidth } from '../../../src/web/layout/screen.ts';
import { createScrollPanel } from '../../../src/web/layout/scrollPanel.ts';
import { createSplitPane } from '../../../src/web/layout/splitPane.ts';
import { createStatusBar } from '../../../src/web/layout/statusBar.ts';
import { createSwipeRow } from '../../../src/web/layout/swipeRow.ts';
import { createToolbar } from '../../../src/web/layout/toolbar.ts';
import { createGrid, createRow, createStack, type Space } from '../../../src/web/layout/stack.ts';
import type { Story } from './types.ts';

const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });
const box = (text: string): HTMLElement => h('div', { class: 'ex-card' }, text);
const frame = (screen: HTMLElement): HTMLElement =>
  h('div', { style: 'height: 360px; overflow: auto; border: var(--mh-border-width) solid var(--mh-outline); border-radius: var(--mh-radius-md)' }, screen);

const iconButton = (icon: string, label: string, pressed?: boolean): HTMLButtonElement => createIconButton({ icon, label, pressed }).el;
const fixedFrame = (height: number, ...children: HTMLElement[]): HTMLElement =>
  h('div', { style: `height: ${height}px; display: flex; flex-direction: column; overflow: hidden; border: var(--mh-border-width) solid var(--mh-outline); border-radius: var(--mh-radius-md)` }, ...children);
const muted = (text: string): HTMLElement => createText(text, { tone: 'muted' });
const log = (): HTMLElement => {
  const out = createText('Try it: nothing has happened yet.', { variant: 'caption', tone: 'muted' });
  out.setAttribute('aria-live', 'polite');
  return out;
};
const rooms = ['Living room', 'Kitchen', 'Hall', 'Bedroom', 'Office', 'Bathroom', 'Garden', 'Garage', 'Attic', 'Utility room', 'Porch', 'Landing'];

export const layoutStories: Story[] = [
  {
    id: 'screen',
    render: () => {
      const widths: ScreenWidth[] = ['narrow', 'medium'];
      return createStack(
        {},
        ...widths.flatMap((width) => [
          caption(`Width: ${width}`),
          frame(
            createScreen(
              { width, label: 'Home', header: createStack({ gap: 'xxs' }, createText('Living room', { variant: 'eyebrow', tone: 'muted' }), createText('Good evening', { variant: 'headline' })).el },
              createCard({ title: 'Climate', body: createText('21.5° and 46% humidity.', { tone: 'muted' }) }).el,
              createCard({ title: 'Lights', body: createText('Kitchen light and 2 others are on.', { tone: 'muted' }) }).el,
            ).el,
          ),
        ]),
      ).el;
    },
  },
  {
    id: 'stack',
    render: () => {
      const gaps: Space[] = ['xs', 'md', 'xl'];
      return createStack(
        { gap: 'lg' },
        caption('Stack (column), gap md'),
        createStack({}, box('Living room'), box('Kitchen'), box('Bedroom')).el,
        caption('Row: gaps xs, md, xl'),
        ...gaps.map((gap) => createRow({ gap }, box(gap), box('Kitchen'), box('Bedroom')).el),
        caption('Row, space between'),
        createRow({ justify: 'between' }, createText('Kitchen light', { variant: 'label' }), createButton({ label: 'Turn off', variant: 'secondary', size: 'small' }).el).el,
        caption('Grid: columns fill the width (small, medium)'),
        createGrid({ min: 'small', gap: 'sm' }, ...['Hall', 'Kitchen', 'Office', 'Garden', 'Garage', 'Attic'].map(box)).el,
        createGrid({}, box('Living room'), box('Kitchen'), box('Bedroom')).el,
      ).el;
    },
  },
  {
    id: 'split-pane',
    render: () => {
      const status = log();
      const list = createList({ label: 'Rooms', items: rooms.slice(0, 6).map((title) => ({ title, icon: 'home', onClick: () => undefined })) }).el;
      const detail = createStack({ gap: 'sm' }, createText('Living room', { variant: 'title' }), muted('3 lights on, 21.5° and 46% humidity.'), muted('Drag the divider, or focus it and use the arrow keys. Enter folds the room list away.')).el;
      detail.style.padding = 'var(--mh-space-md)';
      const side = createSplitPane({
        start: list,
        end: detail,
        size: 35,
        min: 25,
        max: 65,
        collapsible: 'start',
        label: 'Resize room list',
        startLabel: 'Rooms',
        onResize: (s) => (status.textContent = `Room list at ${s}%`),
        onCollapse: (c) => (status.textContent = c ? 'Room list folded away' : 'Room list shown'),
      });
      const stacked = createSplitPane({
        orientation: 'vertical',
        start: h('div', { style: 'padding: var(--mh-space-md)' }, createText('Camera: Porch', { variant: 'label' })),
        end: h('div', { style: 'padding: var(--mh-space-md)' }, muted('Motion at 14:02, 13:40 and 09:15.')),
        size: 60,
        label: 'Resize camera and events',
      });
      return createStack(
        { gap: 'lg' },
        caption('Side by side, start pane collapsible'),
        fixedFrame(320, side.el),
        status,
        caption('Stacked'),
        fixedFrame(260, stacked.el),
      ).el;
    },
  },
  {
    id: 'panel',
    render: () => {
      const tool = createPanel({
        title: 'Lights',
        icon: 'lightbulb',
        description: '3 of 5 on',
        actions: [iconButton('more', 'Light options')],
        body: [createSwitch({ label: 'Ceiling', row: true, checked: true }).el, createSwitch({ label: 'Floor lamp', row: true }).el],
        footer: [createButton({ label: 'All off', variant: 'secondary', size: 'small' }).el],
      });
      const collapsible = createPanel({ title: 'Advanced', collapsible: true, open: false, body: muted('Transition time, default brightness and power-on behaviour.') });
      const section = createPanel({
        title: 'Display',
        variant: 'section',
        flush: true,
        body: createList({
          items: [
            { title: 'Brightness', trailing: '70%', chevron: true, onClick: () => undefined },
            { title: 'Screen off after', trailing: '2 min', chevron: true, onClick: () => undefined },
          ],
        }).el,
        footer: 'The screen dims at night in the bedroom theme.',
      });
      const sectionCollapsible = createPanel({ title: 'Network', variant: 'section', collapsible: true, body: [createSwitch({ label: 'Reconnect automatically', row: true, checked: true }).el] });
      return createStack({ gap: 'lg' }, caption('Tool panel'), tool.el, caption('Collapsible'), collapsible.el, caption('Settings sections'), section.el, sectionCollapsible.el).el;
    },
  },
  {
    id: 'panel-group',
    render: () => {
      const lines = (n: number, prefix: string): HTMLElement => createStack({ gap: 'xs' }, ...Array.from({ length: n }, (_, i) => createText(`${prefix} ${i + 1}`, { variant: 'mono', tone: 'muted' }))).el;
      const dock = createPanelGroup({
        label: 'Diagnostics',
        panels: [
          { id: 'events', label: 'Events', icon: 'bell', badge: 4, content: lines(4, 'Motion in the hall, event') },
          { id: 'devices', label: 'Devices', icon: 'wifi', content: muted('12 devices online, 1 asleep.') },
          { id: 'logs', label: 'Logs', icon: 'info', content: lines(3, 'Info: heartbeat') },
          { id: 'trace', label: 'Trace', disabled: true },
        ],
        actions: [iconButton('refresh', 'Refresh')],
        collapsible: true,
      });
      return fixedFrame(300, h('div', { style: 'flex: 1; display: flex; flex-direction: column; justify-content: flex-end; padding: var(--mh-space-sm)' }, dock.el));
    },
  },
  {
    id: 'scroll-panel',
    render: () => {
      const list = createList({ items: rooms.map((title, i) => ({ title, subtitle: `${i + 1} device${i ? 's' : ''}`, icon: 'home' })) }).el;
      const chips = h('div', { style: 'display: flex; gap: var(--mh-space-xs); width: max-content' }, ...rooms.map((r) => createButton({ label: r, variant: 'secondary', size: 'small' }).el));
      return createStack(
        { gap: 'lg' },
        caption('Vertical, medium, edges fade while there is more'),
        createScrollPanel({ label: 'Rooms' }, list).el,
        caption('Small, inset well'),
        createScrollPanel({ label: 'Event log', size: 'small', inset: true }, ...Array.from({ length: 12 }, (_, i) => createText(`14:${String(59 - i).padStart(2, '0')}  Hall motion`, { variant: 'mono', tone: 'muted' }))).el,
        caption('Horizontal'),
        createScrollPanel({ label: 'Room shortcuts', axis: 'x', size: 'small' }, chips).el,
      ).el;
    },
  },
  {
    id: 'toolbar',
    render: () => {
      const bar = createToolbar({
        label: 'Floor plan',
        items: [
          iconButton('arrow-left', 'Undo'),
          iconButton('arrow-right', 'Redo'),
          'separator',
          iconButton('add', 'Add device'),
          iconButton('edit', 'Edit room', true),
          iconButton('delete', 'Remove'),
          'spacer',
          createButton({ label: 'Done', size: 'small' }).el,
        ],
      });
      const rail = createToolbar({
        label: 'Drawing tools',
        orientation: 'vertical',
        variant: 'floating',
        items: [iconButton('edit', 'Pen', true), iconButton('lightbulb', 'Place light'), iconButton('thermometer', 'Place sensor'), 'separator', iconButton('search', 'Zoom')],
      });
      const floating = createToolbar({ label: 'Media', variant: 'floating', items: [iconButton('previous', 'Previous'), iconButton('pause', 'Pause'), iconButton('next', 'Next'), 'separator', iconButton('volume-high', 'Volume')] });
      return createStack(
        { gap: 'lg' },
        caption('Toolbar: one tab stop, arrows move between controls'),
        bar.el,
        caption('Floating'),
        floating.el,
        caption('Vertical tool rail'),
        createRow({ align: 'start' }, rail.el, h('div', { class: 'ex-card', style: 'flex: 1; min-height: 220px' }, 'Canvas')).el,
      ).el;
    },
  },
  {
    id: 'status-bar',
    render: () => {
      const bar = createStatusBar({
        label: 'Hub status',
        items: [
          { id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' },
          { id: 'devices', label: 'Devices', value: '24' },
          { id: 'updates', label: '2 updates', icon: 'download', tone: 'accent', end: true, onClick: () => undefined },
          { id: 'time', label: 'Synced', value: '14:02', end: true, announce: true },
        ],
      });
      let offline = false;
      const toggle = createButton({
        label: 'Toggle connection',
        variant: 'secondary',
        size: 'small',
        onClick: () => {
          offline = !offline;
          bar.setItem('net', offline ? { label: 'Offline', icon: 'error', tone: 'danger' } : { label: 'Connected', icon: 'wifi', tone: 'success' });
        },
      });
      const warn = createStatusBar({ items: [{ id: 'b', label: 'Hall sensor battery', value: '12%', icon: 'warning', tone: 'warning' }, { id: 'm', label: 'Away mode', end: true }] });
      return createStack(
        { gap: 'lg' },
        caption('At the bottom of a frame'),
        fixedFrame(200, h('div', { style: 'flex: 1; padding: var(--mh-space-md)' }, muted('Content')), bar.el),
        toggle.el,
        caption('Warning tone'),
        warn.el,
      ).el;
    },
  },
  {
    id: 'app-shell',
    render: () => {
      const navButtons = (vertical: boolean): HTMLElement =>
        h(
          'nav',
          { 'aria-label': 'Sections', style: `display: flex; ${vertical ? 'flex-direction: column; padding-inline: var(--mh-space-xs)' : 'justify-content: space-around; border-top: var(--mh-border-width) solid var(--mh-divider); background: var(--mh-surface)'}; gap: var(--mh-space-xxs)` },
          iconButton('home', 'Home', true),
          iconButton('lightbulb', 'Lights'),
          iconButton('thermometer', 'Climate'),
          iconButton('settings', 'Settings'),
        );
      const cards = (): HTMLElement[] => [
        createCard({ title: 'Climate', body: muted('21.5° and 46% humidity.') }).el,
        createCard({ title: 'Lights', body: muted('Kitchen light and 2 others are on.') }).el,
        createCard({ title: 'Doors', body: muted('All locked.') }).el,
      ];
      const shell = (navPosition: 'start' | 'bottom'): HTMLElement => {
        const a = createAppShell(
          {
            title: 'Home',
            subtitle: 'Living room',
            leading: iconButton('menu', 'Menu'),
            actions: [iconButton('search', 'Search'), iconButton('bell', 'Notifications')],
            nav: navButtons(navPosition === 'start'),
            navPosition,
            status: createStatusBar({ items: [{ id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' }, { id: 't', label: 'Synced', value: '14:02', end: true }] }).el,
            label: 'Home',
          },
          createGrid({ min: 'small' }, ...cards()).el,
          ...cards(),
        );
        // In the gallery the frame fills a box rather than the window.
        a.el.style.height = '100%';
        a.el.style.minHeight = '0';
        return fixedFrame(440, a.el);
      };
      return createStack({ gap: 'lg' }, caption('Navigation rail at the start (tablets, TVs)'), shell('start'), caption('Navigation at the bottom (phones, watches)'), shell('bottom')).el;
    },
  },
  {
    id: 'reorderable-list',
    render: () => {
      const order = createText('Order: Living room, Kitchen, Hall, Bedroom, Office', { variant: 'caption', tone: 'muted' });
      const names = new Map(rooms.map((r, i) => [`r${i}`, r]));
      const list = createReorderableList({
        label: 'Room order on the dashboard',
        items: rooms.slice(0, 5).map((label, i) => ({ id: `r${i}`, label, icon: 'home', description: i === 0 ? 'Shown first' : undefined, trailing: i === 1 ? createSwitch({ ariaLabel: `Show ${label}`, checked: true }).el : undefined })),
        onChange: (ids) => (order.textContent = `Order: ${ids.map((id) => names.get(id)).join(', ')}`),
      });
      return createStack(
        { gap: 'md' },
        caption('Drag a handle, or focus it and press Space, then the arrow keys'),
        list.el,
        order,
      ).el;
    },
  },
  {
    id: 'swipe-row',
    render: () => {
      const status = log();
      const row = (label: string, subtitle: string, full = false): HTMLElement =>
        createSwipeRow({
          label,
          content: createStack({ gap: 'none' }, createText(label, { variant: 'label' }), createText(subtitle, { variant: 'caption', tone: 'muted' })).el,
          start: [{ id: 'fav', label: 'Favourite', icon: 'star', tone: 'accent' }],
          end: [
            { id: 'edit', label: 'Edit', icon: 'edit' },
            { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' },
          ],
          fullSwipe: full,
          onAction: (id) => (status.textContent = `${id} on ${label}`),
        }).el;
      const reminder = createSwipeRow({
        label: 'Water the plants',
        content: createText('Water the plants', { variant: 'label' }),
        end: [{ id: 'done', label: 'Done', icon: 'check', tone: 'success' }],
        fullSwipe: true,
        onAction: () => (status.textContent = 'Reminder done'),
      }).el;
      return createStack(
        { gap: 'sm' },
        caption('Swipe left or right; the actions button opens them from the keyboard'),
        row('Kitchen light', 'On, 80%'),
        row('Hall sensor', 'Battery 12%'),
        caption('Full swipe runs the first action'),
        row('Porch camera', 'Motion at 14:02', true),
        reminder,
        status,
      ).el;
    },
  },
  {
    id: 'onboarding',
    render: () => {
      const status = log();
      const intro = createOnboarding({
        steps: [
          { title: 'Welcome home', text: 'Every room, light and sensor on one screen.', icon: 'home' },
          { title: 'Group by room', text: 'Rooms keep the dashboard short. Reorder them any time.', icon: 'lightbulb' },
          { title: 'Stay in the loop', text: 'Get a gentle chime when a door is left open.', icon: 'bell', content: createSwitch({ label: 'Allow notifications', row: true, checked: true }).el },
          { title: 'All set', text: 'Swipe, tap or use the arrow keys to move around.', icon: 'check' },
        ],
        onDone: () => (status.textContent = 'Done'),
        onSkip: () => (status.textContent = 'Skipped'),
        onStepChange: (i) => (status.textContent = `Step ${i + 1}`),
      });
      return createStack({ gap: 'sm' }, fixedFrame(460, intro.el), status).el;
    },
  },
];
